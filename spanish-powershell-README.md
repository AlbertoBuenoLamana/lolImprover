# Instrucciones para PowerShell en Español

Este archivo contiene instrucciones para ejecutar los scripts de PowerShell en sistemas con PowerShell en español.

## Ejecutar la aplicación

Para iniciar la aplicación, siga estos pasos:

1. Abra PowerShell
2. Navegue a la carpeta del proyecto
3. Ejecute el siguiente comando para permitir la ejecución de scripts:
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. Ejecute el script de inicio:
   ```
   .\restart-simple.ps1
   ```

Si prefiere iniciar los servidores manualmente, puede usar estos comandos:

### Iniciar el backend:
```powershell
cd backend
python -m uvicorn app.main:app --reload
```

### Iniciar el frontend (en otra ventana de PowerShell):
```powershell
cd frontend
npm start
```

## Solución de problemas

Si experimenta problemas con los separadores de comandos como `&&` que no funcionan en PowerShell español, use punto y coma `;` en su lugar:

Ejemplo:
```powershell
# No funciona en PowerShell español:
cd backend && python -m uvicorn app.main:app --reload

# Sí funciona en PowerShell español:
cd backend; python -m uvicorn app.main:app --reload
```

O ejecute los comandos individualmente. 