# Contributing Guidelines

## Welcome to the HRM System!

Thank you for your interest in contributing to this project. This document provides guidelines and standards for contributing code.

## Code Style Guide

### JavaScript/React

#### Naming Conventions
- **Components**: PascalCase (`EmployeeDashboard.jsx`)
- **Functions**: camelCase (`handleSubmit`, `calculateHours`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EMPLOYEES`, `API_TIMEOUT`)
- **Variables**: camelCase (`userName`, `employeeData`)
- **Private functions**: Prefix with underscore `_privateFunction`

#### File Organization
```
ComponentName/
├── ComponentName.jsx      # Main component
├── ComponentName.css      # Styles
├── ComponentName.utils.js # Helper functions (optional)
└── index.js              # Exports (optional)
```

#### React Components
```javascript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

function MyComponent({ prop1, prop2 }) {
  // State
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Effect code
  }, [dependencies]);

  // Handlers
  const handleEvent = () => {
    // Handler code
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default MyComponent;
```

#### Comments
- Use JSDoc for functions
- Comment complex logic
- Keep comments up-to-date
- Avoid obvious comments

```javascript
/**
 * Calculate working hours between login and logout
 * @param {Date} loginTime - Employee login time
 * @param {Date} logoutTime - Employee logout time
 * @returns {number} Working hours
 */
function calculateWorkingHours(loginTime, logoutTime) {
  return (logoutTime - loginTime) / (1000 * 60 * 60);
}
```

### Backend (Express)

#### Project Structure
```
backend/
├── controllers/  # Business logic
├── routes/       # API routes
├── models/       # Database schemas
├── middleware/   # Express middleware
├── utils/        # Helper functions
├── server.js     # Server setup
└── app.js        # Express configuration
```

#### Error Handling
- Use consistent error response format
- Include meaningful error messages
- Log errors in development
- Don't expose sensitive information

#### Database
- Use Mongoose schemas with proper validation
- Add indexes for frequently queried fields
- Use timestamps (createdAt, updatedAt)
- Implement soft deletes if needed

```javascript
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
  },
  { timestamps: true }
);
```

## Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/issue-name` - Urgent fixes
- `refactor/refactor-name` - Code improvements
- `docs/doc-name` - Documentation updates

### Commit Messages
```
[TYPE] Brief description

Detailed explanation if needed.
- Point 1
- Point 2

Closes #issue_number
```

**Types**: `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[DOCS]`, `[TEST]`, `[STYLE]`

Example:
```
[FEAT] Add employee leave request approval

- Implement leave approval workflow
- Add email notifications
- Create leave approval dashboard

Closes #42
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with meaningful commits
3. Push to your fork
4. Create Pull Request with description
5. Address code review comments
6. Merge when approved

## Code Quality Standards

### Frontend
- ✅ Components should be reusable
- ✅ Props should be validated
- ✅ Use meaningful variable names
- ✅ Avoid prop drilling (use Context for shared state)
- ✅ Keep components under 300 lines
- ✅ Use CSS modules or scoped CSS
- ✅ Add error boundaries

### Backend
- ✅ Implement input validation
- ✅ Use consistent API response format
- ✅ Add proper error handling
- ✅ Use middleware for cross-cutting concerns
- ✅ Keep routes clean (move logic to controllers)
- ✅ Add request/response logging
- ✅ Write reusable utility functions

## Testing

### Before Submitting PR
- Test manually in development
- Check console for errors
- Test with different data inputs
- Test edge cases
- Verify API calls work correctly
- Test on different screen sizes (frontend)

### Recommended Test Cases
```javascript
// Example test structure
describe('EmployeeRegister', () => {
  test('should validate email format', () => {
    // Test code
  });

  test('should require password', () => {
    // Test code
  });

  test('should submit form with valid data', () => {
    // Test code
  });
});
```

## Security Guidelines

### Passwords
- Minimum 6 characters
- Must contain uppercase, lowercase, numbers
- Never log passwords
- Use bcryptjs for hashing

### API Keys & Secrets
- Never commit .env files
- Never expose in client-side code
- Rotate keys regularly
- Use environment variables

### Authentication
- Validate tokens on protected routes
- Check user role for admin operations
- Implement rate limiting
- Use HTTPS in production

### Data
- Validate and sanitize inputs
- Use CORS appropriately
- Implement data access controls
- Log sensitive operations

## Documentation Standards

### README Files
- Clear setup instructions
- Project structure overview
- Technology stack
- API documentation
- Troubleshooting guide

### Code Documentation
- JSDoc comments for functions
- Explain complex logic
- Document API endpoints
- Include usage examples

### Change Documentation
- Update CHANGELOG.md
- Update API docs if endpoints change
- Update README if features added
- Document breaking changes

## Performance Guidelines

### Frontend
- Lazy load components
- Optimize images
- Minimize re-renders (useMemo, useCallback)
- Code split large bundles
- Monitor bundle size

### Backend
- Use database indexes
- Implement pagination
- Cache frequently accessed data
- Optimize queries
- Add request timeouts

## Accessibility

### Frontend
- Use semantic HTML
- Include alt text for images
- Add ARIA labels for complex components
- Ensure keyboard navigation
- Maintain good color contrast
- Test with screen readers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Before Committing

Run this checklist:
- [ ] Code follows style guide
- [ ] No console.logs (or removed in production code)
- [ ] No commented-out code
- [ ] Tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] .env files not committed
- [ ] Performance acceptable

## Questions?

- Check existing issues/discussions
- Review project documentation
- Ask in team discussions
- Create a discussion if unsure

## Code Review Checklist

Reviewers should check:
- [ ] Code quality and readability
- [ ] Follows project conventions
- [ ] Proper error handling
- [ ] Security implications
- [ ] Performance impact
- [ ] Tests included
- [ ] Documentation updated
- [ ] No conflicts with existing code

---

**Thank you for contributing to make this project better!** 🙏
