@echo off
setlocal enabledelayedexpansion

for /f "tokens=2 delims=:, " %%a in ('findstr /r "\"version\":" package.json') do set "VER=%%~a"

echo ===================================================
echo   Releasing Knowledge Hub v%VER% to GitHub...
echo ===================================================

echo [1/4] Running Automated Tests...
call npm test
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Tests failed! Aborting release.
    exit /b %ERRORLEVEL%
)

echo [2/4] Committing Changes...
git add -A
git commit -m "release: Knowledge Hub v%VER%"
git push origin main

echo [3/4] Creating and Pushing Git Tag v%VER%...
git tag -d "v%VER%" 2>nul
git push origin :refs/tags/v%VER% 2>nul
git tag -a "v%VER%" -m "Knowledge Hub v%VER% Release"
git push origin "v%VER%"

echo [4/4] Creating GitHub Release and Uploading Assets...
if exist "public\data\voice_pack_v1.khpack" (
    call gh release create "v%VER%" "KnowledgeHub-v%VER%.apk" "public\data\voice_pack_v1.khpack" --title "Knowledge Hub v%VER%" --notes "### Knowledge Hub v%VER% Release Notes" --clobber
) else (
    call gh release create "v%VER%" "KnowledgeHub-v%VER%.apk" --title "Knowledge Hub v%VER%" --notes "### Knowledge Hub v%VER% Release" --clobber
)

echo.
echo ===================================================
echo   SUCCESS: Release v%VER% Published to GitHub!
echo   URL: https://github.com/mrahatcreations/KnowledgeHub/releases/tag/v%VER%
echo ===================================================
