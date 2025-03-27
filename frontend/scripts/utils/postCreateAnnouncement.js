/**
 * Post-component creation announcement script
 * Displays a message to the user after a component is created
 * to inform them about the automated registry update
 */

const chalk = require('chalk');

/**
 * Display an announcement after component creation
 * @param {string} componentName - The name of the newly created component
 * @param {string} category - The category of the component
 * @param {boolean} registryUpdated - Whether the registry was successfully updated
 * @param {string[]} dependencies - Array of detected dependencies (optional)
 */
function showPostCreateAnnouncement(componentName, category, registryUpdated = true, dependencies = []) {
  console.log('\n' + chalk.bold.green('='.repeat(50)));
  console.log(chalk.bold.green('🎉 COMPONENT CREATED SUCCESSFULLY 🎉'));
  console.log(chalk.bold.green('='.repeat(50)) + '\n');

  console.log(chalk.white(`Component ${chalk.cyan(componentName)} has been created in the ${chalk.yellow(category)} category.\n`));
  
  if (registryUpdated) {
    console.log(chalk.green('✅ Component registry has been automatically updated!'));
    console.log(chalk.white('   No manual registry updates needed.\n'));
    
    if (dependencies && dependencies.length > 0) {
      console.log(chalk.blue('📊 Dependency Analysis:'));
      console.log(chalk.white(`   Detected ${dependencies.length} dependencies:`));
      dependencies.forEach(dep => {
        console.log(chalk.white(`   - ${chalk.cyan(dep)}`));
      });
      console.log(chalk.white('   Dependencies have been automatically added to the registry.\n'));
    }
  } else {
    console.log(chalk.yellow('⚠️ Automated registry update failed.'));
    console.log(chalk.white('   Please update the registry manually or run:'));
    console.log(chalk.cyan('   npm run component:audit\n'));
  }

  console.log(chalk.white.bold('NEXT STEPS:'));
  console.log(chalk.white(' 1. Implement your component logic'));
  console.log(chalk.white(' 2. Add any required props to the interface'));
  console.log(chalk.white(' 3. Import and use your component in the appropriate location'));
  console.log(chalk.white(' 4. Run tests to ensure everything works correctly\n'));

  console.log(chalk.white('For more information about the component system, see:'));
  console.log(chalk.cyan(' - frontend/docs/COMPONENT_SYSTEM.md'));
  console.log(chalk.cyan(' - frontend/docs/CURSOR_GUIDE.md\n'));
}

module.exports = {
  showPostCreateAnnouncement
}; 