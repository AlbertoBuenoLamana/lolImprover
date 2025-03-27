/**
 * Check Component Exists Utility
 * 
 * This script checks if a component with the given name already exists.
 * It's designed to be used by the Cursor IDE to prevent component duplication.
 * 
 * Usage: node checkComponentExists.js ComponentName
 */

const { findComponentByName, getAllComponents } = require('./ComponentRegistry');
const fs = require('fs');
const path = require('path');

// Create a string to hold output
let output = '=== CHECK COMPONENT EXISTS ===\n\n';

// Get component name from command line arguments
const componentName = process.argv[2];

output += `Checking for component: "${componentName}"\n`;
output += `Found ${getAllComponents().length} total components in registry\n`;

if (!componentName) {
  output += 'Error: Component name is required\n';
  output += 'Usage: node checkComponentExists.js ComponentName\n';
  
  // Write output to file
  const outputPath = path.join(__dirname, '..', 'check-component-output.txt');
  fs.writeFileSync(outputPath, output);
  console.log(`Check failed. Results written to: ${outputPath}`);
  
  process.exit(1);
}

// Find components with similar names (case insensitive)
const similarComponents = getAllComponents().filter(comp => 
  comp.name.toLowerCase().includes(componentName.toLowerCase()) ||
  componentName.toLowerCase().includes(comp.name.toLowerCase())
);

output += `Found ${similarComponents.length} similar components\n`;

// Check for exact match
const exactMatch = findComponentByName(componentName);
output += `Exact match found: ${!!exactMatch}\n`;

if (exactMatch) {
  output += `\nComponent "${componentName}" already exists:\n`;
  output += `- Path: ${exactMatch.path}\n`;
  output += `- Description: ${exactMatch.description}\n`;
  output += `- Category: ${exactMatch.category}\n`;
  
  // Check if the file actually exists
  const fullPath = path.join(__dirname, '..', '..', 'src', exactMatch.path);
  output += `Checking file at: ${fullPath}\n`;
  
  if (fs.existsSync(fullPath)) {
    output += `- File exists at: ${fullPath}\n`;
  } else {
    output += `- WARNING: Component is in registry but file not found at: ${fullPath}\n`;
  }
  
  output += '\n=== CHECK COMPONENT COMPLETE ===';
  
  // Write output to file
  const outputPath = path.join(__dirname, '..', 'check-component-output.txt');
  fs.writeFileSync(outputPath, output);
  console.log(`Component found. Results written to: ${outputPath}`);
  
  process.exit(0); // Exit with success code, component was found
} else if (similarComponents.length > 0) {
  // If no exact match but similar components exist
  output += `\nComponent "${componentName}" not found, but similar components exist:\n`;
  similarComponents.forEach(comp => {
    output += `- ${comp.name} (${comp.category}): ${comp.description}\n`;
    output += `  Path: ${comp.path}\n`;
  });
  
  output += '\n=== CHECK COMPONENT COMPLETE ===';
  
  // Write output to file
  const outputPath = path.join(__dirname, '..', 'check-component-output.txt');
  fs.writeFileSync(outputPath, output);
  console.log(`Similar components found. Results written to: ${outputPath}`);
  
  process.exit(0); // Exit with success code, similar components were found
} else {
  // No similar components found
  output += `\nComponent "${componentName}" does not exist. You can create it using:\n`;
  output += `npm run component:create ${componentName} "Component description" category\n`;
  
  output += '\n=== CHECK COMPONENT COMPLETE ===';
  
  // Write output to file
  const outputPath = path.join(__dirname, '..', 'check-component-output.txt');
  fs.writeFileSync(outputPath, output);
  console.log(`Component not found. Results written to: ${outputPath}`);
  
  process.exit(1); // Exit with error code, component not found
} 