# Using pnpm with Next.js

## What is pnpm?

pnpm (pronounced "p-npm") is a fast, disk-space efficient package manager for JavaScript. It stands for "performant npm" and was created to solve some of the issues with npm and Yarn.

## Key Features of pnpm

### 1. Disk Space Efficiency

pnpm uses a content-addressable filesystem to store all packages on your disk. Unlike npm or Yarn, which create copies of packages in each project's `node_modules` directory, pnpm stores all packages in a single location on your disk and creates hard links to them. This means:

- A package is stored only once on your disk, regardless of how many projects use it
- Installing dependencies is faster because packages might already be on your disk
- You save significant disk space, especially if you work on multiple JavaScript projects

### 2. Strict Dependencies

pnpm creates a more accurate dependency tree that prevents a package from accessing dependencies it hasn't explicitly declared. This is called "strict dependencies" and helps avoid the "phantom dependencies" problem where code works locally but breaks in production.

### 3. Speed

pnpm is generally faster than npm and sometimes faster than Yarn, especially for large projects or when you have multiple projects on your machine.

## pnpm vs. npm vs. npx

### npm

npm (Node Package Manager) is the default package manager for Node.js. It:
- Installs packages locally to your project's `node_modules` directory
- Creates duplicate copies of packages across projects
- Has a flatter dependency structure that can lead to "phantom dependencies"

### npx

npx is a package runner tool that comes with npm (since version 5.2.0). It:
- Allows you to execute packages without installing them globally
- Is great for one-off commands like creating a new project
- Downloads packages temporarily, runs them, and then removes them

### pnpm

pnpm is an alternative to npm with:
- Better disk space efficiency through a content-addressable store
- Strict dependency resolution that prevents phantom dependencies
- Generally faster installation times
- Similar CLI commands to npm, making it easy to switch

## pnpm Equivalents to npm/npx Commands

| npm/npx Command | pnpm Equivalent | Description |
|-----------------|-----------------|-------------|
| `npm install` | `pnpm install` | Install all dependencies |
| `npm install package` | `pnpm add package` | Install a specific package |
| `npm install --save-dev package` | `pnpm add -D package` | Install a dev dependency |
| `npm uninstall package` | `pnpm remove package` | Remove a package |
| `npm run script` | `pnpm script` | Run a script from package.json |
| `npx command` | `pnpm dlx command` | Execute a package without installing |

## Setting Up Next.js with pnpm

### Creating a New Next.js Project

```bash
# Create a new Next.js project with TypeScript
pnpm dlx create-next-app@latest fireworks-sales --typescript --eslint --tailwind --app --src-dir

# Navigate to the project directory
cd fireworks-sales
```

### Installing Dependencies

```bash
# Install additional dependencies
pnpm add @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Install development dependencies
pnpm add -D @types/jest @testing-library/user-event
```

### Adding Shadcn UI

```bash
# Initialize Shadcn UI
pnpm dlx shadcn-ui@latest init

# Add Shadcn UI components
pnpm dlx shadcn-ui@latest add button card input form
```

## pnpm Workspace for Monorepos

pnpm has excellent support for monorepos through its workspace feature. This is useful for projects with multiple packages or apps:

```
project-root/
├── package.json
├── pnpm-workspace.yaml
├── apps/
│   ├── web/
│   │   └── package.json
│   └── admin/
│       └── package.json
└── packages/
    ├── ui/
    │   └── package.json
    └── utils/
        └── package.json
```

The `pnpm-workspace.yaml` file would look like:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## CI/CD with pnpm and Jenkins

When using pnpm in a CI/CD pipeline with Jenkins, you'll need to update your Jenkinsfile:

```groovy
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-u root'
        }
    }
    stages {
        stage('Setup pnpm') {
            steps {
                sh 'npm install -g pnpm'
            }
        }
        stage('Install') {
            steps {
                sh 'pnpm install'
            }
        }
        stage('Lint') {
            steps {
                sh 'pnpm run lint'
            }
        }
        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }
        // Deployment stages...
    }
}
```

## Best Practices for Using pnpm with Next.js

### 1. Use pnpm-lock.yaml

Always commit your `pnpm-lock.yaml` file to version control. This ensures that all developers and CI environments install exactly the same dependencies.

### 2. Configure .npmrc

Create a `.npmrc` file in your project root to configure pnpm behavior:

```
# .npmrc
node-linker=hoisted
shamefully-hoist=true
strict-peer-dependencies=false
```

The `shamefully-hoist=true` setting can help with compatibility issues in some Next.js packages.

### 3. Use pnpm Scripts

Define your scripts in `package.json` and run them with `pnpm`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  }
}
```

Run with:
```bash
pnpm dev
pnpm build
pnpm test
```

### 4. Caching in CI/CD

Take advantage of pnpm's store for caching in CI/CD:

```groovy
// In Jenkinsfile
stage('Install') {
    steps {
        // Cache the pnpm store
        sh 'pnpm config set store-dir .pnpm-store'
        sh 'pnpm install'
    }
}
```

### 5. Handling Peer Dependencies

pnpm is stricter about peer dependencies. If you encounter issues, you might need to:

```bash
# Install peer dependencies automatically
pnpm add -P package-with-peer-deps
```

Or configure in `.npmrc`:
```
auto-install-peers=true
```

## Troubleshooting Common pnpm Issues with Next.js

### Issue: Module Not Found Errors

If you see "Module not found" errors that didn't occur with npm, it's likely due to pnpm's strict dependency structure.

**Solution**: Install the missing package explicitly or use the `shamefully-hoist=true` option in `.npmrc`.

### Issue: Incompatible Packages

Some packages might not be compatible with pnpm's node_modules structure.

**Solution**: Add problematic packages to `.pnpmfile.cjs` to apply patches or use the `shamefully-hoist=true` option.

### Issue: Next.js Build Errors

If you encounter build errors specific to pnpm:

**Solution**: Try adding these settings to `.npmrc`:
```
node-linker=hoisted
shamefully-hoist=true
```

## Migration from npm to pnpm

If you're migrating an existing Next.js project from npm to pnpm:

1. Remove `node_modules` and lock files:
   ```bash
   rm -rf node_modules package-lock.json yarn.lock
   ```

2. Install pnpm:
   ```bash
   npm install -g pnpm
   ```

3. Install dependencies with pnpm:
   ```bash
   pnpm install
   ```

4. Update CI/CD configurations to use pnpm

5. Update documentation and onboarding instructions for your team

## Conclusion

pnpm offers significant advantages for Next.js projects, especially in terms of disk space efficiency, installation speed, and dependency correctness. By following the best practices outlined in this guide, you can leverage pnpm to improve your development workflow and build process.

The transition from npm/npx to pnpm is relatively straightforward, with most commands having direct equivalents. The main adjustment is using `pnpm dlx` instead of `npx` for executing one-off packages.

For most Next.js projects, pnpm is a superior choice that will save disk space, improve installation times, and provide a more reliable dependency structure. 