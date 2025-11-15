# Campus Portal API

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/phasehumans/campus-portal-api.git
cd campus-portal-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Start MongoDB:
```bash
# If using Docker
docker run -d -p 27017:27017 mongo:4.4

# Or if installed locally
mongod
```

5. Start development server:
```bash
npm run dev
```

### Branch Naming Convention

```
feature/feature-name        # New features
bugfix/bug-description      # Bug fixes
chore/task-description      # Maintenance tasks
docs/documentation-topic    # Documentation updates
refactor/component-name     # Code refactoring
```

### Commit Message Format

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build/dependency updates


### Tests

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
`
### Getting Help
- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Email**: dev.chaitanyasonawane@gmail.com

Thank you for contributing! 🎉
