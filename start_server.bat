@echo off
echo ====================================================
echo Starting Hospital Recommendation Server...
echo ====================================================

if exist hospital_env\Scripts\python.exe (
    hospital_env\Scripts\python.exe main.py
) else (
    python main.py
)

pause
