# ==============================================================================
# MindEase - Automated GitHub Repository Initialization & Push Script
# ==============================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " 🌿 MindEase - GitHub & Vercel Deployment Setup Helper" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check Git installation
$gitCmd = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitCmd) {
    Write-Host "❌ Git is not found in your PATH." -ForegroundColor Yellow
    Write-Host "   Please download and install Git from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "   Or install GitHub Desktop: https://desktop.github.com" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ Git is installed: $(git --version)" -ForegroundColor Green

# Check if repo is already initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing local Git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
} else {
    Write-Host "✅ Git repository already initialized." -ForegroundColor Green
}

# Stage and Commit
Write-Host "📝 Staging all project files (ignoring secrets and local DB)..." -ForegroundColor Cyan
git add .

$status = git status --porcelain
if ($status) {
    Write-Host "💾 Creating clean initial release commit..." -ForegroundColor Cyan
    git commit -m "feat: complete release of MindEase CBT Platform with USHA AI, DPDP compliance & E2E verification"
    Write-Host "✅ Commit created successfully." -ForegroundColor Green
} else {
    Write-Host "✅ Working directory clean (nothing new to commit)." -ForegroundColor Green
}

# Prompt for GitHub Remote
Write-Host ""
Write-Host "🔗 To push to GitHub:" -ForegroundColor Yellow
Write-Host "   1. Create a new empty repository on GitHub (https://github.com/new)" -ForegroundColor White
Write-Host "   2. Copy the repository HTTPS or SSH URL (e.g., https://github.com/your-username/mindease.git)" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub Repository URL (or press Enter to skip push)"

if ($repoUrl -and $repoUrl.Trim() -ne "") {
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        git remote set-url origin $repoUrl.Trim()
    } else {
        git remote add origin $repoUrl.Trim()
    }
    
    Write-Host "🚀 Pushing code to GitHub ($repoUrl)..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 SUCCESS! Your repository is live on GitHub!" -ForegroundColor Green
        Write-Host "Next step: Go to https://vercel.com/new and import this repository." -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Git push encountered an issue. Please verify your GitHub permissions or try manually running: git push -u origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Push skipped. You can push anytime with:" -ForegroundColor White
    Write-Host "   git remote add origin <YOUR_GITHUB_REPO_URL>" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done! 🌿" -ForegroundColor Green
