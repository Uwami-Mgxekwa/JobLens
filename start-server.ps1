# JobLens Local Server Starter
Write-Host "Starting JobLens Local Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Try Python 3 first
try {
    python -m http.server 8000
}
catch {
    # If Python 3 fails, try Python 2
    try {
        python -m SimpleHTTPServer 8000
    }
    catch {
        # If Python fails, try Node.js
        try {
            npx http-server -p 8000
        }
        catch {
            Write-Host "Error: No suitable server found!" -ForegroundColor Red
            Write-Host "Please install one of the following:" -ForegroundColor Yellow
            Write-Host "- Python (recommended): https://python.org" -ForegroundColor White
            Write-Host "- Node.js: https://nodejs.org" -ForegroundColor White
            Write-Host ""
            Read-Host "Press Enter to exit"
        }
    }
}