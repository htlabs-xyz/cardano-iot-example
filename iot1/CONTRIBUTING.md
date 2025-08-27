# Contributing to Cardano IoT Temperature Monitoring System

Thank you for your interest in contributing to this project! We welcome contributions from the community and are pleased to have you aboard.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/cardano-iot-example.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Provide system information and versions
- Include relevant logs and error messages

### Suggesting Features
- Use the GitHub issue tracker with the "enhancement" label
- Clearly describe the feature and its benefits
- Provide examples and use cases

### Code Contributions
- Pick an issue from the issue tracker
- Comment on the issue to let others know you're working on it
- Follow the coding standards
- Write tests for new functionality
- Update documentation as needed

## Development Setup

### Prerequisites
- Bun.js (v1.0+)
- Node.js (v18+)
- Docker & Docker Compose
- Aiken (for smart contract development)

### Backend Setup
```bash
cd back-end
bun install
cp .env.example .env
# Configure your environment variables
bun run build:contract
bun run start:dev
```

### Frontend Setup
```bash
cd front-end
bun install
cp .env.example .env
# Configure your environment variables
bun run dev
```

### Running Tests
```bash
# Backend tests
cd back-end
bun run test
bun run test:e2e

# Smart contract tests
aiken check
```

## Pull Request Process

1. **Update Documentation**: Ensure any new features are documented
2. **Add Tests**: Include tests for new functionality
3. **Follow Coding Standards**: Use the project's linting and formatting rules
4. **Update Version**: Follow semantic versioning if applicable
5. **Describe Changes**: Provide a clear description of what your PR does

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

## Issue Reporting

When reporting issues, please include:
- **Environment**: OS, Node.js version, Bun version
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Logs**: Relevant error messages or logs
- **Screenshots**: If applicable

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful variable and function names
- Add JSDoc comments for public APIs

### Smart Contracts (Aiken)
- Follow Aiken best practices
- Include comprehensive test coverage
- Document contract logic and parameters
- Use descriptive variable names

### Commit Messages
Follow conventional commits:
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Examples:
feat(api): add temperature validation endpoint
fix(contract): resolve datum parsing issue
docs(readme): update installation instructions
```

### Git Workflow
- Use feature branches
- Keep commits atomic and focused
- Rebase before submitting PR
- Write clear commit messages

## Project Structure

```
├── back-end/          # NestJS API server
├── front-end/         # Next.js web application
├── confirm_status/    # Validation service
├── docs/             # Documentation
└── README.md         # Project overview
```

## Getting Help

- Check existing issues and documentation
- Join our community discussions
- Ask questions in issue comments
- Contact maintainers for complex issues

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor list

Thank you for contributing to the Cardano IoT Temperature Monitoring System!
