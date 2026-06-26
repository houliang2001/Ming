@echo off
cd /d "%~dp0"
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
npm.cmd run dev
