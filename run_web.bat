@echo off
rem Runs the Expo version of Marhaba in the browser at http://localhost:8081
cd /d "%~dp0"
set CI=1
call npx expo start --web --port 8081
