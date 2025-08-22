# Lovable UI Integration Guide

## Overview
This guide explains how to integrate UI components from Lovable.dev into your existing React/Supabase project.

## Export Methods

### Option 1: GitHub Integration
1. In Lovable editor, connect your project to GitHub
2. Clone the repository: `git clone <repo-url>`
3. Navigate to the `src/components` directory
4. Copy desired components to your project

### Option 2: Chrome Extension
1. Install the `lovable-code-exporter` Chrome extension
2. Download your Lovable project as ZIP
3. Extract and locate components in `src/components/`

## Component Integration Steps

### 1. Copy Component Files
```bash
# From Lovable export
cp lovable-project/src/components/YourComponent.tsx ./client/src/components/
cp lovable-project/src/components/ui/* ./client/src/components/ui/
```

### 2. Update Import Paths
Lovable components typically use these imports:
```typescript
// Lovable imports (need to be updated)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from '@supabase/supabase-js'

// Update to match your project structure
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"
```

### 3. Database Types Integration
If the Lovable component uses Supabase types:
```typescript
// Lovable might use generated types
import type { Database } from './types/supabase'

// Update to use your types
import type { Database } from '@shared/database.types'
```

### 4. Authentication Integration
Update auth hooks to match your project:
```typescript
// Lovable auth pattern
const { user } = useAuth()

// Your project pattern (if different)
const { user } = useAuth() // Should work if using similar patterns
```

## Common Integration Tasks

### Styling Compatibility
- Lovable uses Tailwind CSS (matches your project)
- Components should work without style changes
- Check for any custom CSS variables in Lovable's global styles

### State Management
- Lovable uses React Query (matches your project)
- Update query keys to match your API endpoints:
```typescript
// Lovable pattern
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: () => fetch('/api/items').then(res => res.json())
})

// Your project pattern
const { data } = useQuery({
  queryKey: ['/api/captures'], // Match your existing patterns
})
```

### Database Operations
Replace Lovable's Supabase client calls with your project's patterns:
```typescript
// Lovable pattern
const { data, error } = await supabase
  .from('items')
  .select('*')

// Your project pattern (if using different client setup)
const { data, error } = await supabase
  .from('captures') // Use your table names
  .select('*')
```

## Testing Integration

1. **TypeScript Check**: Run `npm run typecheck` after integration
2. **Build Test**: Run `npm run build` to ensure no import errors  
3. **Runtime Test**: Test the component in your development environment

## Best Practices

1. **Gradual Integration**: Import one component at a time
2. **Update Dependencies**: Ensure package.json includes any new dependencies
3. **Type Safety**: Fix any TypeScript errors immediately
4. **Test Data Flow**: Verify Supabase queries work with your database schema
5. **Feature Flags**: Use your existing flag system to safely deploy new components

## Example Integration

```typescript
// Lovable component (after path updates)
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database } from '@shared/database.types';

type Item = Database['public']['Tables']['captures']['Row'];

export function LovableComponent() {
  const queryClient = useQueryClient();
  
  const { data: items } = useQuery<Item[]>({
    queryKey: ['/api/captures'], // Updated to match your API
  });

  // Component logic remains the same...
  return (
    <div className="p-4">
      {/* UI components work as-is */}
    </div>
  );
}
```

## Troubleshooting

### Common Issues:
- **Import Path Errors**: Update all `@/` imports to match your alias setup
- **Type Mismatches**: Ensure database types align between projects
- **API Endpoint Differences**: Update query endpoints to match your backend
- **Auth Context Missing**: Verify auth provider wraps the component tree

### Quick Fixes:
```bash
# Fix import paths
find . -name "*.tsx" -exec sed -i 's|@/components|@/components|g' {} \;

# Update API paths
find . -name "*.tsx" -exec sed -i 's|/api/items|/api/captures|g' {} \;
```

This integration approach lets you leverage Lovable's AI-generated components while maintaining your existing project architecture.