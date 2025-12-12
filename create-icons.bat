@echo off
echo Creating PWA icon files from logo.jpeg...

REM Create assets/icons directory if it doesn't exist
if not exist "assets\icons" mkdir "assets\icons"

REM Copy the original logo to different sizes (Windows doesn't have built-in image resizing)
REM For now, we'll just copy the original file with different names
REM In production, you'd use proper image resizing tools

copy "assets\logo.jpeg" "assets\icons\icon-72x72.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-96x96.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-128x128.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-144x144.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-152x152.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-192x192.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-384x384.jpeg"
copy "assets\logo.jpeg" "assets\icons\icon-512x512.jpeg"

echo PWA icons created successfully!
echo Note: For production, resize these images to their proper dimensions.
pause