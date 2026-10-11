@echo off
cd /d "%~dp0"
echo 文创项目档案正在启动： http://127.0.0.1:4318/
echo 保持本窗口开启，关闭窗口即停止预览。
start "" "http://127.0.0.1:4318/"

where python >nul 2>nul
if errorlevel 1 goto TRY_PY
python -m http.server 4318 --bind 127.0.0.1
goto END

:TRY_PY
where py >nul 2>nul
if errorlevel 1 goto TRY_NPX
py -3 -m http.server 4318 --bind 127.0.0.1
goto END

:TRY_NPX
where npx >nul 2>nul
if errorlevel 1 goto MISSING
echo 未找到 Python，改用 Node（首次运行可能需要联网获取 http-server）...
call npx -y http-server -p 4318 -a 127.0.0.1 -c-1
goto END

:MISSING
echo.
echo 未检测到 Python 或 Node.js：请任装其一，然后重新双击本文件。
echo 也可以用任何静态服务器指向本目录并使用 4318 端口。

:END
pause
