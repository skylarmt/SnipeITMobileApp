#!/bin/sh
# This script builds the app.  If you want to use it, you'll have to
# modify it to point to your android keystore and alias.
cordova build --release android
cd platforms/android/build/outputs/apk
cp android-release-unsigned.apk android-release-signed.apk
jarsigner -verbose -keystore ~/Documents/Projects/Certificates/Android/android.keystore android-release-signed.apk android
jarsigner -verify -verbose -certs android-release-signed.apk
rm android-release-signed-zipaligned.apk
zipalign -v 4 android-release-signed.apk android-release-signed-zipaligned.apk

