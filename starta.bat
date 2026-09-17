@echo off
chcp 65001 >nul
title StoryBook AI
cd /d "%~dp0"

echo.
echo  StoryBook AI
echo  http://localhost:5175
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  Node.js saknas. Installera det fran https://nodejs.org och kor filen igen.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  Installerar beroenden forsta gangen...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo  npm install misslyckades.
    pause
    exit /b 1
  )
  echo.
)

echo  Startar appen. Stang detta fonster for att stoppa servern.
echo.
call npm start
if errorlevel 1 (
  echo.
  echo  Kunde inte starta. Kontrollera att port 5175 ar ledig.
  pause
  exit /b 1
)
