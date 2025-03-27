/**
 * Component Dependency Graph Generator
 * 
 * This script generates a visual representation of component dependencies
 * using the component registry data.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Get components from registry
const registryPath = path.join(__dirname, '..', 'src', 'utils', 'ComponentRegistry.ts');

console.log(chalk.bold.cyan('='.repeat(60)));
console.log(chalk.bold.cyan('🔗 GENERATING COMPONENT DEPENDENCY GRAPH'));
console.log(chalk.bold.cyan('='.repeat(60)));

// Function to extract components from registry
function extractComponents() {
  try {
    if (!fs.existsSync(registryPath)) {
      console.error(chalk.red(`Registry file not found at ${registryPath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(registryPath, 'utf-8');
    const components = {};
    
    // Extract all component collections
    const collectionRegex = /export\s+const\s+(\w+Components)\s*=\s*{([\s\S]*?)};\s/g;
    let match;
    
    while ((match = collectionRegex.exec(content)) !== null) {
      const collectionName = match[1];
      const collectionContent = match[2];
      
      // Extract individual components
      const componentRegex = /(\w+):\s*{([\s\S]*?)},/g;
      let componentMatch;
      
      while ((componentMatch = componentRegex.exec(collectionContent)) !== null) {
        const componentName = componentMatch[1];
        const componentDetails = componentMatch[2];
        
        // Parse component details
        const nameMatch = componentDetails.match(/name:\s*['"]([^'"]*)['"]/);
        const pathMatch = componentDetails.match(/path:\s*['"]([^'"]*)['"]/);
        const categoryMatch = componentDetails.match(/category:\s*['"]([^'"]*)['"]/);
        const descriptionMatch = componentDetails.match(/description:\s*['"]([^'"]*)['"]/);
        
        // Extract dependencies
        const dependenciesMatch = componentDetails.match(/dependencies:\s*\[(.*?)\]/s);
        const dependencies = dependenciesMatch && dependenciesMatch[1].trim() 
          ? dependenciesMatch[1].split(',').map(dep => dep.trim().replace(/['"]/g, '')) 
          : [];
        
        // Extract usedBy
        const usedByMatch = componentDetails.match(/usedBy:\s*\[(.*?)\]/s);
        const usedBy = usedByMatch && usedByMatch[1].trim() 
          ? usedByMatch[1].split(',').map(dep => dep.trim().replace(/['"]/g, '')) 
          : [];
        
        components[componentName] = {
          name: nameMatch ? nameMatch[1] : componentName,
          path: pathMatch ? pathMatch[1] : '',
          category: categoryMatch ? categoryMatch[1] : '',
          description: descriptionMatch ? descriptionMatch[1] : '',
          dependencies,
          usedBy
        };
      }
    }
    
    return components;
  } catch (error) {
    console.error(chalk.red(`Error extracting components: ${error.message}`));
    process.exit(1);
  }
}

// Generate markdown dependency graph
function generateMarkdownGraph(components) {
  let markdown = `# Component Dependency Graph\n\nThis document provides a visual representation of component dependencies in the application.\n\n`;
  
  // Create sections by category
  const categories = {};
  
  for (const [name, component] of Object.entries(components)) {
    const category = component.category || 'unknown';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ name, ...component });
  }
  
  // Generate category sections
  for (const [category, categoryComponents] of Object.entries(categories)) {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Components\n\n`;
    
    // Sort by dependency count
    categoryComponents.sort((a, b) => b.dependencies.length - a.dependencies.length);
    
    for (const component of categoryComponents) {
      markdown += `### ${component.name}\n\n`;
      markdown += `${component.description || 'No description provided.'}\n\n`;
      markdown += `**Path:** \`${component.path}\`\n\n`;
      
      // Dependencies section
      if (component.dependencies.length > 0) {
        markdown += `**Dependencies:**\n\n`;
        markdown += `\`\`\`mermaid\nflowchart LR\n`;
        markdown += `  ${component.name}[${component.name}]\n`;
        
        component.dependencies.forEach(dep => {
          if (components[dep]) {
            markdown += `  ${dep}[${dep}]\n`;
            markdown += `  ${component.name} --> ${dep}\n`;
          }
        });
        
        markdown += `\`\`\`\n\n`;
      }
      
      // Used By section
      if (component.usedBy.length > 0) {
        markdown += `**Used By:**\n\n`;
        markdown += `\`\`\`mermaid\nflowchart RL\n`;
        markdown += `  ${component.name}[${component.name}]\n`;
        
        component.usedBy.forEach(user => {
          if (components[user]) {
            markdown += `  ${user}[${user}]\n`;
            markdown += `  ${user} --> ${component.name}\n`;
          }
        });
        
        markdown += `\`\`\`\n\n`;
      }
      
      markdown += `---\n\n`;
    }
  }
  
  // Generate full dependency graph
  markdown += `## Full Dependency Graph\n\n`;
  markdown += `\`\`\`mermaid\nflowchart TD\n`;
  
  // Add all components
  for (const [name, component] of Object.entries(components)) {
    markdown += `  ${name}[${name}:::${component.category}]\n`;
  }
  
  // Add all connections
  for (const [name, component] of Object.entries(components)) {
    component.dependencies.forEach(dep => {
      if (components[dep]) {
        markdown += `  ${name} --> ${dep}\n`;
      }
    });
  }
  
  // Add class definitions for categories
  markdown += `  classDef ui fill:#f9f,stroke:#333,stroke-width:2px;\n`;
  markdown += `  classDef layout fill:#bbf,stroke:#333,stroke-width:2px;\n`;
  markdown += `  classDef feature fill:#bfb,stroke:#333,stroke-width:2px;\n`;
  markdown += `  classDef page fill:#fbb,stroke:#333,stroke-width:2px;\n`;
  markdown += `  classDef auth fill:#fbf,stroke:#333,stroke-width:2px;\n`;
  markdown += `  classDef form fill:#bff,stroke:#333,stroke-width:2px;\n`;
  markdown += `  classDef util fill:#ffb,stroke:#333,stroke-width:2px;\n`;
  
  markdown += `\`\`\`\n\n`;
  
  // Add legend
  markdown += `## Legend\n\n`;
  markdown += `- **UI Components** - Pink\n`;
  markdown += `- **Layout Components** - Blue\n`;
  markdown += `- **Feature Components** - Green\n`;
  markdown += `- **Page Components** - Red\n`;
  markdown += `- **Auth Components** - Purple\n`;
  markdown += `- **Form Components** - Cyan\n`;
  markdown += `- **Util Components** - Yellow\n`;
  
  return markdown;
}

// Main function
function generateDependencyGraph() {
  // Extract components from registry
  const components = extractComponents();
  console.log(chalk.green(`Extracted ${Object.keys(components).length} components from registry`));
  
  // Generate markdown graph
  const markdown = generateMarkdownGraph(components);
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'docs', 'COMPONENT_DEPENDENCIES.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  
  console.log(chalk.green(`\nDependency graph generated successfully at:`));
  console.log(chalk.cyan(outputPath));
  console.log(chalk.yellow('\nNote: To view the Mermaid diagrams, you need a Markdown viewer that supports Mermaid syntax.'));
  
  // Generate a summary of dependencies
  console.log(chalk.bold.cyan('\n='.repeat(60)));
  console.log(chalk.bold.cyan('📊 DEPENDENCY STATISTICS'));
  console.log(chalk.bold.cyan('='.repeat(60)));
  
  const mostDependedOn = Object.entries(components)
    .map(([name, component]) => ({ name, count: component.usedBy.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  console.log(chalk.white('\nMost Depended-On Components:'));
  mostDependedOn.forEach((item, index) => {
    console.log(chalk.white(`${index + 1}. ${chalk.cyan(item.name)} - Used by ${item.count} components`));
  });
  
  const mostDependencies = Object.entries(components)
    .map(([name, component]) => ({ name, count: component.dependencies.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  console.log(chalk.white('\nComponents with Most Dependencies:'));
  mostDependencies.forEach((item, index) => {
    console.log(chalk.white(`${index + 1}. ${chalk.cyan(item.name)} - Uses ${item.count} components`));
  });
  
  console.log(chalk.bold.cyan('\n='.repeat(60)));
}

// Run the generator
generateDependencyGraph(); 