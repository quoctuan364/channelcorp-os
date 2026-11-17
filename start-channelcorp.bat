@echo off
title ChannelCorp OS - Autonomous Multi-Agent Media Agency
echo ======================================================
echo Starting ChannelCorp OS Server on port 4322...
echo Open your browser at: http://localhost:4322
echo ======================================================
if exist "C:\Users\Admin\AppData\Roaming\Antigravity\bin\agy-node.cmd" (
    call "C:\Users\Admin\AppData\Roaming\Antigravity\bin\agy-node.cmd" "%~dp0server\index.js"
) else (
    node "%~dp0server\index.js"
)
pause
