# Contributing to Campus Portal Backend

## Getting Started

### Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn
- Git

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/campus-portal-backend.git
cd campus-portal-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB:
```bash
# If using Docker
docker run -d -p 27017:27017 mongo:4.4

# Or if installed locally
mongod
```

5. Seed database (optional):
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

Server runs at `http://localhost:3001`

## Development Workflow

### Branch Naming Convention

```
feature/feature-name        # New features
bugfix/bug-description      # Bug fixes
chore/task-description      # Maintenance tasks
docs/documentation-topic    # Documentation updates
refactor/component-name     # Code refactoring
```

### Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build/dependency updates

**Examples:**
```
feat(auth): add JWT token refresh endpoint

fix(course): prevent duplicate enrollment attempts

docs(api): update endpoint documentation

test(services): add result service unit tests
```

## Code Style and Standards

### ESLint Configuration

Run linter:
```bash
npm run lint
npm run lint:fix
```

### Code Organization

```
src/
├── models/           # Mongoose schemas
├── services/         # Business logic
├── controllers/      # Request handlers
├── routes/           # API endpoints
├── middleware/       # Custom middleware
├── utils/            # Helper functions
├── config/           # Configuration
└── index.js          # Entry point
```

### File Naming

- **Models**: PascalCase (e.g., `User.js`, `Course.js`)
- **Services**: camelCase with "Service" suffix (e.g., `authService.js`)
- **Controllers**: camelCase with "Controller" suffix
- **Routes**: kebab-case (e.g., `auth-routes.js`)
- **Middleware**: camelCase (e.g., `errorHandler.js`)

### Code Patterns

#### Service Pattern

```javascript
// src/services/exampleService.js
const Example = require('../models/Example');

const exampleService = {
  // Get all examples
  getExamples: async (filter = {}) => {
    return await Example.find(filter).lean();
  },

  // Get single example
  getExample: async (id) => {
    return await Example.findById(id);
  },

  // Create example
  createExample: async (data, userId) => {
    const example = await Example.create({
      ...data,
      createdBy: userId,
    });
    return example;
  },

  // Update example
  updateExample: async (id, data, userId) => {
    return await Example.findByIdAndUpdate(id, data, { new: true });
  },

  // Delete example
  deleteExample: async (id, userId) => {
    return await Example.findByIdAndDelete(id);
  },
};

module.exports = exampleService;
```

#### Controller Pattern

```javascript
// src/controllers/exampleController.js
const exampleService = require('../services/exampleService');
const { success, error } = require('../utils/responseHandler');

const exampleController = {
  // Get all examples
  getExamples: async (req, res, next) => {
    try {
      const examples = await exampleService.getExamples();
      return success(res, examples, 'Examples retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  // Get single example
  getExample: async (req, res, next) => {
    try {
      const { id } = req.params;
      const example = await exampleService.getExample(id);
      
      if (!example) {
        return error(res, 'Example not found', 404);
      }
      
      return success(res, example, 'Example retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  // Create example
  createExample: async (req, res, next) => {
    try {
      const example = await exampleService.createExample(req.body, req.user.id);
      return success(res, example, 'Example created successfully', 201);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = exampleController;
```

#### Route Pattern

```javascript
// src/routes/examples.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const exampleController = require('../controllers/exampleController');

// Get all examples
router.get('/', authenticate, exampleController.getExamples);

// Get single example
router.get('/:id', authenticate, exampleController.getExample);

// Create example (admin only)
router.post('/', 
  authenticate, 
  checkRole(['admin']), 
  exampleController.createExample
);

module.exports = router;
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Writing Tests

Create test files in `tests/` with `.test.js` extension:

```javascript
// tests/exampleService.test.js
const exampleService = require('../src/services/exampleService');
const Example = require('../src/models/Example');

describe('Example Service', () => {
  let testData;

  beforeEach(async () => {
    testData = await Example.create({
      name: 'Test Example',
      description: 'Test description',
    });
  });

  describe('getExample', () => {
    it('should retrieve an example by id', async () => {
      const result = await exampleService.getExample(testData._id);
      
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(testData._id.toString());
      expect(result.name).toBe('Test Example');
    });

    it('should return null for non-existent id', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await exampleService.getExample(fakeId);
      
      expect(result).toBeNull();
    });
  });

  describe('createExample', () => {
    it('should create a new example', async () => {
      const data = {
        name: 'New Example',
        description: 'New description',
      };
      
      const result = await exampleService.createExample(data, 'userId');
      
      expect(result).toBeDefined();
      expect(result.name).toBe('New Example');
      expect(result.createdBy).toBe('userId');
    });
  });
});
```

### Test Coverage

Maintain minimum coverage:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

View coverage report:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Documentation

### API Documentation

Update `docs/API_DOCUMENTATION.md` when adding new endpoints:

```markdown
### GET /api/examples

