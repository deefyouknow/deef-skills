# Use case: Minecraft Bedrock Native on Mac M2

## Why this exists

Minecraft Bedrock Android APK is being run natively on macOS arm64 through mcpelauncher, not through an Android emulator. New Bedrock releases exposed missing Android/Linux compatibility behavior in the launcher runtime.

## Failures observed

### 1. Old launcher/runtime

The older launcher was `v1.7.6` and could not launch the newer 1.26.50/1.26.51 APKs correctly.

### 2. `pthread_sigmask`

With the stock arm64 runtime, Minecraft 1.26.50.4 and 1.26.51.1 failed while loading Android libraries because `pthread_sigmask` was not available through the compatibility layer.

A source build using the macOS ARM64 compatibility changes fixed that stage and allowed 1.26.50.4 to launch.

### 3. 1.26.51.1 PlayFab crash

After passing the pthread issue, `1.26.51.1` still produced SIGSEGV while constructing `libPlayFabMultiplayer.so`. Do not treat 1.26.51.1 as known-good yet.

### 4. False "almost out of data storage space"

The Mac had roughly 29 GiB free, but Minecraft displayed the low-storage restriction dialog.
The launcher already stubbed `calculateAvailableDiskFreeSpace()` and `getUsableSpace()` to return 1 TiB, but the newer game also queried `getTotalSpace()` and that JNI method was missing.

The custom runtime was rebuilt with a `getTotalSpace()` JNI stub returning 1 TiB. After replacement, the false storage restriction was removed.

## Current paths

- Custom runtime: `~/Library/Application Support/Minecraft Bedrock Launcher/Runtime-Native`
- Active client: `Runtime-Native/bin/mcpelauncher-client`
- Pre-storage-fix backup: `Runtime-Native/bin/mcpelauncher-client.pre-storage-fix`
- Game versions: `~/Library/Application Support/mcpelauncher/versions`
- Known-good version: `1.26.50.4`
- Logs from terminal runner: `~/Library/Logs/Minecraft Bedrock Native`
- Native app wrapper: `/Applications/Minecraft Bedrock Native.app`

## Build history / source context

The repair build was created from the mcpelauncher manifest/core source tree and included the macOS arm64 compatibility patch that added the missing pthread behavior. A later local change added `getTotalSpace()` to the JNI MainActivity descriptor/stub and rebuilt `mcpelauncher-client`.

The temporary source/build tree used during the session was under `/tmp/mc-native-build`; do not assume `/tmp` survives a reboot. The installed `Runtime-Native` directory is the persistent working artifact.

## Recovery rule

Never delete `~/Library/Application Support/mcpelauncher` to repair the launcher. That directory contains user/game data. Repair or replace only the runtime/client unless the evidence points elsewhere.
