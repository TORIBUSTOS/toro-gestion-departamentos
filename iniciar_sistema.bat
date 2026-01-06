@echo off
echo ========================================================
echo   Iniciando OIKOS (Sistema de Gestion TORO)
echo ========================================================
echo.

:: Ejecutar script unificado (Backend + Frontend en una sola terminal)
echo [1/2] Iniciando servidores unificados...
echo Si es la primera vez, asegurese de haber ejecutado 'npm install' en la raiz.
echo.

:: Usamos npm run dev desde la raiz, que ahora ejecuta 'concurrently'
start "OIKOS System" cmd /k "npm run dev"

:: Esperar a que los servicios arranquen
timeout /t 8 /nobreak >nul

:: Abrir navegador
echo [2/2] Abriendo aplicacion...
start http://localhost:5174

echo.
echo ========================================================
echo   OIKOS iniciado en ventana "OIKOS System".
echo   - Backend: http://localhost:8001
echo   - Frontend: http://localhost:5174
echo ========================================================
echo.
echo Esta ventana auxiliar se cerrara en 5 segundos.
timeout /t 5
exit
