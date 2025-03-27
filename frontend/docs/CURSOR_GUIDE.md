# Using the Component System with Cursor IDE

This guide explains how to use the component system with Cursor IDE to prevent component duplication and maintain consistent documentation.

## Overview

The `.cursorrules` file in the root directory provides configuration for Cursor IDE to understand our component structure. This helps Cursor provide better recommendations and prevents component duplication.

## Cursor Workflows

### Creating a New Component

When you need to create a new component in Cursor:

1. **Check if a component already exists**:
   ```
   node frontend/scripts/utils/checkComponentExists.js ComponentName
   ```

2. **Create the component using the template**:
   ```
   npm run component:create ComponentName "Component Description" category
   ```
   
   Categories: layout, ui, page, feature, auth, form, util

3. **Registry automatically updated**:
   - The script automatically updates both TypeScript and JavaScript registry files
   - No manual registry updates needed in most cases
   - If the automated update fails, the script will provide instructions for manual updates

### Automated Registry Updates

The component creation script automatically:

1. Creates the component file with proper structure and documentation
2. Updates the TypeScript component registry (`src/utils/ComponentRegistry.ts`)
3. Updates the JavaScript component registry (`scripts/utils/ComponentRegistry.js`)

To test the registry update functionality:
```
npm run component:test-registry
```

This automation ensures that:
- Component registry is always up-to-date
- No manual steps are required to keep track of components
- Cursor IDE always has access to the latest component information

### Finding Components

When looking for an existing component:

1. Check the component documentation:
   ```
   frontend/docs/COMPONENTS.md
   ```

2. Use the component registry:
   ```
   frontend/src/utils/ComponentRegistry.ts
   ```

3. Check component dependencies:
   ```
   frontend/docs/COMPONENT_DEPENDENCIES.md
   ```

### Analyzing Components

Run the component audit to identify potential issues:

```
npm run component:audit
```

This will detect:
- Duplicate components
- Similar components that might be candidates for consolidation
- Missing components in the registry
- Unused components

### Updating Documentation

After adding or modifying components, update the documentation:

```
npm run docs:generate
```

## Using Cursor Autocompletion with Components

Cursor should be able to suggest existing components when you type imports. For example:

```typescript
import VideoCard from '../components/Ui/VideoCard';
```

Cursor can also suggest potential components to use based on context.

## Visual Studio Code Integration

If you're using Visual Studio Code, the `.cursorrules` file also helps with:

1. Path autocompletion for component imports
2. Component property suggestions
3. Documentation hover information

## Common Issues and Solutions

### Component Not Found

If Cursor can't find a component:

1. Check if the component exists in the registry
2. Make sure the component file is in the correct location
3. Ensure the component is exported correctly

### Component Duplication

If you're seeing duplicate component suggestions:

1. Run the component audit to identify duplications
2. Consolidate duplicated components
3. Update the component registry

### Import Path Issues

If Cursor suggests incorrect import paths:

1. Make sure the component path in the registry is correct
2. Update the `.cursorrules` file if needed
3. Regenerate the documentation

### Registry Update Failures

If the automated registry update fails:

1. Check if the registry files exist at the expected locations
2. Verify that the registry files have the correct format
3. Try running the test registry script for diagnostics
4. If necessary, manually update the registry files

## Advanced Configuration

The `.cursorrules` file contains detailed configuration for the component system. You can modify it to:

1. Add new component categories
2. Update path mappings
3. Change naming conventions
4. Modify component rules

For more details on component system architecture, see [COMPONENT_SYSTEM.md](./COMPONENT_SYSTEM.md). 