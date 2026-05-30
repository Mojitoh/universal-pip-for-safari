#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="$ROOT_DIR/safari/Universal PiP/Universal PiP.xcodeproj"
DERIVED_DATA="$ROOT_DIR/DerivedData"
BUILT_APP="$DERIVED_DATA/Build/Products/Release/Universal PiP.app"
APPLICATIONS_APP="/Applications/Universal PiP.app"
APP_ENTITLEMENTS="$ROOT_DIR/safari/app.entitlements"
EXTENSION_ENTITLEMENTS="$ROOT_DIR/safari/extension.entitlements"
SIGN_IDENTITY="$(security find-identity -p codesigning -v 2>/dev/null | sed -n 's/.*"\(Apple Development:[^"]*\)".*/\1/p' | head -1)"

if [[ ! -d "$PROJECT" ]]; then
  echo "Could not find Xcode project at $PROJECT" >&2
  exit 1
fi

pkill -x "Universal PiP" 2>/dev/null || true

xcodebuild \
  -project "$PROJECT" \
  -scheme "Universal PiP" \
  -configuration Release \
  -derivedDataPath "$DERIVED_DATA" \
  CODE_SIGNING_ALLOWED=NO \
  build

rm -rf "$APPLICATIONS_APP"
ditto "$BUILT_APP" "$APPLICATIONS_APP"
xattr -cr "$APPLICATIONS_APP"

if [[ -n "$SIGN_IDENTITY" ]]; then
  codesign --force --sign "$SIGN_IDENTITY" --options runtime --entitlements "$EXTENSION_ENTITLEMENTS" --timestamp=none "$APPLICATIONS_APP/Contents/PlugIns/Universal PiP Extension.appex"
  codesign --force --sign "$SIGN_IDENTITY" --options runtime --entitlements "$APP_ENTITLEMENTS" --timestamp=none "$APPLICATIONS_APP"
else
  codesign --force --sign - --entitlements "$EXTENSION_ENTITLEMENTS" "$APPLICATIONS_APP/Contents/PlugIns/Universal PiP Extension.appex"
  codesign --force --sign - --entitlements "$APP_ENTITLEMENTS" "$APPLICATIONS_APP"
fi

codesign --verify --deep --strict "$APPLICATIONS_APP"
pluginkit -a "$APPLICATIONS_APP/Contents/PlugIns/Universal PiP Extension.appex" 2>/dev/null || true
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f -R -trusted "$APPLICATIONS_APP"
/usr/bin/open -n "$APPLICATIONS_APP"
/usr/bin/open -a Safari

echo ""
echo "Universal PiP is installed at $APPLICATIONS_APP"
echo "Enable it in Safari Settings > Extensions."
echo "For Safari web apps such as YouTube added to the Dock, also enable it in App Name > Settings > Extensions."
