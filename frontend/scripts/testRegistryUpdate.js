/**
 * Test Registry Update Utility
 * 
 * This script tests the functionality of the automated registry updates
 * by creating a test component entry and checking if it was added to the registries.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { updateComponentRegistry } = require('./utils/updateComponentRegistry');

console.log(chalk.bold.blue('='.repeat(60)));
console.log(chalk.bold.blue('Testing Automated Registry Update Functionality'));
console.log(chalk.bold.blue('='.repeat(60)));

// Generate a test component name with timestamp to avoid conflicts
const timestamp = Date.now();
const testComponentName = `TestComponent${timestamp}`;
const componentPath = 'src/components/Ui/TestButton.tsx';
const description = 'Test component for registry update';
const category = 'ui';

console.log(chalk.yellow('\nTest Details:'));
console.log(chalk.white(`Component Name: ${chalk.cyan(testComponentName)}`));
console.log(chalk.white(`Component Path: ${chalk.cyan(componentPath)}`));
console.log(chalk.white(`Description: ${chalk.cyan(description)}`));
console.log(chalk.white(`Category: ${chalk.cyan(category)}`));

console.log(chalk.yellow('\nAttempting to update registry...'));

// Try to update the registry
const result = updateComponentRegistry(testComponentName, componentPath, description, category);

if (result) {
  console.log(chalk.green('\n✅ Registry update successful!'));
  
  // Paths to registry files
  const tsRegistryPath = path.join(process.cwd(), 'src', 'utils', 'ComponentRegistry.ts');
  const jsRegistryPath = path.join(process.cwd(), 'scripts', 'utils', 'ComponentRegistry.js');
  
  // Verify the component was added to both registries
  let tsVerified = false;
  let jsVerified = false;
  
  // Check TypeScript registry
  if (fs.existsSync(tsRegistryPath)) {
    const tsContent = fs.readFileSync(tsRegistryPath, 'utf-8');
    if (tsContent.includes(testComponentName)) {
      console.log(chalk.green('✅ Component found in TypeScript registry'));
      tsVerified = true;
    } else {
      console.log(chalk.red('❌ Component not found in TypeScript registry'));
    }
  } else {
    console.log(chalk.yellow('⚠️ TypeScript registry file not found'));
  }
  
  // Check JavaScript registry
  if (fs.existsSync(jsRegistryPath)) {
    const jsContent = fs.readFileSync(jsRegistryPath, 'utf-8');
    if (jsContent.includes(testComponentName)) {
      console.log(chalk.green('✅ Component found in JavaScript registry'));
      jsVerified = true;
    } else {
      console.log(chalk.red('❌ Component not found in JavaScript registry'));
    }
  } else {
    console.log(chalk.yellow('⚠️ JavaScript registry file not found'));
  }
  
  // Overall verification result
  if (tsVerified && jsVerified) {
    console.log(chalk.bold.green('\n🎉 TEST PASSED: Component added to both registries!'));
  } else if (tsVerified || jsVerified) {
    console.log(chalk.bold.yellow('\n⚠️ TEST PARTIALLY PASSED: Component added to only one registry'));
  } else {
    console.log(chalk.bold.red('\n❌ TEST FAILED: Component not found in any registry despite successful update'));
  }
} else {
  console.log(chalk.bold.red('\n❌ TEST FAILED: Registry update failed'));
}

console.log(chalk.yellow('\nNOTE: This was a test. In a real scenario, you may want to manually remove test entries.'));
console.log(chalk.bold.blue('='.repeat(60))); 