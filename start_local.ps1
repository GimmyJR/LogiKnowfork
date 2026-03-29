# Start Script for Local Development
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`"" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend/src/LogiKnow.API; dotnet run`"" -WindowStyle Normal
Write-Host "Starting both Frontend and Backend in separate windows..."
Write-Host "Wait 15 seconds, then open http://localhost:3000"
