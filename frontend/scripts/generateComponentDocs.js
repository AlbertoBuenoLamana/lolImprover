/**
 * Component Documentation Generator Script
 * 
 * This script generates documentation for all components in the application.
 * Run this script whenever new components are added or existing ones are changed.
 */

const fs = require('fs');
const path = require('path');
const { 
  generateComponentReadme, 
  generateComponentDependencyGraph, 
  generateComponentUsageGuide 
} = require('./utils/ComponentDocumentationGenerator');

// Ensure docs directory exists
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Generate component documentation
const componentReadme = generateComponentReadme();
fs.writeFileSync(path.join(docsDir, 'COMPONENTS.md'), componentReadme);

// Generate component dependency graph
const dependencyGraph = generateComponentDependencyGraph();
fs.writeFileSync(path.join(docsDir, 'COMPONENT_DEPENDENCIES.md'), 
  `# Component Dependencies\n\n` +
  `This graph shows the dependencies between components in the application.\n\n` +
  '```mermaid\n' + dependencyGraph + '\n```'
);

// Generate component usage guide
const usageGuide = generateComponentUsageGuide();
fs.writeFileSync(path.join(docsDir, 'COMPONENT_USAGE_GUIDE.md'), usageGuide);

console.log('Component documentation generated successfully.'); 