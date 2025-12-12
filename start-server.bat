@echo off
echo Starting JobLens Local Server...
echo.
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Try Python 3 first
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    REM If Python 3 fails, try Python 2
    python -m SimpleHTTPServer 8000 2>nul
    if %errorlevel% neq 0 (
        REM If Python fails, try Node.js
        npx http-server -p 8000 2>nul
        if %errorlevel% neq 0 (
            echo Error: No suitable server found!
            echo Please install one of the following:
            echo - Python ^(recommended^): https://python.org
            echo - Node.js: https://nodejs.org
            echo.
            pause
        )
    )
)