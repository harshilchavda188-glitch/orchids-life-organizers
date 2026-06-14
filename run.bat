@echo off
setlocal enabledelayedexpansion
title Smart Life - One Click Launcher
cd /d "%~dp0"

set "PID_FILE=%temp%\smartlife_pids.txt"
set "NEXT_PORT=3000"
set "PHP_PORT=8000"

if exist "%PID_FILE%" del "%PID_FILE%"

color 0A
echo ============================================
echo    Smart Life - Orchid's Life Organizer
echo    One-Click Launcher
echo ============================================
echo.

:menu
echo Select services to start:
echo.
echo  [1] All services (PHP API + Next.js + Expo)
echo  [2] Web only (Next.js)
echo  [3] Web + PHP API
echo  [4] Web + Expo Mobile
echo  [5] Exit
echo.
set choice=
set /p choice="Enter choice [1-5]: "
if "%choice%"=="" set choice=1

set START_PHP=0
set START_EXPO=0
set START_NEXT=0

if "%choice%"=="1" set START_PHP=1&set START_EXPO=1&set START_NEXT=1
if "%choice%"=="2" set START_NEXT=1
if "%choice%"=="3" set START_PHP=1&set START_NEXT=1
if "%choice%"=="4" set START_EXPO=1&set START_NEXT=1
if "%choice%"=="5" goto :eof

if %START_NEXT%%START_PHP%%START_EXPO%==000 (
    echo Invalid choice. Please try again.
    timeout /t 2 /nobreak >nul
    goto menu
)

echo.
echo ============================================
echo    Pre-flight checks...
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

:: Check ports
if %START_NEXT%==1 (
    netstat -ano | findstr ":%NEXT_PORT% " >nul 2>&1
    if !errorlevel! equ 0 (
        echo [WARN] Port %NEXT_PORT% is already in use. Next.js may fail.
    ) else (
        echo [OK] Port %NEXT_PORT% is available
    )
)

if %START_PHP%==1 (
    where php >nul 2>&1
    if !errorlevel! neq 0 (
        echo [WARN] PHP not found - skipping PHP API server
        set START_PHP=0
    ) else (
        netstat -ano | findstr ":%PHP_PORT% " >nul 2>&1
        if !errorlevel! equ 0 (
            echo [WARN] Port %PHP_PORT% is already in use. PHP API may fail.
        ) else (
            echo [OK] Port %PHP_PORT% is available
        )
    )
)

:: Install root dependencies if needed
if not exist "node_modules" (
    echo.
    echo [....] Installing web dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [FAIL] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Web dependencies installed
)

:: Run database migration
echo [....] Setting up database...
call npx tsx src/lib/db/migrate.ts
if %errorlevel% neq 0 (
    echo [WARN] Database setup issue, continuing...
) else (
    echo [OK] Database ready
)

:: Install mobile dependencies if needed
if %START_EXPO%==1 (
    if not exist "mobile\node_modules" (
        echo [....] Installing mobile dependencies...
        pushd mobile
        call npm install
        if !errorlevel! neq 0 (
            echo [WARN] Mobile dependencies install failed, continuing..."
        ) else (
            echo [OK] Mobile dependencies installed
        )
        popd
    )
)

:: Kill any leftover processes from previous run
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

:: 1. PHP API backend
if %START_PHP%==1 (
    start "Smart Life - PHP API" /MIN cmd /c "title Smart Life - PHP API && php -S localhost:%PHP_PORT% -t api api/index.php > logs\php_api.log 2>&1"
    if not exist logs mkdir logs
    echo [1/3] [OK] PHP API started  ^> http://localhost:%PHP_PORT%
    echo PHP_API:!errorlevel! >> "%PID_FILE%"
) else (
    echo [1/3] [SKIP] PHP API
)

:: 2. Expo Mobile app
if %START_EXPO%==1 (
    if not exist logs mkdir logs
    start "Smart Life - Expo" /MIN cmd /c "title Smart Life - Expo && cd /d "%~dp0mobile" && npx expo start --tunnel > ..\logs\expo.log 2>&1"
    timeout /t 3 /nobreak >nul
    echo [2/3] [OK] Expo started  ^> Check expo terminal or log
) else (
    echo [2/3] [SKIP] Expo Mobile
)

:: 3. Next.js (Frontend + API Backend)
if %START_NEXT%==1 (
    if not exist logs mkdir logs
    start "Smart Life - Next.js" /MIN cmd /c "title Smart Life - Next.js && cd /d "%~dp0" && npx next dev --turbopack > logs\nextjs.log 2>&1"
    timeout /t 5 /nobreak >nul
    echo [3/3] [OK] Next.js started  ^> http://localhost:%NEXT_PORT%
    echo NEXT:!errorlevel! >> "%PID_FILE%"
) else (
    echo [3/3] [SKIP] Next.js
)

:: Collect PIDs of started windows
for /f "skip=3 tokens=2" %%a in ('tasklist /v /fi "WINDOWTITLE eq Smart Life - *" /fo csv 2^>nul') do (
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
echo    PID file: %PID_FILE%
echo.

if %START_NEXT%==1 echo    Frontend + API:  http://localhost:%NEXT_PORT%
if %START_PHP%==1  echo    PHP API:         http://localhost:%PHP_PORT%
if %START_EXPO%==1 echo    Expo (Mobile):   Check logs\expo.log or Expo terminal
echo.
echo    Logs: .\logs\*.log
echo.
echo    Press any key to STOP all services.
echo ============================================
echo.

:: Auto-open browser for Next.js
if %START_NEXT%==1 (
    timeout /t 2 /nobreak >nul
    start http://localhost:%NEXT_PORT%
)

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
:: Also kill by window title as fallback
taskkill /f /fi "WINDOWTITLE eq Smart Life - *" >nul 2>&1
echo [OK] All services stopped.
echo.
pause
