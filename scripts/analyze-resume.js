const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function analyzeResume() {
  try {
    const resumePath = path.join(process.cwd(), 'resume.docx');
    const result = await mammoth.extractRawText({ path: resumePath });
    
    const text = result.value;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    console.log('=== ALL LINES ===');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      // Check if it looks like a header
      const isHeader = trimmed.length < 100 && (
        trimmed === trimmed.toUpperCase() ||
        trimmed.endsWith(':') ||
        /^(EDUCATION|EXPERIENCE|PUBLICATIONS|PATENTS|AWARDS|RESEARCH|CONTACT|SKILLS|PROJECTS|GRANTS|JOURNAL|CONFERENCE|BOOK|CHAPTER|WORKSHOP|SERVICE|STUDENT|SUPERVISION|TEACHING|MEMBERSHIP|LEADERSHIP)/i.test(trimmed)
      );
      
      if (isHeader || i < 100) {
        console.log(`${i + 1}: ${isHeader ? '>>> HEADER: ' : ''}${trimmed}`);
      }
    });
    
    console.log('\n=== MAMMOTH MESSAGES ===');
    const htmlResult = await mammoth.convertToHtml({ path: resumePath });
    htmlResult.messages.forEach(msg => console.log(msg.type, msg.message));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeResume();

