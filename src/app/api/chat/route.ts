import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import { RESPONSE_TEMPLATES } from '@/lib/chat/constants';
import { getOrCreateContext, saveContext } from '@/lib/chat/conversation-manager';
import { generateResponse } from '@/lib/chat/response-generator';
import { getRandomResponse } from '@/lib/chat/utils';
import { validateChatInput, validateSessionId } from '@/lib/input-validation';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await rateLimiter.checkLimit(clientId);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Too many requests", 
          answer: getRandomResponse(RESPONSE_TEMPLATES.rateLimited),
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000))
          }
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (_error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    // Validate question input
    const validationResult = validateChatInput(body.question);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.errors.join(', ') }, 
        { status: 400 }
      );
    }

    const question = validationResult.sanitized!;

    // Validate session ID
    const sessionId = body.sessionId;
    if (!validateSessionId(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" }, 
        { status: 400 }
      );
    }

    // Get or create conversation context
    const context = getOrCreateContext(sessionId);

    // Generate response
    const { answer, context: newContext } = generateResponse(question, context);
    saveContext(sessionId, newContext);

    // Return response with rate limit headers
    return NextResponse.json(
      { answer },
      {
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (_error) {
    console.error("❌ Error in /api/chat:", _error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { answer: "I'm having trouble processing your question at the moment. Please try again shortly." },
      { status: 500 }
    );
  }
}
