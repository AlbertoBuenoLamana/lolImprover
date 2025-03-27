/**
 * Directory Initialization Script
 * 
 * This script ensures that all required directories for the component system exist.
 * Run this script before other component-related scripts to ensure proper setup.
 */

const fs = require('fs');
const path = require('path');

console.log('=== DIRECTORY INITIALIZATION STARTING ===');

// Directories to ensure
const directories = [
  '../docs',
  '../src/components/Ui',
  '../src/components/Form',
  '../src/components/Feature',
  '../src/components/Util',
  './utils'  // Make sure the utils directory for our script helpers exists
];

console.log('Ensuring required directories exist...');

// Create directories if they don't exist
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating directory: ${fullPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
  } else {
    console.log(`Directory already exists: ${fullPath}`);
  }
});

console.log('Directory initialization complete.');
console.log('=== DIRECTORY INITIALIZATION FINISHED ==='); 