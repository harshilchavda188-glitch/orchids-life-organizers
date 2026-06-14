@echo off
setlocal enabledelayedexpansion
title Orchid's Life Organizer - Launcher
cd /d "%~dp0"

color 0A
echo ============================================
echo    Orchid's Life Organizer - Launcher
echo ============================================
echo.

:menu
echo Select an option:
echo.
echo  [1] Install all dependencies
echo  [2] Run full project (Frontend + Backend + Expo + Database)
echo  [3] Exit
echo.
set choice=
set /p choice="Enter choice [1-3]: "
if "%choice%"=="" set choice=2

if "%choice%"=="1" goto install
if "%choice%"=="2" goto run
if "%choice%"=="3" goto :eof

echo Invalid choice. Please try again.
timeout /t 2 /nobreak >nul
goto menu

:: ====== INSTALL ALL DEPENDENCIES ======
:install
echo.
echo ============================================
echo    Installing all dependencies...
echo ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js is NOT installed. Install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Install root dependencies
echo.
echo [1/2] Installing web (Next.js) dependencies...
if exist "node_modules" (
    echo [SKIP] node_modules already exists. Delete it first if you want to reinstall.
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo [FAIL] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Web dependencies installed
)

:: Install mobile dependencies
echo.
echo [2/2] Installing mobile (Expo) dependencies...
if exist "mobile\node_modules" (
    echo [SKIP] mobile/node_modules already exists. Delete it first if you want to reinstall.
) else (
    pushd mobile
    call npm install
    if !errorlevel! neq 0 (
        echo [FAIL] Mobile dependencies install failed
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Mobile dependencies installed
)

echo.
echo ============================================
echo    All dependencies installed successfully!
echo ============================================
echo.
pause
goto menu

:: ====== RUN FULL PROJECT ======
:run
echo.
echo ============================================
echo    Starting full project...
echo ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js is NOT installed. Install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Install dependencies if missing
if not exist "node_modules" (
    echo [....] Installing web dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [FAIL] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Web dependencies installed
)

if not exist "mobile\node_modules" (
    echo [....] Installing mobile dependencies...
    pushd mobile
    call npm install
    if !errorlevel! neq 0 (
        echo [FAIL] Mobile dependencies install failed
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Mobile dependencies installed
)

:: Run database migration
echo.
echo [....] Setting up database...
call npx tsx src/lib/db/migrate.ts
if %errorlevel% neq 0 (
    echo [WARN] Database setup issue, continuing...
) else (
    echo [OK] Database ready
)

:: Create logs directory
if not exist logs mkdir logs

:: Kill any leftover processes from previous run
set "PID_FILE=%temp%\orchids_pids.txt"
if exist "%PID_FILE%" (
    for /f "usebackq tokens=*" %%p in ("%PID_FILE%") do (
        taskkill /f /pid %%p >nul 2>&1
    )
    del "%PID_FILE%" 2>nul
)

echo.
echo ============================================
echo    Starting services...
echo ============================================
echo.

:: 1. Database (SQLite via Drizzle) - runs as part of Next.js
:: 2. Backend PHP API
where php >nul 2>&1
if %errorlevel% equ 0 (
    start "Orchid - PHP API" /MIN cmd /c "title Orchid - PHP API && php -S localhost:8000 -t api api/index.php > logs\php_api.log 2>&1"
    echo [1/4] [OK] PHP API started   ^> http://localhost:8000
) else (
    echo [1/4] [SKIP] PHP API (PHP not found)
)

:: 3. Expo Mobile app
start "Orchid - Expo" /MIN cmd /c "title Orchid - Expo && cd /d "%~dp0mobile" && npx expo start --tunnel > ..\logs\expo.log 2>&1"
timeout /t 3 /nobreak >nul
echo [2/4] [OK] Expo Mobile started  ^> Check logs\expo.log

:: 4. Next.js (Frontend + Backend)
start "Orchid - Next.js" /MIN cmd /c "title Orchid - Next.js && cd /d "%~dp0" && npx next dev --turbopack > logs\nextjs.log 2>&1"
timeout /t 5 /nobreak >nul
echo [3/4] [OK] Next.js started      ^> http://localhost:3000
echo [4/4] [OK] Database ready       ^> SQLite (smartlife.db)

:: Collect PIDs
for /f "skip=3 tokens=2" %%a in ('tasklist /v /fi "WINDOWTITLE eq Orchid - *" /fo csv 2^>nul') do (
    set "pid=%%~a"
    if not "!pid!"=="" (
        echo !pid!>> "%PID_FILE%"
    )
)

echo.
echo ============================================
echo    ALL SERVICES RUNNING
echo ============================================
echo.
echo    Frontend + API:  http://localhost:3000
echo    PHP API:         http://localhost:8000
echo    Expo (Mobile):   Check logs\expo.log
echo    Logs:            .\logs\*.log
echo.
echo    Press any key to STOP all services.
echo ============================================

:: Auto-open browser
timeout /t 2 /nobreak >nul
start http://localhost:3000

:: Wait for key press, then clean up
pause >nul

:cleanup
echo.
echo [INFO] Stopping all services...
if exist "%PID_FILE%" (
    for /f "usebackq tokens=*" %%p in ("%PID_FILE%") do (
        taskkill /f /pid %%p >nul 2>&1
    )
    del "%PID_FILE%" 2>nul
)
taskkill /f /fi "WINDOWTITLE eq Orchid - *" >nul 2>&1
echo [OK] All services stopped.
echo.
pause
goto menu
