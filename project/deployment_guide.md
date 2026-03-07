# GitHub Deployment & Branch Configuration Guide

This guide provides a structured approach to managing branches and automating deployments for your MERN stack project (**Smart Campus Companion**).

## 1. Branching Strategy

A robust branching strategy is essential for stable deployments. We recommend the **Git Flow**-lite approach:

- **`main`**: The production-ready branch. Only stable code should be merged here. This branch usually triggers the production deployment.
- **`develop`**: The integration branch for features. New features are merged here first for testing.
- **`feature/*`**: Temporary branches for specific tasks (e.g., `feature/login-ui`). Merged into `develop` once complete.

## 2. GitHub Branch Protection Rules

To maintain code quality, configure branch protection in your GitHub repository:
1. Go to **Settings** > **Branches** > **Add rule**.
2. **Branch name pattern**: `main`.
3. Check **Require a pull request before merging**.
4. Check **Require status checks to pass before merging** (e.g., your build scripts).

## 3. Automating Deployment with GitHub Actions

Create a `.github/workflows/deploy.yml` file in your root directory to automate the build and deployment process.

### Recommended Workflow Template
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build Client
        run: |
          cd client
          npm install
          npm run build

      - name: Install Server
        run: |
          cd server
          npm install

      # Add testing steps here
      # - name: Run Tests
      #   run: npm test
```

## 4. Platform-Specific Branch Configuration

### For Frontend (Vercel / Netlify)
- **Production Branch**: Set to `main`. Every push to `main` updates the live site.
- **Preview Deployments**: Enable for all other branches. This allows you to test `develop` or `feature/*` branches on a temporary URL before merging.

### For Backend (Render / Railway / Heroku)
- **Main Web Service**: Point to the `main` branch.
- **Staging Web Service**: (Optional) Create a second service pointing to the `develop` branch to test backend logic before production.

## 5. Environment Variables
Ensure you configure secrets in GitHub (**Settings** > **Secrets and variables** > **Actions**) for any sensitive data (e.g., `MONGODB_URI`, `JWT_SECRET`) if your CI/CD needs them for testing.
