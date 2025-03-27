/**
 * ComponentAnalyzer.ts
 * 
 * Utility for analyzing components in the codebase to:
 * 1. Detect potential component duplications
 * 2. Identify missing components in the registry
 * 3. Update component dependencies
 */

import { ComponentMetadata, getAllComponents, findComponentByName } from './ComponentRegistry';

export interface ComponentAnalysisResult {
  duplicates: {
    name: string;
    paths: string[];
    similarity: number;
  }[];
  missingComponents: string[];
  unreferencedComponents: string[];
  suggestions: {
    component: string;
    suggestion: string;
    reason: string;
  }[];
}

// Mock function for demonstration - in a real implementation, this would parse import statements
export const extractImportsFromFile = (filePath: string): string[] => {
  // This would be implemented to scan the file for import statements
  // For now, returning a placeholder value
  return [];
};

// Mock function for demonstration - in a real implementation, this would analyze component similarity
export const calculateComponentSimilarity = (component1Path: string, component2Path: string): number => {
  // This would analyze the component implementations to determine similarity
  // For now, returning a random value between 0 and 1
  return Math.random();
};

// Function to detect potential component duplications
export const detectDuplicateComponents = (): ComponentAnalysisResult['duplicates'] => {
  const allComponents = getAllComponents();
  const duplicates: ComponentAnalysisResult['duplicates'] = [];
  
  // Group components by functionality based on name patterns
  const componentGroups: Record<string, ComponentMetadata[]> = {};
  
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
          const similarity = calculateComponentSimilarity(components[i].path, components[j].path);
          
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

// Function to identify component dependencies
export const identifyComponentDependencies = (componentPath: string): string[] => {
  // This would scan the component file to identify which other components it uses
  // For demonstration, we return an empty array
  const imports = extractImportsFromFile(componentPath);
  
  return imports
    .filter(importPath => {
      // Filter out non-component imports (e.g., utilities, types)
      return importPath.includes('/components/') || 
             importPath.includes('/pages/');
    })
    .map(importPath => {
      // Extract component name from import path
      const parts = importPath.split('/');
      return parts[parts.length - 1].replace(/\.tsx?$/, '');
    })
    .filter(name => !!findComponentByName(name));
};

// Function to update component dependencies in the registry
export const updateComponentDependencies = (componentName: string): void => {
  const component = findComponentByName(componentName);
  if (!component) return;
  
  // Update component dependencies
  component.dependencies = identifyComponentDependencies(component.path);
  
  // Update "usedBy" for all dependent components
  component.dependencies.forEach(depName => {
    const dep = findComponentByName(depName);
    if (dep && !dep.usedBy.includes(componentName)) {
      dep.usedBy.push(componentName);
    }
  });
};

// Function to perform a complete analysis of the component structure
export const analyzeComponents = (): ComponentAnalysisResult => {
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

// Function to generate a component documentation template
export const generateComponentDocTemplate = (componentName: string): string => {
  const component = findComponentByName(componentName);
  if (!component) return '';
  
  return `
/**
 * ${component.name}
 * 
 * ${component.description}
 * 
 * @category ${component.category}
 * @dependencies ${component.dependencies.join(', ')}
 * @usedBy ${component.usedBy.join(', ')}
 */`;
};

// Function to generate JSDoc for a component file
export const generateComponentJSDoc = (componentPath: string): string => {
  // Extract component name from path
  const parts = componentPath.split('/');
  const componentName = parts[parts.length - 1].replace(/\.tsx?$/, '');
  
  return generateComponentDocTemplate(componentName);
}; 