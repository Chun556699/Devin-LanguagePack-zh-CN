@echo off
chcp 65001 >nul
setlocal
set "SCRIPT_DIR=%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  node "%SCRIPT_DIR%install-zh-cn.js" %*
  goto :end
)

for %%P in (
  "%SCRIPT_DIR%..\Devin.exe"
  "%LOCALAPPDATA%\Programs\Devin\Devin.exe"
  "%PROGRAMFILES%\Devin\Devin.exe"
  "C:\Devin\Devin.exe"
  "D:\Devin\Devin.exe"
  "E:\Devin\Devin.exe"
  "F:\Devin\Devin.exe"
) do (
  if exist "%%~P" (
    set "ELECTRON_RUN_AS_NODE=1"
    "%%~P" "%SCRIPT_DIR%install-zh-cn.js" %*
    goto :end
  )
)

echo [×] 未检测到 Node.js 或默认路径下的 Devin.exe。
echo 请将本文件夹放到 Devin 安装目录下运行，或安装 Node.js 后执行:
echo   node install-zh-cn.js "你的Devin安装目录"

:end
echo.
pause
