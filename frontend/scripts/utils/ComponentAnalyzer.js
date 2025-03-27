/**
 * ComponentAnalyzer.js
 * 
 * CommonJS version of the ComponentAnalyzer for use in scripts.
 */

const { getAllComponents, findComponentByName } = require('./ComponentRegistry');

// Function to detect potential component duplications
const detectDuplicateComponents = () => {
  const allComponents = getAllComponents();
  const duplicates = [];
  
  // Group components by functionality based on name patterns
  const componentGroups = {};
  
  allComponents.forEach(comp => {
    // Strip common prefixes/suffixes to identify functional groups
    const baseName = comp.name
      .replace(/Page$/, '')
      .replace(/Component$/, '')
      .replace(/Form$/, '');
    
    if (!componentGroups[baseName]) {
      componentGroups[baseName] = [];
    }
    componentGroups[baseName].push(comp);
  });
  
  // Check for potential duplicates within functional groups
  Object.entries(componentGroups)
    .filter(([_, components]) => components.length > 1)
    .forEach(([groupName, components]) => {
      // Skip known different component types (e.g., VideoPage vs VideoForm)
      if (components.every(c => c.category !== components[0].category)) {
        return;
      }
      
      for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
          const similarity = Math.random(); // Mock implementation
          
          if (similarity > 0.7) { // Arbitrary threshold
            duplicates.push({
              name: groupName,
              paths: [components[i].path, components[j].path],
              similarity
            });
          }
        }
      }
    });
  
  return duplicates;
};

// Function to perform a complete analysis of the component structure
const analyzeComponents = () => {
  return {
    duplicates: detectDuplicateComponents(),
    missingComponents: [], // Would be populated in a real implementation
    unreferencedComponents: [], // Would be populated in a real implementation
    suggestions: [
      {
        component: 'VideoTutorialsPage',
        suggestion: 'Consider extracting video card component',
        reason: 'This component renders multiple similar card elements that could be extracted'
      },
      {
        component: 'VideoPlayerPage',
        suggestion: 'Consider using a shared NotesEditor component',
        reason: 'Notes editing functionality appears in multiple places'
      }
    ]
  };
};

module.exports = {
  detectDuplicateComponents,
  analyzeComponents
}; 