Retrieve all examples.

**Authentication**: Required (JWT)
**Authorization**: All authenticated users
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [{
    "_id": "...",
    "name": "Example Name",
    "description": "Description",
    "createdAt": "2024-01-01T00:00:00Z"
  }],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

**Errors**:
- `401`: Unauthorized
- `500`: Internal server error
```

### Code Comments

Use JSDoc for complex functions:

```javascript
/**
 * Calculate student grade from marks
 * @param {number} marks - Student's marks (0-100)
 * @returns {string} Grade (A, B, C, D, F)
 * @throws {Error} If marks not in valid range
 */
const calculateGrade = (marks) => {
  if (marks < 0 || marks > 100) {
    throw new Error('Marks must be between 0 and 100');
  }
  if (marks >= 90) return 'A';
  if (marks >= 80) return 'B';
  if (marks >= 70) return 'C';
  if (marks >= 60) return 'D';
  return 'F';
};
```

## Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git pull origin develop
   git rebase develop
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Check linting**:
   ```bash
   npm run lint
   ```

4. **Update documentation** if needed

5. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push branch**:
   ```bash
   git push origin feature/your-feature
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Performance
- [ ] Breaking Change

## Related Issues
Closes #123

## Testing
- [ ] Added/updated tests
- [ ] All tests passing
- [ ] Test coverage maintained

## Documentation
- [ ] Updated API documentation
- [ ] Updated README if needed
- [ ] Updated type definitions

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.log left in code
```

## Adding New Features

### Example: Adding a New Resource

1. **Create Model** (`src/models/NewResource.js`)
2. **Create Service** (`src/services/newResourceService.js`)
3. **Create Controller** (`src/controllers/newResourceController.js`)
4. **Create Routes** (`src/routes/new-resource.js`)
5. **Add Validation Schemas** (`src/utils/validation.js`)
6. **Write Tests** (`tests/newResourceService.test.js`, `tests/routes.integration.test.js`)
7. **Update Documentation** (`docs/API_DOCUMENTATION.md`)
8. **Register Routes** (in `src/index.js`)

### Updating Models

If modifying a Mongoose schema:

1. Update the model file
2. Create a Prisma migration if using Prisma
3. Update validation schemas
4. Update service methods if needed
5. Write migration script if data transformation needed
6. Update API documentation
7. Add tests for new fields

```bash
# If using Prisma
npx prisma migrate dev --name update_schema_description
```

## Debugging

### Using VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/index.js",
      "restart": true,
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Using Node Inspector

```bash
node --inspect=9229 src/index.js
# Then visit chrome://inspect
```

## Performance Optimization

### Database Queries

```javascript
// ❌ Inefficient - returns full document
const courses = await Course.find();

// ✅ Efficient - returns only needed fields
const courses = await Course.find()
  .select('courseCode name semester')
  .lean();

// ✅ Efficient - uses indexes
const course = await Course.findOne({ courseCode: 'CS101' });
```

### API Responses

```javascript
// ❌ Returns all data
app.get('/api/courses', async (req, res) => {
  res.json(await Course.find());
});

// ✅ Implements pagination
app.get('/api/courses', async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  
  const data = await Course.find().skip(skip).limit(limit);
  const total = await Course.countDocuments();
  
  res.json({
    data,
    pagination: { page, limit, total }
  });
});
```

## Security Guidelines

### Input Validation
- Always validate user input with Zod schemas
- Sanitize file uploads
- Validate query parameters and path parameters

### Authentication
- Never store passwords in plain text
- Use bcryptjs with salt rounds ≥ 10
- Implement JWT token expiration
- Use HTTPS only in production

### Authorization
- Check user role before operations
- Verify resource ownership
- Use middleware for declarative access control

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for transmission
- Implement rate limiting
- Use security headers (Helmet)

## Release Process

### Version Numbering

Follow Semantic Versioning (MAJOR.MINOR.PATCH):

```
1.0.0  - Initial release
1.1.0  - New features (backward compatible)
1.1.1  - Bug fixes (backward compatible)
2.0.0  - Breaking changes
```

### Release Checklist

- [ ] All tests passing
- [ ] Coverage maintained
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] Commit with tag
- [ ] Create GitHub release
- [ ] Deploy to staging
- [ ] Deploy to production

## Getting Help

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Email**: contact@example.com

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Follow project conventions
- Report sensitive issues privately

Thank you for contributing! 🎉
