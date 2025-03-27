/**
 * Component Audit Script
 * 
 * This script performs an audit of all components in the codebase to:
 * 1. Find components not in the registry
 * 2. Find registry entries without corresponding files
 * 3. Verify component dependencies and usage
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { 
  getAllComponents, 
  uiComponents, 
  layoutComponents,
  featureComponents,
  pageComponents,
  authComponents,
  formComponents,
  utilComponents
} = require('./utils/ComponentRegistry');

// Configuration
const componentDirs = [
  { path: 'src/components/Layout', category: 'layout' },
  { path: 'src/components/Ui', category: 'ui' },
  { path: 'src/components/Feature', category: 'feature' },
  { path: 'src/components/Auth', category: 'auth' },
  { path: 'src/components/Form', category: 'form' },
  { path: 'src/components/Util', category: 'util' },
  { path: 'src/pages', category: 'page' }
];

console.log(chalk.bold.cyan('='.repeat(60)));
console.log(chalk.bold.cyan('🔍 COMPONENT AUDIT REPORT'));
console.log(chalk.bold.cyan('='.repeat(60)));

// Get all components from registry
const registryComponents = getAllComponents();
console.log(chalk.white(`\nFound ${chalk.cyan(Object.keys(registryComponents).length)} components in registry`));

// Store components found in filesystem
const filesystemComponents = new Map();
let missingFiles = 0;
let missingRegistry = 0;

// Find components in the filesystem
for (const dir of componentDirs) {
  const dirPath = path.join(process.cwd(), dir.path);
  if (!fs.existsSync(dirPath)) {
    console.log(chalk.yellow(`\n⚠️ Directory not found: ${dirPath}`));
    continue;
  }

  console.log(chalk.white(`\nScanning ${chalk.cyan(dir.path)} (${chalk.yellow(dir.category)})...`));
  
  // Walk through the directory recursively
  function scanDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') && !file.endsWith('.test.tsx') && !file.endsWith('.stories.tsx')) {
        // This looks like a component file
        const componentName = path.basename(file, '.tsx');
        
        if (componentName.match(/^[A-Z][A-Za-z0-9]*$/)) {
          const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
          filesystemComponents.set(componentName, {
            path: relativePath,
            category: dir.category
          });
          
          // Check if component is in registry
          const isInRegistry = !!registryComponents[componentName];
          if (!isInRegistry) {
            console.log(chalk.yellow(`  ↳ Component not in registry: ${chalk.red(componentName)} (${relativePath})`));
            missingRegistry++;
          } else {
            console.log(chalk.white(`  ↳ Found component: ${chalk.green(componentName)}`));
          }
        }
      }
    }
  }
  
  scanDirectory(dirPath);
}

// Find registry entries without files
console.log(chalk.white('\nChecking for registry entries without files...'));
for (const [name, component] of Object.entries(registryComponents)) {
  // Skip if the component has no path (should not happen)
  if (!component.path) {
    console.log(chalk.red(`  ↳ Registry entry has no path: ${name}`));
    continue;
  }
  
  const componentPath = path.join(process.cwd(), component.path);
  if (!fs.existsSync(componentPath)) {
    console.log(chalk.red(`  ↳ Component file not found: ${chalk.yellow(name)} (${component.path})`));
    missingFiles++;
  }
}

// Generate summary
console.log(chalk.bold.cyan('\n='.repeat(60)));
console.log(chalk.bold.cyan('📊 AUDIT SUMMARY'));
console.log(chalk.bold.cyan('='.repeat(60)));

console.log(chalk.white(`\nTotal components in registry: ${chalk.cyan(Object.keys(registryComponents).length)}`));
console.log(chalk.white(`Total components in filesystem: ${chalk.cyan(filesystemComponents.size)}`));
console.log(chalk.white(`Components missing from registry: ${missingRegistry > 0 ? chalk.red(missingRegistry) : chalk.green(missingRegistry)}`));
console.log(chalk.white(`Registry entries with missing files: ${missingFiles > 0 ? chalk.red(missingFiles) : chalk.green(missingFiles)}`));

// Calculate components by category
console.log(chalk.white('\nComponents by category:'));
console.log(chalk.white(`  UI Components: ${chalk.cyan(Object.keys(uiComponents).length)}`));
console.log(chalk.white(`  Layout Components: ${chalk.cyan(Object.keys(layoutComponents).length)}`));
console.log(chalk.white(`  Feature Components: ${chalk.cyan(Object.keys(featureComponents).length)}`));
console.log(chalk.white(`  Page Components: ${chalk.cyan(Object.keys(pageComponents).length)}`));
console.log(chalk.white(`  Auth Components: ${chalk.cyan(Object.keys(authComponents).length)}`));
console.log(chalk.white(`  Form Components: ${chalk.cyan(Object.keys(formComponents).length)}`));
console.log(chalk.white(`  Util Components: ${chalk.cyan(Object.keys(utilComponents).length)}`));

// Final status
if (missingRegistry === 0 && missingFiles === 0) {
  console.log(chalk.bold.green('\n✅ AUDIT PASSED: All components are properly registered!'));
} else {
  console.log(chalk.bold.yellow('\n⚠️ AUDIT FOUND ISSUES:'));
  
  if (missingRegistry > 0) {
    console.log(chalk.yellow(`  - ${missingRegistry} components need to be added to the registry`));
    console.log(chalk.white('    Use the updateComponentRegistry utility to add them:'));
    console.log(chalk.cyan('    const { updateComponentRegistry } = require("./scripts/utils/updateComponentRegistry");'));
    console.log(chalk.cyan('    updateComponentRegistry("ComponentName", "path/to/Component.tsx", "Description", "category");'));
  }
  
  if (missingFiles > 0) {
    console.log(chalk.yellow(`  - ${missingFiles} registry entries have missing files`));
    console.log(chalk.white('    Either create the missing component files or remove the entries from the registry.'));
  }
}

console.log(chalk.bold.cyan('\n='.repeat(60))); 