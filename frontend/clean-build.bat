@echo off
echo Cleaning TypeScript cache...
rmdir /s /q node_modules\.cache
echo Cleaning build folder...
rmdir /s /q build
echo Updating node modules...
npm install
echo Starting the application...
npm start 