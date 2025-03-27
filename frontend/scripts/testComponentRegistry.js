/**
 * Test Component Registry Script
 * 
 * This script tests the component registry functionality.
 */

const fs = require('fs');
const path = require('path');
const {
  getAllComponents,
  findComponentByName,
  findComponentsByCategory
} = require('./utils/ComponentRegistry');

console.log('=== TEST COMPONENT REGISTRY ===');

// Create a string to hold all output
let output = '=== COMPONENT REGISTRY TEST RESULTS ===\n\n';

// Test getAllComponents
const allComponents = getAllComponents();
output += `Total components: ${allComponents.length}\n`;

// Test findComponentByName
const videoCard = findComponentByName('VideoCard');
output += '\nTesting findComponentByName("VideoCard"):\n';
if (videoCard) {
  output += `- Name: ${videoCard.name}\n`;
  output += `- Path: ${videoCard.path}\n`;
  output += `- Description: ${videoCard.description}\n`;
  output += `- Category: ${videoCard.category}\n`;
} else {
  output += 'VideoCard component not found!\n';
}

// Test findComponentsByCategory
const uiComponents = findComponentsByCategory('ui');
output += '\nTesting findComponentsByCategory("ui"):\n';
output += `Found ${uiComponents.length} UI components:\n`;
uiComponents.forEach(comp => {
  output += `- ${comp.name}: ${comp.description}\n`;
});

// List all component names by category
output += '\nAll components by category:\n';
const componentsByCategory = {};

allComponents.forEach(comp => {
  if (!componentsByCategory[comp.category]) {
    componentsByCategory[comp.category] = [];
  }
  componentsByCategory[comp.category].push(comp.name);
});

Object.entries(componentsByCategory).forEach(([category, components]) => {
  output += `\n${category.charAt(0).toUpperCase() + category.slice(1)} components (${components.length}):\n`;
  components.forEach(name => {
    output += `- ${name}\n`;
  });
});

output += '\n=== TEST COMPLETE ===';

// Write output to file
const outputPath = path.join(__dirname, 'registry-test-output.txt');
fs.writeFileSync(outputPath, output);

console.log(`Test complete. Results written to: ${outputPath}`); 