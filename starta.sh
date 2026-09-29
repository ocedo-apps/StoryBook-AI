#!/usr/bin/env bash
# Mac/Linux equivalent of starta.bat. Run from a terminal (./starta.sh) —
# or on macOS, double-click starta.command, which just calls this file.
cd "$(dirname "$0")" || exit 1

echo ""
echo " StoryBook AI"
echo " http://localhost:5175"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo " Node.js is missing. Install it from https://nodejs.org and run this again."
  echo ""
  read -r -p " Press Enter to close..." _
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo " Installing dependencies for the first time..."
  echo ""
  if ! npm install; then
    echo ""
    echo " npm install failed."
    read -r -p " Press Enter to close..." _
    exit 1
  fi
  echo ""
fi

echo " Starting the app. Close this window to stop the server."
echo ""
if ! npm start; then
  echo ""
  echo " Could not start. Check that port 5175 is free."
  read -r -p " Press Enter to close..." _
  exit 1
fi
