#!/bin/bash
# Auto-package script for APK conversion
# This runs automatically to keep the APK package updated

echo "🔄 Building LearnFlow APK package..."
npm run build > /dev/null 2>&1

if [ -d "dist" ]; then
  cd dist
  zip -r ../learnflow-apk.zip . > /dev/null 2>&1
  cd ..
  echo "✅ APK package ready: learnflow-apk.zip"
  echo "📦 Download this file and upload to webintoapp.com"
else
  echo "❌ Build failed - please contact support"
fi
