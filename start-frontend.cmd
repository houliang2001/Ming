@echo off
cd /d "%~dp0"
echo Starting Lingxi frontend on http://127.0.0.1:5173/
"C:\Program Files\nodejs\node.exe" scripts/dev.mjs
