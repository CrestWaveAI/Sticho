# Sticho

This repository contains the codebase for Sticho (StitchConnect) and setup configurations for the **GitHub Model Context Protocol (MCP) server**.

---

# Contributing to Sticho

Thank you for contributing to Sticho!

This document defines our repository structure, branching strategy, pull request workflow, and development guidelines.

---

# Repository Structure

```text
Sticho/
│
├── frontend/          # Next.js Frontend
├── backend/           # FastAPI Backend
└── .github/
    └── workflows/
```

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Backend

* FastAPI
* Python
* uv Package Manager

---

# Branching Strategy

The repository follows a Git Flow inspired workflow.

## Protected Branches

### main

Production-ready code.

Rules:

* No direct pushes
* Pull Request required
* At least 1 approval required
* CI checks must pass
* Conversations must be resolved before merge

### develop

Integration branch for all ongoing development.

Rules:

* No direct pushes
* Pull Request required
* At least 1 approval required

---

# Branch Naming Convention

## Frontend Features

```text
feature/frontend-login
feature/frontend-dashboard
feature/frontend-profile
```

## Backend Features

```text
feature/backend-auth
feature/backend-user-service
feature/backend-notifications
```

## Bug Fixes

```text
bugfix/frontend-navbar
bugfix/backend-token-expiry
```

## Hotfixes

```text
hotfix/production-crash
```

## Documentation

```text
docs/api-contracts
docs/readme-update
```

---

# Development Workflow

## 1. Sync develop

```bash
git checkout develop
git pull origin develop
```

## 2. Create Feature Branch

Frontend Example:

```bash
git checkout -b feature/frontend-login
```

Backend Example:

```bash
git checkout -b feature/backend-auth
```

---

## 3. Commit Changes

Use Conventional Commits.

Examples:

```text
feat(frontend): add login page

feat(backend): implement authentication API

fix(frontend): resolve navbar overflow

fix(backend): correct token validation

docs: update contribution guide

chore: update dependencies
```

---

## 4. Push Branch

```bash
git push origin feature/frontend-login
```

---

## 5. Open Pull Request

Target Branch:

```text
develop
```

All feature branches must be merged into develop.

Do NOT create feature PRs directly into main.

---

## 6. Code Review

Requirements:

* At least 1 approval
* CI checks passing
* No unresolved conversations

---

## 7. Merge

After approval:

```text
feature/* → develop
```

Release Flow:

```text
develop → main
```

---

# CI/CD

GitHub Actions automatically validate:

## Frontend

* Install dependencies
* Lint code
* Build application

Workflow:

```text
.github/workflows/frontend-ci.yml
```

## Backend

* Install dependencies using uv
* Validate FastAPI application startup

Workflow:

```text
.github/workflows/backend-ci.yml
```

---

# Pull Request Checklist

Before creating a PR:

* Code compiles successfully
* No lint errors
* Documentation updated if required
* Branch is up-to-date with develop
* Self-review completed

---

# Do Not

❌ Push directly to main

❌ Push directly to develop

❌ Merge without review

❌ Commit secrets, API keys, or credentials

❌ Bypass CI checks

---

## GitHub MCP Server Configuration Files

We have set up two configuration files in the root of the workspace:

1. **[mcp.json](file:///Users/amankumar/Aman/Sticho/mcp.json)**:
   * **For**: VS Code, JetBrains IDEs, Xcode, and Eclipse.
   * **How to use**: Copy the contents of this file into your IDE's MCP config settings and replace `YOUR_GITHUB_PAT` with your personal access token.

2. **[mcp_config.json](file:///Users/amankumar/Aman/Sticho/mcp_config.json)**:
   * **For**: Google Antigravity IDE and Claude Desktop manual setups.
   * **How to use**: Copy the contents into your global Antigravity/Claude configuration file (typically located at `~/.gemini/config/mcp_config.json`) and replace `YOUR_GITHUB_TOKEN_HERE` with your personal access token.
