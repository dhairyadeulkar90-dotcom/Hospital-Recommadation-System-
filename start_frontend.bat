@echo off
echo ====================================================
echo Starting Hospital Recommender Frontend on Port 5178...
echo Open in your browser: http://localhost:5178
echo ====================================================

if exist hospital_env\Scripts\python.exe (
    hospital_env\Scripts\python.exe -m http.server 5178 --bind 127.0.0.1
) else (
    python -m http.server 5178 --bind 127.0.0.1
)

pause
