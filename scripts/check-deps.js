#!/usr/bin/env node
/**
 * Checks that all imported packages are in dependencies (not devDependencies).
 * Run with: node scripts/check-deps.js
 */

const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

// Packages that are legitimately build-time only (not imported at runtime)
const buildTimeOnly = [
  'typescript',
  'eslint',
  '@eslint/eslintrc',
  'eslint-config-next',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'tailwindcss',
  '@tailwindcss/postcss',
  'postcss',
  'autoprefixer',
];

const issues = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Match import statements
  const importRegex = /(?:import|from)\s+['"]([^'"./][^'"]*)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const pkg = match[1].split('/')[0].startsWith('@')
      ? match[1].split('/').slice(0, 2).join('/')
      : match[1].split('/')[0];

    if (devDependencies.includes(pkg) && !buildTimeOnly.includes(pkg)) {
      issues.push({
        file: filePath,
        package: pkg,
        message: `"${pkg}" is imported but only in devDependencies`
      });
    }
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      checkFile(filePath);
    }
  }
}

// Check app code directories
['app', 'lib', 'components'].forEach(walkDir);

if (issues.length > 0) {
  console.error('\n❌ Dependency issues found:\n');
  issues.forEach(issue => {
    console.error(`  ${issue.file}`);
    console.error(`    → ${issue.message}`);
    console.error(`    → Move "${issue.package}" to dependencies\n`);
  });
  process.exit(1);
} else {
  console.log('✅ All runtime imports are in dependencies');
}
