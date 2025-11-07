@echo off
cls
echo.
echo ================================================================
echo     SURYA NAMASKAR - ADVANCED CORRECTION SYSTEM
echo ================================================================
echo.
echo  This opens a dedicated OpenCV window with:
echo   * Real-time angle measurements
echo   * Precise body alignment corrections  
echo   * Sequential pose guidance
echo   * Professional feedback system
echo.
echo ================================================================
echo.
echo Starting... Please wait for camera window to open.
echo.
echo TIP: Make sure you have good lighting and stand back from camera!
echo      Press 'Q' in the OpenCV window to exit when done.
echo.
echo ================================================================
echo.

cd /d "%~dp0"

REM First, activate the virtual environment if it exists
if exist "..\..\.venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call "..\..\.venv\Scripts\activate.bat"
    python correc.py
) else if exist "..\.venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call "..\.venv\Scripts\activate.bat"
    python correc.py
) else (
    echo Using system Python...
    python correc.py
)

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start the correction system!
    echo.
    echo Common fixes:
    echo 1. Make sure the Flask API server is running first
    echo 2. Install Visual C++ Redistributable 2015-2022 from Microsoft
    echo 3. Try reinstalling mediapipe:
    echo    pip uninstall mediapipe
    echo    pip install mediapipe==0.10.14
    echo.
    echo 4. Alternative: Use the web-based Practice Mode at http://localhost:3000
    echo    which has the same angle-based corrections!
    echo.
)

echo.
pause
