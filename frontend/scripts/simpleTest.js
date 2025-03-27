/**
 * Simple Test Script
 */

console.log('Starting simple test...');
console.log('Hello, world!');
console.log('Test complete.');

// Try to output to a file instead
const fs = require('fs');
const path = require('path');

const output = `
=== SIMPLE TEST OUTPUT ===
Hello, world!
Test complete at ${new Date().toISOString()}
=== END OF TEST ===
`;

fs.writeFileSync(path.join(__dirname, 'test-output.txt'), output); 