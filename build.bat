@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   [1/5] Bumping Application Version (+1)...
echo ===================================================
call node scripts/bump_version.mjs
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Version bump failed!
    exit /b %ERRORLEVEL%
)

for /f "tokens=2 delims=:, " %%a in ('findstr /r "\"version\":" package.json') do set "VER=%%~a"

echo ===================================================
echo   [2/5] Building Production Web Bundle (Vite)...
echo ===================================================
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web build failed!
    exit /b %ERRORLEVEL%
)

echo ===================================================
echo   [3/5] Syncing Capacitor Android Assets...
echo ===================================================
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Capacitor sync failed!
    exit /b %ERRORLEVEL%
)

echo ===================================================
echo   [4/5] Compiling Release APK (Gradle)...
echo ===================================================
set "JAVA_HOME=C:\Users\Rahat\.jdks\jbr-21.0.11"
set "ANDROID_HOME=C:\Users\Rahat\AppData\Local\Android\Sdk"
set "Path=%JAVA_HOME%\bin;%Path%"

cd android
call gradlew.bat assembleRelease --no-daemon
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gradle release build failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

echo ===================================================
echo   [5/5] Packaging APK Deliverables...
echo ===================================================
copy /y "android\app\build\outputs\apk\release\app-release.apk" "KnowledgeHub-v%VER%.apk"
copy /y "android\app\build\outputs\apk\release\app-release.apk" "KnowledgeHub.apk"

echo.
echo ===================================================
echo   SUCCESS: Knowledge Hub v%VER% Built Successfully!
echo   APK Deliverable: KnowledgeHub-v%VER%.apk
echo ===================================================
dir "KnowledgeHub-v%VER%.apk"
