# Contributing to Strategic Intelligence Platform

We welcome contributions to the Strategic Intelligence Platform! This guide will help you get started with contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Security Vulnerabilities](#security-vulnerabilities)

## Code of Conduct

We are committed to fostering a welcoming and inclusive community. Please read and follow our Code of Conduct:

### Our Standards
- **Be respectful**: Treat all community members with respect and kindness
- **Be inclusive**: Welcome newcomers and help them learn
- **Be collaborative**: Work together constructively
- **Be patient**: Remember that everyone has different levels of experience
- **Focus on the issue**: Keep discussions focused on technical matters

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git
- Basic familiarity with React, TypeScript, and Express.js

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/strategic-intelligence-platform.git
   cd strategic-intelligence-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Set up the database**
   ```bash
   # Create local database
   createdb strategic_intelligence_dev
   
   # Run migrations
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Verify setup**
   - Open http://localhost:5173
   - Ensure the application loads correctly
   - Check that API endpoints respond

## Development Workflow

### Branch Strategy
We use a simplified Git flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual feature branches
- `hotfix/issue-description` - Critical bug fixes

### Working on a Feature

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow existing patterns and conventions
   - Add tests for new functionality

3. **Test your changes**
   ```bash
   # Run linting
   npm run lint
   
   # Type checking
   npm run type-check
   
   # Run tests (when available)
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```bash
feat(ai): add GPT-5 integration for truth analysis
fix(auth): resolve session persistence issue
docs(api): update endpoint documentation
refactor(components): extract reusable signal card component
```

## Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Use types for unions and primitives
type Platform = 'twitter' | 'instagram' | 'tiktok';
type Status = 'pending' | 'completed' | 'failed';
```

#### Function Definitions
```typescript
// Prefer function declarations for top-level functions
function analyzeContent(content: string, platform: Platform): Promise<Analysis> {
  // Implementation
}

// Use arrow functions for callbacks and short functions
const processResults = (results: Result[]) => results.map(r => r.value);
```

### React Component Guidelines

#### Component Structure
```typescript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  className?: string;
}

export function ComponentName({ title, onSubmit, className }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState<StateType>(initialState);
  const { data, isLoading } = useQuery({ queryKey: ['key'] });
  
  // Event handlers
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };
  
  // Early returns for loading/error states
  if (isLoading) return <LoadingSpinner />;
  
  // Main render
  return (
    <div className={cn("base-classes", className)}>
      {/* Component content */}
    </div>
  );
}
```

#### Styling Guidelines
```typescript
// Use tailwind classes with cn() for conditional styling
import { cn } from "@/lib/utils";

<button 
  className={cn(
    "base-button-classes",
    variant === "primary" && "primary-variant-classes",
    disabled && "disabled-classes",
    className
  )}
>
```

### Backend Guidelines

#### API Route Structure
```typescript
// routes.ts
app.get('/api/resource', async (req, res) => {
  try {
    // Validate input
    const query = QuerySchema.parse(req.query);
    
    // Business logic
    const result = await storage.getResource(query);
    
    // Response
    res.json(result);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### Database Operations
```typescript
// storage.ts
export class DatabaseStorage implements IStorage {
  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id));
    
    return resource;
  }
}
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (shadcn/ui)
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configuration
├── types/              # Shared TypeScript types
└── utils/              # Helper functions
```

## Testing Guidelines

### Unit Tests
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render with correct title', () => {
    render(<ComponentName title="Test Title" onSubmit={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('should call onSubmit when form is submitted', () => {
    const mockSubmit = jest.fn();
    render(<ComponentName title="Test" onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### API Testing
```typescript
// API endpoint testing
import request from 'supertest';
import { app } from '../server';

describe('GET /api/captures', () => {
  it('should return captures list', async () => {
    const response = await request(app)
      .get('/api/captures')
      .expect(200);
    
    expect(response.body).toHaveProperty('captures');
    expect(Array.isArray(response.body.captures)).toBe(true);
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Ensure your PR is ready**
   - All tests pass
   - Code follows style guidelines
   - Documentation is updated
   - No merge conflicts

2. **Create a detailed PR description**
   ```markdown
   ## Description
   Brief description of the changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] No breaking changes
   
   ## Screenshots (if applicable)
   Add screenshots for UI changes
   ```

3. **Request review**
   - Add relevant reviewers
   - Respond to feedback promptly
   - Make requested changes

### Review Process

#### For Reviewers
- Check code quality and style
- Verify functionality works as intended
- Ensure tests are adequate
- Look for potential security issues
- Provide constructive feedback

#### For Contributors
- Address all review comments
- Ask questions if feedback is unclear
- Be open to suggestions and improvements
- Update documentation if needed

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Bug Description**
A clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Version: [e.g. 1.2.3]
```

### Feature Requests

Use the feature request template:

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
Describe your proposed solution

**Alternatives Considered**
Any alternative solutions considered?

**Additional Context**
Any other context about the feature
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority issue
- `status: in progress` - Currently being worked on

## Architecture Contributions

### Adding New Features

When contributing major features:

1. **Discuss the feature first**
   - Open an issue to discuss the feature
   - Get feedback from maintainers
   - Agree on the approach

2. **Design considerations**
   - How does it fit with existing architecture?
   - What database changes are needed?
   - Are new API endpoints required?
   - How will it be tested?

3. **Implementation phases**
   - Break large features into smaller PRs
   - Start with backend/database changes
   - Add frontend components
   - Update documentation

### Database Schema Changes

1. **Create migration**
   ```bash
   npm run db:generate
   ```

2. **Test migration**
   ```bash
   # Test on development database
   npm run db:migrate
   ```

3. **Update types**
   - Update schema types in `shared/schema.ts`
   - Update storage interface if needed

## Security Vulnerabilities

### Reporting Security Issues

**Do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- Email: security@strategicintelligence.com
- Use GitHub's private vulnerability reporting feature

### Security Guidelines

- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all input data
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Keep dependencies updated

## Getting Help

### Community Resources

- **GitHub Discussions** - Ask questions and share ideas
- **Issues** - Report bugs and request features
- **Discord/Slack** - Real-time community chat (if available)

### Documentation

- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes for significant contributions
- Annual contributor highlights

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Strategic Intelligence Platform! Your efforts help make this project better for everyone. 🚀