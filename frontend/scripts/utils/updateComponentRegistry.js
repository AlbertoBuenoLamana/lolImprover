/**
 * Component Registry Update Utility
 * 
 * This utility automatically updates both TypeScript and JavaScript component registries
 * when a new component is created. This ensures the component registry is always up to date
 * and reduces the need for manual updates.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Define paths to registry files
const TS_REGISTRY_PATH = path.join(process.cwd(), 'src', 'utils', 'ComponentRegistry.ts');
const JS_REGISTRY_PATH = path.join(process.cwd(), 'scripts', 'utils', 'ComponentRegistry.js');

// Map category to collection name in registry
const CATEGORY_COLLECTIONS = {
  'ui': 'uiComponents',
  'layout': 'layoutComponents',
  'feature': 'featureComponents',
  'page': 'pageComponents',
  'auth': 'authComponents',
  'form': 'formComponents',
  'util': 'utilComponents'
};

/**
 * Update the TypeScript component registry file
 * @param {string} componentName - The name of the component
 * @param {string} componentPath - The path to the component file
 * @param {string} description - A description of the component
 * @param {string} category - The category of the component
 * @returns {boolean} - Whether the update was successful
 */
function updateTsRegistry(componentName, componentPath, description, category) {
  try {
    if (!fs.existsSync(TS_REGISTRY_PATH)) {
      console.log(chalk.yellow(`TypeScript registry file not found at ${TS_REGISTRY_PATH}`));
      return false;
    }

    const tsRegistryContent = fs.readFileSync(TS_REGISTRY_PATH, 'utf-8');
    const collectionName = CATEGORY_COLLECTIONS[category.toLowerCase()];

    if (!collectionName) {
      console.log(chalk.yellow(`Unknown category: ${category}`));
      return false;
    }

    // Find the relevant component collection
    const collectionRegex = new RegExp(`(export\\s+const\\s+${collectionName}\\s*=\\s*{[\\s\\S]*?})\\};`, 'm');
    const match = tsRegistryContent.match(collectionRegex);

    if (!match) {
      console.log(chalk.yellow(`Collection ${collectionName} not found in TypeScript registry`));
      return false;
    }

    const newComponentEntry = `
  ${componentName}: {
    name: '${componentName}',
    path: '${componentPath}',
    description: '${description}',
    category: '${category}',
    dependencies: [],
    usedBy: [],
  },`;

    // Insert the new component entry before the end of the collection
    const updatedContent = tsRegistryContent.replace(
      collectionRegex,
      `$1${newComponentEntry}\n};`
    );

    fs.writeFileSync(TS_REGISTRY_PATH, updatedContent, 'utf-8');
    return true;
  } catch (error) {
    console.log(chalk.red(`Error updating TypeScript registry: ${error.message}`));
    return false;
  }
}

/**
 * Update the JavaScript component registry file
 * @param {string} componentName - The name of the component
 * @param {string} componentPath - The path to the component file
 * @param {string} description - A description of the component
 * @param {string} category - The category of the component
 * @returns {boolean} - Whether the update was successful
 */
function updateJsRegistry(componentName, componentPath, description, category) {
  try {
    if (!fs.existsSync(JS_REGISTRY_PATH)) {
      console.log(chalk.yellow(`JavaScript registry file not found at ${JS_REGISTRY_PATH}`));
      return false;
    }

    const jsRegistryContent = fs.readFileSync(JS_REGISTRY_PATH, 'utf-8');
    const collectionName = CATEGORY_COLLECTIONS[category.toLowerCase()];

    if (!collectionName) {
      console.log(chalk.yellow(`Unknown category: ${category}`));
      return false;
    }

    // Find the relevant component collection
    const collectionRegex = new RegExp(`(exports\\.${collectionName}\\s*=\\s*{[\\s\\S]*?})\\};`, 'm');
    const match = jsRegistryContent.match(collectionRegex);

    if (!match) {
      console.log(chalk.yellow(`Collection ${collectionName} not found in JavaScript registry`));
      return false;
    }

    const newComponentEntry = `
  ${componentName}: {
    name: '${componentName}',
    path: '${componentPath}',
    description: '${description}',
    category: '${category}',
    dependencies: [],
    usedBy: [],
  },`;

    // Insert the new component entry before the end of the collection
    const updatedContent = jsRegistryContent.replace(
      collectionRegex,
      `$1${newComponentEntry}\n};`
    );

    fs.writeFileSync(JS_REGISTRY_PATH, updatedContent, 'utf-8');
    return true;
  } catch (error) {
    console.log(chalk.red(`Error updating JavaScript registry: ${error.message}`));
    return false;
  }
}

/**
 * Check if a component exists in the registry
 * @param {string} componentName - The name of the component to check
 * @returns {boolean} - Whether the component exists
 */
function componentExists(componentName) {
  try {
    // Check TypeScript registry
    if (fs.existsSync(TS_REGISTRY_PATH)) {
      const tsRegistryContent = fs.readFileSync(TS_REGISTRY_PATH, 'utf-8');
      if (tsRegistryContent.includes(`${componentName}: {`)) {
        return true;
      }
    }

    // Check JavaScript registry
    if (fs.existsSync(JS_REGISTRY_PATH)) {
      const jsRegistryContent = fs.readFileSync(JS_REGISTRY_PATH, 'utf-8');
      if (jsRegistryContent.includes(`${componentName}: {`)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.log(chalk.red(`Error checking component existence: ${error.message}`));
    return false;
  }
}

/**
 * Update both TypeScript and JavaScript component registries
 * @param {string} componentName - The name of the component
 * @param {string} componentPath - The path to the component file
 * @param {string} description - A description of the component
 * @param {string} category - The category of the component
 * @returns {boolean} - Whether both updates were successful
 */
function updateComponentRegistry(componentName, componentPath, description, category) {
  const tsUpdated = updateTsRegistry(componentName, componentPath, description, category);
  const jsUpdated = updateJsRegistry(componentName, componentPath, description, category);

  if (tsUpdated && jsUpdated) {
    console.log(chalk.green(`Both TypeScript and JavaScript registries updated for ${componentName}`));
    return true;
  } else if (tsUpdated) {
    console.log(chalk.yellow(`Only TypeScript registry updated for ${componentName}`));
    return true;
  } else if (jsUpdated) {
    console.log(chalk.yellow(`Only JavaScript registry updated for ${componentName}`));
    return true;
  } else {
    console.log(chalk.red(`Failed to update any registry for ${componentName}`));
    return false;
  }
}

module.exports = {
  updateComponentRegistry,
  componentExists
}; 