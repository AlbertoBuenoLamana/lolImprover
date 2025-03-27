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
 * Analyze a component file to detect its dependencies
 * @param {string} componentPath - The path to the component file
 * @returns {string[]} - Array of component dependencies
 */
function detectComponentDependencies(componentPath) {
  try {
    const fullPath = path.join(process.cwd(), componentPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`Component file not found at ${fullPath}`));
      return [];
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const dependencies = [];
    
    // Get all registered components
    let allComponents = [];
    if (fs.existsSync(TS_REGISTRY_PATH)) {
      const tsContent = fs.readFileSync(TS_REGISTRY_PATH, 'utf-8');
      
      // Extract component names from all collections
      Object.values(CATEGORY_COLLECTIONS).forEach(collection => {
        const collectionRegex = new RegExp(`export\\s+const\\s+${collection}\\s*=\\s*{([\\s\\S]*?)}\\s*;`, 'm');
        const match = tsContent.match(collectionRegex);
        if (match && match[1]) {
          const componentMatches = match[1].match(/(\w+):\s*{/g);
          if (componentMatches) {
            allComponents = [...allComponents, ...componentMatches.map(m => m.replace(/:\s*{/g, '').trim())];
          }
        }
      });
    }
    
    // Check for imports of known components
    allComponents.forEach(component => {
      // Component can be imported directly or through named imports
      const directImportRegex = new RegExp(`import\\s+${component}\\s+from\\s+['"]`, 'm');
      const namedImportRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from\\s+['"]`, 'm');
      
      if (directImportRegex.test(content) || namedImportRegex.test(content)) {
        dependencies.push(component);
      }
      
      // Also check for usage in JSX
      const jsxRegex = new RegExp(`<${component}[\\s/>]`, 'g');
      if (jsxRegex.test(content)) {
        if (!dependencies.includes(component)) {
          dependencies.push(component);
        }
      }
    });
    
    return dependencies;
  } catch (error) {
    console.log(chalk.red(`Error detecting component dependencies: ${error.message}`));
    return [];
  }
}

/**
 * Update usedBy field in components that this component depends on
 * @param {string} componentName - The name of the component
 * @param {string[]} dependencies - Array of component names that this component depends on
 * @returns {boolean} - Whether the update was successful
 */
function updateUsedByForDependencies(componentName, dependencies) {
  if (!dependencies || dependencies.length === 0) {
    return true;
  }
  
  try {
    if (!fs.existsSync(TS_REGISTRY_PATH)) {
      console.log(chalk.yellow(`TypeScript registry file not found at ${TS_REGISTRY_PATH}`));
      return false;
    }
    
    let tsContent = fs.readFileSync(TS_REGISTRY_PATH, 'utf-8');
    let modified = false;
    
    // For each dependency, update its usedBy array to include this component
    dependencies.forEach(dependency => {
      // Find the dependency in the registry
      const dependencyRegex = new RegExp(`(${dependency}\\s*:\\s*{[\\s\\S]*?usedBy\\s*:\\s*\\[)([^\\]]*)\\]`, 'm');
      const match = tsContent.match(dependencyRegex);
      
      if (match) {
        const currentUsedBy = match[2].trim();
        const newUsedBy = currentUsedBy 
          ? currentUsedBy.includes(`'${componentName}'`) 
            ? currentUsedBy 
            : `${currentUsedBy}, '${componentName}'` 
          : `'${componentName}'`;
        
        tsContent = tsContent.replace(dependencyRegex, `$1${newUsedBy}]`);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(TS_REGISTRY_PATH, tsContent, 'utf-8');
      console.log(chalk.green(`Updated usedBy fields for ${dependencies.length} dependencies`));
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`Error updating usedBy fields: ${error.message}`));
    return false;
  }
}

/**
 * Update the TypeScript component registry file
 * @param {string} componentName - The name of the component
 * @param {string} componentPath - The path to the component file
 * @param {string} description - A description of the component
 * @param {string} category - The category of the component
 * @param {string[]} dependencies - Array of component dependencies (optional)
 * @returns {boolean} - Whether the update was successful
 */
function updateTsRegistry(componentName, componentPath, description, category, dependencies = []) {
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

    // Format dependencies array as string
    const dependenciesStr = dependencies.length > 0 
      ? dependencies.map(dep => `'${dep}'`).join(', ') 
      : '';

    const newComponentEntry = `
  ${componentName}: {
    name: '${componentName}',
    path: '${componentPath}',
    description: '${description}',
    category: '${category}',
    dependencies: [${dependenciesStr}],
    usedBy: [],
  },`;

    // Insert the new component entry before the end of the collection
    const updatedContent = tsRegistryContent.replace(
      collectionRegex,
      `$1${newComponentEntry}\n};`
    );

    fs.writeFileSync(TS_REGISTRY_PATH, updatedContent, 'utf-8');
    
    // Update usedBy field for dependencies
    if (dependencies.length > 0) {
      updateUsedByForDependencies(componentName, dependencies);
    }
    
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
 * @param {string[]} dependencies - Array of component dependencies (optional)
 * @returns {boolean} - Whether the update was successful
 */
function updateJsRegistry(componentName, componentPath, description, category, dependencies = []) {
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

    // Format dependencies array as string
    const dependenciesStr = dependencies.length > 0 
      ? dependencies.map(dep => `'${dep}'`).join(', ') 
      : '';

    const newComponentEntry = `
  ${componentName}: {
    name: '${componentName}',
    path: '${componentPath}',
    description: '${description}',
    category: '${category}',
    dependencies: [${dependenciesStr}],
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
 * @param {boolean} detectDependencies - Whether to automatically detect dependencies
 * @returns {boolean} - Whether both updates were successful
 */
function updateComponentRegistry(componentName, componentPath, description, category, detectDependencies = true) {
  // Detect dependencies if enabled
  const dependencies = detectDependencies ? detectComponentDependencies(componentPath) : [];
  
  if (dependencies.length > 0) {
    console.log(chalk.blue(`Detected ${dependencies.length} dependencies: ${dependencies.join(', ')}`));
  }
  
  const tsUpdated = updateTsRegistry(componentName, componentPath, description, category, dependencies);
  const jsUpdated = updateJsRegistry(componentName, componentPath, description, category, dependencies);

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
  componentExists,
  detectComponentDependencies
}; 