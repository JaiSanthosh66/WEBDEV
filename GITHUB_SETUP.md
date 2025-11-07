# GitHub Upload Guide

Follow these steps to upload your project to GitHub:

## Step 1: Install Git (if not already installed)

1. Download Git from: https://git-scm.com/download/win
2. Run the installer and follow the setup wizard
3. Restart your terminal/PowerShell after installation

## Step 2: Initialize Git Repository

Open PowerShell in your project directory and run:

```powershell
# Navigate to project directory (if not already there)
cd "C:\Users\jaisa\OneDrive\Desktop\WEBTEC"

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Online Bookstore project"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com and sign in (or create an account)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "online-bookstore" or "WEBTEC")
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 4: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using GitHub CLI (if installed)

If you have GitHub CLI installed, you can use:

```powershell
gh repo create YOUR_REPO_NAME --public --source=. --remote=origin --push
```

## Troubleshooting

- If you get authentication errors, you may need to set up a Personal Access Token:
  1. Go to GitHub Settings > Developer settings > Personal access tokens
  2. Generate a new token with `repo` permissions
  3. Use the token as your password when pushing

- If you need to update your .gitignore, make sure it includes:
  - `node_modules/`
  - `.env`
  - Any other sensitive files

