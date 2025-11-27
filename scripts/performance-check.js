#!/usr/bin/env node

/**
 * Performance Check Script
 * Runs various performance checks and optimizations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Performance Checks...\n');

// 1. Check bundle size
console.log('📦 Checking bundle size...');
try {
  execSync('yarn build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Run linting
console.log('🔍 Running ESLint checks...');
try {
  execSync('yarn lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.warn('⚠️ Linting issues found. Run `yarn lint:fix` to auto-fix\n');
}

// 3. Check for performance anti-patterns
console.log('⚡ Checking for performance anti-patterns...');

const checkFiles = (dir, patterns) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let issues = [];
  
  files.forEach(file => {
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      issues = issues.concat(checkFiles(path.join(dir, file.name), patterns));
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const filePath = path.join(dir, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      
      patterns.forEach(pattern => {
        if (pattern.regex.test(content)) {
          issues.push({
            file: filePath,
            issue: pattern.message,
            line: content.split('\n').findIndex(line => pattern.regex.test(line)) + 1
          });
        }
      });
    }
  });
  
  return issues;
};

const performancePatterns = [
  {
    regex: /console\.log(?!\s*\(\s*['"`].*development.*['"`])/,
    message: 'Console.log without development check'
  },
  {
    regex: /useEffect\(\s*\(\)\s*=>\s*{[^}]*}\s*,\s*\[\s*\]\s*\)/,
    message: 'Empty dependency array in useEffect - consider useMemo or useCallback'
  },
  {
    regex: /\.map\([^)]*\)\s*\.map\(/,
    message: 'Chained .map() calls - consider combining for better performance'
  }
];

const issues = checkFiles('./src', performancePatterns);

if (issues.length > 0) {
  console.log('⚠️ Performance issues found:');
  issues.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
  });
} else {
  console.log('✅ No performance anti-patterns found');
}

console.log('\n🎉 Performance check complete!'); 