import { describe, expect, it } from 'vitest';

import { buildCvNarrativeSection, classifyCvNarrativeKind, clampNarrativeBody } from '@/parser/cvNarrativeExtraction';

describe('cvNarrativeExtraction', () => {
  it('classifies anchored service headers conservatively', () => {
    expect(
      classifyCvNarrativeKind({
        type: 'services',
        title: 'Teaching Experiences',
      }),
    ).toBe('teaching');
    expect(
      classifyCvNarrativeKind({
        type: 'services',
        title: 'Professional Services',
      }),
    ).toBe('professional_services');
    expect(
      classifyCvNarrativeKind({
        type: 'services',
        title: 'Journal and Conference Reviews',
      }),
    ).toBe('editorial_reviews');
    expect(
      classifyCvNarrativeKind({
        type: 'services',
        title: 'Some Other Services Header',
      }),
    ).toBe('other');
  });

  it('maps workshops and skills and academic narrative kinds', () => {
    expect(classifyCvNarrativeKind({ type: 'workshops', title: 'Workshops and Exhibitions' })).toBe(
      'workshops_exhibitions',
    );
    expect(classifyCvNarrativeKind({ type: 'skills', title: 'Skills' })).toBe('skills');
    expect(
      classifyCvNarrativeKind({ type: 'academic_narrative', title: 'Academic Leadership and Supervision' }),
    ).toBe('leadership_supervision');
  });

  it('buildCvNarrativeSection returns null for empty body', () => {
    expect(
      buildCvNarrativeSection(
        { type: 'skills', title: 'Skills', content: '   ', confidence: 0.9 },
        0,
      ),
    ).toBeNull();
  });

  it('clampNarrativeBody applies a hard cap with notice', () => {
    const body = 'x'.repeat(100);
    const capped = clampNarrativeBody(body, 40);
    expect(capped.length).toBeLessThan(body.length);
    expect(capped).toContain('Truncated');
  });
});
