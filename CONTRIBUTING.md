# Contributing to NEXORA

First off, thank you for considering contributing to NEXORA! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if relevant**
* **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the TypeScript/JavaScript style guide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/nexora.git
cd nexora

# Add upstream remote
git remote add upstream https://github.com/nexora/nexora.git
```

### 2. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

* Write code following our style guide
* Add tests for new functionality
* Ensure all tests pass: `npm test`
* Ensure linting passes: `npm run lint`
* Ensure type checking passes: `npm run typecheck`

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(ai-engine): add revenue prediction API"
git commit -m "fix(crm): resolve customer filter bug"
git commit -m "docs(api): update authentication examples"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## Style Guide

### TypeScript/JavaScript

```typescript
// Use explicit types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Use async/await over promises
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`)
  return response.data
}

// Use descriptive names
const isUserAuthenticated = checkAuth() // Good
const flag = checkAuth() // Bad
```

### React/Next.js

```typescript
// Use functional components
export function UserProfile({ user }: { user: User }) {
  return (
    <div className="profile">
      <h1>{user.name}</h1>
    </div>
  )
}

// Use TypeScript for props
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  )
}
```

### File Organization

```
components/
├── ui/              # Reusable UI components
│   ├── button.tsx
│   └── input.tsx
├── features/        # Feature-specific components
│   ├── auth/
│   └── dashboard/
└── layout/          # Layout components
    ├── header.tsx
    └── footer.tsx
```

## Testing

### Writing Tests

```typescript
// Unit tests
describe('calculateRevenue', () => {
  it('should calculate total revenue correctly', () => {
    const deals = [
      { value: 1000, stage: 'closed_won' },
      { value: 2000, stage: 'closed_won' },
    ]
    expect(calculateRevenue(deals)).toBe(3000)
  })

  it('should exclude non-won deals', () => {
    const deals = [
      { value: 1000, stage: 'closed_won' },
      { value: 2000, stage: 'proposal' },
    ]
    expect(calculateRevenue(deals)).toBe(1000)
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- user.test.ts

# Generate coverage report
npm test -- --coverage
```

## Documentation

* Update README.md if needed
* Update API documentation for API changes
* Add JSDoc comments for public functions
* Update relevant docs in `/docs` folder

```typescript
/**
 * Calculate the total revenue from closed deals
 * @param deals - Array of deal objects
 * @returns Total revenue amount
 * @example
 * ```ts
 * const revenue = calculateRevenue(deals)
 * console.log(revenue) // 5000
 * ```
 */
export function calculateRevenue(deals: Deal[]): number {
  // ...
}
```

## Community

* Join our [Discord](https://discord.gg/nexora) (coming soon)
* Follow us on [Twitter](https://twitter.com/nexora_ai)
* Read our [Blog](https://nexora.ai/blog)

## Questions?

Feel free to open an issue with the `question` label or reach out to contributors@nexora.ai

---

**Thank you for contributing to NEXORA!** 🚀
