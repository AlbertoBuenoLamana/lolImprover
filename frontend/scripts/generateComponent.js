/**
 * Component Template Generator Script
 * 
 * This script generates a new component with the proper structure and documentation.
 * Usage: node generateComponent.js ComponentName "Component Description" category
 * Example: node generateComponent.js VideoCard "Card displaying video information" ui
 */

const fs = require('fs');
const path = require('path');
const { generateComponentTemplate } = require('./utils/ComponentDocumentationGenerator');
const { updateComponentRegistry, componentExists, detectComponentDependencies } = require('./utils/updateComponentRegistry');
const { showPostCreateAnnouncement } = require('./utils/postCreateAnnouncement');
const chalk = require('chalk');

// Get command line arguments
const [,, componentName, description, category = 'ui'] = process.argv;

if (!componentName) {
  console.error('Error: Component name is required');
  console.log('Usage: node generateComponent.js ComponentName "Component Description" category');
  process.exit(1);
}

if (!description) {
  console.error('Error: Component description is required');
  console.log('Usage: node generateComponent.js ComponentName "Component Description" category');
  process.exit(1);
}

// Validate category
const validCategories = ['layout', 'ui', 'page', 'feature', 'auth', 'form', 'util'];
if (!validCategories.includes(category)) {
  console.error(`Error: Invalid category. Must be one of: ${validCategories.join(', ')}`);
  process.exit(1);
}

// Check if component exists in registry first
if (componentExists(componentName)) {
  console.error(chalk.red(`Error: Component ${componentName} already exists in the registry.`));
  process.exit(1);
}

// Determine the component directory based on the category
let componentDir;
switch (category) {
  case 'layout':
    componentDir = path.join(__dirname, '..', 'src', 'components', 'Layout');
    break;
  case 'auth':
    componentDir = path.join(__dirname, '..', 'src', 'components', 'Auth');
    break;
  case 'page':
    // For pages, we determine the directory based on the component name
    if (componentName.includes('Video')) {
      componentDir = path.join(__dirname, '..', 'src', 'pages', 'Videos');
    } else if (componentName.includes('GameSession')) {
      componentDir = path.join(__dirname, '..', 'src', 'pages', 'GameSessions');
    } else if (componentName.includes('Admin')) {
      componentDir = path.join(__dirname, '..', 'src', 'pages', 'Admin');
    } else if (componentName.includes('Auth') || componentName.includes('Login') || componentName.includes('Register')) {
      componentDir = path.join(__dirname, '..', 'src', 'pages', 'Auth');
    } else {
      componentDir = path.join(__dirname, '..', 'src', 'pages');
    }
    break;
  default:
    // For UI, feature, form, and util components, create in components directory
    componentDir = path.join(__dirname, '..', 'src', 'components', category.charAt(0).toUpperCase() + category.slice(1));
    break;
}

// Ensure the component directory exists
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// Generate the component template
const componentTemplate = generateComponentTemplate(componentName, description, category);

// Write the component file
const componentFilePath = path.join(componentDir, `${componentName}.tsx`);
if (fs.existsSync(componentFilePath)) {
  console.error(chalk.red(`Error: File ${componentFilePath} already exists.`));
  process.exit(1);
}

fs.writeFileSync(componentFilePath, componentTemplate);

// Generate types file for page components
if (category === 'page') {
  const typesTemplate = `import React from 'react';

export interface ${componentName}Props {
  // Add props here
}
`;
  const typesFilePath = path.join(componentDir, `${componentName}.d.ts`);
  fs.writeFileSync(typesFilePath, typesTemplate);
}

// Get the relative path for the registry
const relativeComponentPath = path.relative(
  path.join(__dirname, '..', 'src'),
  componentFilePath
).replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes

// Detect dependencies first, so we can pass them to the announcement
const dependencies = detectComponentDependencies(componentFilePath);

// Update the component registry with automatic dependency detection
const registryUpdated = updateComponentRegistry(
  componentName,
  relativeComponentPath,
  description,
  category,
  true // Enable automatic dependency detection
);

console.log(chalk.green(`Component ${componentName} created at ${componentFilePath}`));

if (registryUpdated) {
  console.log(chalk.green('Component registry updated successfully.'));
} else {
  console.log(chalk.yellow('Warning: Failed to update component registry.'));
}

// Show post-creation announcement with dependencies
showPostCreateAnnouncement(componentName, category, registryUpdated, dependencies); 