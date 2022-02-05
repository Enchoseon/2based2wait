@echo off
title Temporary Jank Tool
echo How many minutes should we wait before starting the proxy?
set /p waitTime=$
SET /A waitTime = %waitTime% * 60
timeout %waitTime%
echo Wait finished. Starting proxy.
echo.
node proxy.js --verbose
pause > nul