# 🤝 Contributing to Med 360 Copilot

Thank you for your interest in contributing! This guide will help you get started.

---

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+
- **Git**
- At least one AI provider API key (see [README.md](./README.md))

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/med-360-copilot.git
cd med-360-copilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add at least one AI API key
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to verify everything works.

---

## Development Workflow

### Branch Naming

Create a feature branch from `main`:

```bash
git checkout -b feat/your-feature-name    # New features
git checkout -b fix/bug-description       # Bug fixes
git checkout -b docs/what-you-changed     # Documentation
git checkout -b refactor/what-you-changed # Refactoring
```

### Making Changes

1. Create your feature branch (`git checkout -b feat/amazing-feature`)
2. Make your changes
3. Test your changes locally
4. Commit using conventional commits (see below)
5. Push to your fork (`git push origin feat/amazing-feature`)
6. Open a Pull Request against `main`

---

## Code Style

### TypeScript

- **Strict mode** enabled — no `any` types unless absolutely necessary
- Use interfaces for object shapes, types for unions/intersections
- Export types from `src/types/index.ts`

### React / Next.js

- Use **server components** by default; add `"use client"` only when needed
- Prefer **named exports** over default exports for components
- Use **shadcn/ui** components as building blocks — don't reinvent the wheel

### Tailwind CSS

- Use Tailwind utility classes directly — avoid custom CSS where possible
- Follow the existing design system (see [ARCHITECTURE.md](./ARCHITECTURE.md))
- Use `cn()` utility from `src/lib/utils.ts` for conditional classes

### File Organization

- Page components go in `src/app/<route>/page.tsx`
- Shared components go in `src/components/`
- API routes go in `src/app/api/<route>/route.ts`
- Types go in `src/types/`
- Utilities go in `src/lib/`

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring, no behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |

### Examples

```
feat(triage): add follow-up question flow
fix(drugs): handle missing dosage data gracefully
docs(readme): update deployment instructions
refactor(agents): extract shared prompt builder
```

---

## Pull Request Guidelines

### Before Submitting

- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Tested locally with at least one AI provider
- [ ] Follows the existing code style
- [ ] Commit messages follow conventional commits

### PR Template

When opening a PR, please include:

```markdown
## What does this PR do?

Brief description of the changes.

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe):

## How to test

Steps to test the changes:
1. ...
2. ...

## Screenshots (if applicable)

## Checklist

- [ ] I have tested this locally
- [ ] My code follows the project style guidelines
- [ ] I have updated documentation if needed
- [ ] My commits follow conventional commit format
```

---

## Reporting Issues

When filing an issue, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Which AI provider you're using
- Relevant error messages or screenshots

---

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/med-360-copilot/discussions) for questions, ideas, or general feedback.
