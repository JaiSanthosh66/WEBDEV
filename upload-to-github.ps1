# PowerShell script to upload project to GitHub
# Make sure Git is installed before running this script

Write-Host "=== GitHub Upload Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if already a git repository
if (Test-Path .git) {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
    $reinit = Read-Host "Do you want to reinitialize? (y/N)"
    if ($reinit -eq "y" -or $reinit -eq "Y") {
        Remove-Item -Recurse -Force .git
        git init
        Write-Host "Repository reinitialized." -ForegroundColor Green
    }
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "Repository initialized." -ForegroundColor Green
}

# Add all files
Write-Host ""
Write-Host "Adding files to staging area..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Creating initial commit..." -ForegroundColor Cyan
    git commit -m "Initial commit: Online Bookstore project"
    Write-Host "Commit created successfully." -ForegroundColor Green
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# Get repository details
Write-Host ""
Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan
Write-Host "Please create a repository on GitHub first if you haven't already." -ForegroundColor Yellow
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo-name.git)"

if ($repoUrl) {
    # Check if remote already exists
    $remoteExists = git remote get-url origin 2>$null
    if ($remoteExists) {
        Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
        $update = Read-Host "Do you want to update it? (y/N)"
        if ($update -eq "y" -or $update -eq "Y") {
            git remote set-url origin $repoUrl
            Write-Host "Remote updated." -ForegroundColor Green
        }
    } else {
        git remote add origin $repoUrl
        Write-Host "Remote added." -ForegroundColor Green
    }
    
    # Set branch to main
    Write-Host ""
    Write-Host "Setting branch to 'main'..." -ForegroundColor Cyan
    git branch -M main
    
    # Push to GitHub
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    Write-Host "You may be prompted for your GitHub credentials." -ForegroundColor Yellow
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Successfully uploaded to GitHub!" -ForegroundColor Green
        Write-Host "Repository URL: $repoUrl" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. Please check your credentials and try again." -ForegroundColor Red
        Write-Host "You may need to use a Personal Access Token instead of password." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "No repository URL provided. Skipping remote setup." -ForegroundColor Yellow
    Write-Host "You can add it later with: git remote add origin <URL>" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan

