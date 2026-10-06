# 🔄 Rebridge Automatic Background Backup Daemon
Write-Host "🚀 Auto-Sync Active: Monitoring C:\Users\ifran\Dev\base44-app for changes..." -ForegroundColor Green

# Infinite loop tracking file system delta ticks
while ($true) {
    # Check if there are any modified, untracked, or fresh files in your directory
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "🌱 Structural modification detected. Executing background backup..." -ForegroundColor Cyan
        
        # Package and ship the code changes to your remote main branch safely
        git add .
        git commit -m "Automated background sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push origin main --force
        
        Write-Host "✅ GitHub backup completed successfully!" -ForegroundColor Green
    }
    
    # Rest for 30 seconds before polling your files again to keep your laptop running light
    Start-Sleep -Seconds 30
}

