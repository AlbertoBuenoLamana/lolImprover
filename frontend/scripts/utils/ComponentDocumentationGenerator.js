/**
 * ComponentDocumentationGenerator.js
 * 
 * CommonJS version of the ComponentDocumentationGenerator for use in scripts.
 */

const { 
  getAllComponents, 
  findComponentByName 
} = require('./ComponentRegistry');

/**
 * Generate a Component README for a shared components folder
 */
const generateComponentReadme = () => {
  const components = getAllComponents();
  
  const categorizedComponents = {};
  
  components.forEach(component => {
    if (!categorizedComponents[component.category]) {
      categorizedComponents[component.category] = [];
    }
    categorizedComponents[component.category].push(component);
  });
  
  let readmeContent = `# Component Documentation\n\n`;
  readmeContent += `This document provides an overview of all components in the application, their purpose, and their relationships.\n\n`;
  
  Object.entries(categorizedComponents).forEach(([category, comps]) => {
    readmeContent += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Components\n\n`;
    
    comps.forEach(comp => {
      readmeContent += `### ${comp.name}\n\n`;
      readmeContent += `${comp.description}\n\n`;
      readmeContent += `- **Path:** \`${comp.path}\`\n`;
      
      if (comp.dependencies.length > 0) {
        readmeContent += `- **Dependencies:** ${comp.dependencies.join(', ')}\n`;
      } else {
        readmeContent += `- **Dependencies:** None\n`;
      }
      
      if (comp.usedBy.length > 0) {
        readmeContent += `- **Used by:** ${comp.usedBy.join(', ')}\n`;
      } else {
        readmeContent += `- **Used by:** None\n`;
      }
      
      if (comp.propsInterface) {
        readmeContent += `- **Props Interface:** \`${comp.propsInterface}\`\n`;
      }
      
      if (comp.example) {
        readmeContent += `\n**Example Usage:**\n\n\`\`\`tsx\n${comp.example}\n\`\`\`\n`;
      }
      
      readmeContent += `\n`;
    });
  });
  
  return readmeContent;
};

/**
 * Generate a component template with proper documentation
 */
const generateComponentTemplate = (name, description, category) => {
  const template = `import React from 'react';

/**
 * ${name}
 * 
 * ${description}
 * 
 * @category ${category}
 */

export interface ${name}Props {
  // Define props here
}

const ${name}: React.FC<${name}Props> = (props) => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default ${name};
`;

  return template;
};

/**
 * Generate a component dependency graph in Mermaid format
 */
const generateComponentDependencyGraph = () => {
  const components = getAllComponents();
  
  let mermaidGraph = `graph TD\n`;
  
  // Add nodes
  components.forEach(comp => {
    mermaidGraph += `  ${comp.name}["${comp.name}"]\n`;
  });
  
  // Add relationships
  components.forEach(comp => {
    comp.dependencies.forEach(dep => {
      mermaidGraph += `  ${comp.name} --> ${dep}\n`;
    });
  });
  
  return mermaidGraph;
};

/**
 * Generate a component usage guide
 */
const generateComponentUsageGuide = () => {
  let guide = `# Component Usage Guide\n\n`;
  guide += `This guide provides best practices for working with components in our application.\n\n`;
  
  guide += `## Component Categories\n\n`;
  guide += `Components are organized into the following categories:\n\n`;
  guide += `- **Layout:** Components that structure the application layout\n`;
  guide += `- **UI:** Reusable UI elements like buttons, cards, etc.\n`;
  guide += `- **Page:** Page-level components that represent routes\n`;
  guide += `- **Feature:** Components tied to specific application features\n`;
  guide += `- **Auth:** Authentication-related components\n`;
  guide += `- **Form:** Form components and controls\n`;
  guide += `- **Util:** Utility components for common functionality\n\n`;
  
  guide += `## Adding New Components\n\n`;
  guide += `When adding a new component:\n\n`;
  guide += `1. Check if a similar component already exists in the registry\n`;
  guide += `2. Follow the established naming conventions\n`;
  guide += `3. Add proper JSDoc documentation\n`;
  guide += `4. Update the component registry\n`;
  guide += `5. Use the appropriate folder structure based on the component type\n\n`;
  
  guide += `## Component Dependencies\n\n`;
  guide += `Keep component dependencies minimal to improve reusability. If a component requires many dependencies, consider breaking it down into smaller components.\n\n`;
  
  guide += `## Component Examples\n\n`;
  guide += `Here are examples of well-structured components in our application:\n\n`;
  
  // Add examples of well-structured components
  const exampleComponents = getAllComponents().filter(comp => 
    ['Layout', 'Header', 'ProtectedRoute'].includes(comp.name)
  );
  
  exampleComponents.forEach(comp => {
    guide += `### ${comp.name}\n\n`;
    guide += `Path: \`${comp.path}\`\n\n`;
    guide += `Purpose: ${comp.description}\n\n`;
    if (comp.example) {
      guide += `\`\`\`tsx\n${comp.example}\n\`\`\`\n\n`;
    }
  });
  
  return guide;
};

module.exports = {
  generateComponentReadme,
  generateComponentTemplate,
  generateComponentDependencyGraph,
  generateComponentUsageGuide
}; 