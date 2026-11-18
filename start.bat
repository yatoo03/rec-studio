@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages, this takes a minute...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

if not exist .env.local (
  node setup.mjs
  if errorlevel 1 (
    pause
    exit /b 1
  )
  node check-aws.mjs
)

echo.
echo Starting REC.STUDIO. Keep this window open while you use the app.
echo Open the "Local" address shown below ^(it ends with :3000 or :3001^).
echo.
call npm run dev:https
pause
