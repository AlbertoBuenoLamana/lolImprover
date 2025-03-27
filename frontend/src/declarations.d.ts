// Component declarations
declare module '*.tsx' {
  const component: React.ComponentType<any>;
  export default component;
}

// Image declarations
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';

// Other file types
declare module '*.json';
declare module '*.css';
