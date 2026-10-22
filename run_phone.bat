@echo off
rem Serves Marhaba to Expo Go on phones on the same Wi-Fi (and to the browser at http://localhost:8081).
rem Windows must treat the Wi-Fi as a Private network, with Node.js allowed through the firewall.
cd /d "%~dp0"
call npx expo start --lan --port 8081
