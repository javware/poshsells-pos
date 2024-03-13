echo off
C:
cd C:\Users\usuario\Desktop\Trabajos\poshsells-pos
CALL C:\Users\usuario\Desktop\Trabajos\poshsells-pos\venv\Scripts\activate.bat
start "" http://localhost:8000
manage.py runserver 0.0.0.0:8000