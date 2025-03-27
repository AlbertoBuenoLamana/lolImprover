# Component Documentation and Management Scripts

This directory contains scripts for managing and documenting React components in the application.

## Available Scripts

### Generate Component Documentation

```bash
node generateComponentDocs.js
```

This script generates comprehensive documentation for all components in the application:

- `COMPONENTS.md`: Lists all components with their descriptions, dependencies, and usage
- `COMPONENT_DEPENDENCIES.md`: Visualizes component dependencies in a Mermaid diagram
- `COMPONENT_USAGE_GUIDE.md`: Provides guidance on how to use and create components

**When to run**: After adding new components or updating existing component relationships.

### Create New Component

```bash
node generateComponent.js ComponentName "Component Description" category
```

This script generates a new component with the proper structure and documentation.

**Arguments**:
- `ComponentName`: Name of the component (PascalCase)
- `"Component Description"`: Brief description of the component's purpose (in quotes)
- `category`: Component category (layout, ui, page, feature, auth, form, util)

**Example**:
```bash
node generateComponent.js VideoCard "Card displaying video information" ui
```

This will create:
- `src/components/Ui/VideoCard.tsx`: Component file with proper structure and documentation
- Add console instructions for updating the component registry

### Audit Components

```bash
node auditComponents.js
```

This script analyzes the codebase for:
1. Potential component duplications
2. Missing components in the registry
3. Inconsistent component naming
4. Unused components

**When to run**: Regularly during development and before major releases to identify potential issues.

## Best Practices

1. **Always use the scripts to create new components** to ensure consistent structure and documentation.
2. **Keep the component registry up to date** when adding or modifying components.
3. **Run the audit script regularly** to detect potential duplications or issues.
4. **Generate documentation before releases** to provide up-to-date component documentation.
5. **Follow the component categorization guidelines** to maintain an organized codebase.

## Component Registry

The component registry is maintained in `src/utils/ComponentRegistry.ts`. This file serves as a centralized registry of all components in the application, documenting their purpose, location, and relationships to prevent duplication.

When adding a new component, make sure to update the registry with the appropriate information:

```typescript
ComponentName: {
  name: 'ComponentName',
  path: 'path/to/Component.tsx',
  description: 'Brief description of the component',
  category: 'ui', // or other appropriate category
  dependencies: ['OtherComponent1', 'OtherComponent2'],
  usedBy: [],
},
``` 