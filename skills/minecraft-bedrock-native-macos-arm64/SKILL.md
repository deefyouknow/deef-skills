---
name: minecraft-bedrock-native-macos-arm64
description: Run, repair, and troubleshoot Minecraft Bedrock natively on Apple Silicon using the custom mcpelauncher ARM64 runtime built for DEEF's Mac M2.
---

# Minecraft Bedrock Native on macOS ARM64

Use this skill when Minecraft Bedrock on the Mac M2 fails after an update, leaves stale processes, reports false low storage, or needs the custom native runtime rebuilt.

## Current known-good state

- Machine: Apple Silicon M2 / arm64.
- Known-good game: Minecraft Bedrock `1.26.50.4`.
- `1.26.51.1` still crashes in `libPlayFabMultiplayer.so`.
- Runtime: custom `mcpelauncher-client` built from source with the macOS ARM64 compatibility work used during this repair.
- Runtime path: `~/Library/Application Support/Minecraft Bedrock Launcher/Runtime-Native`.
- Game data: `~/Library/Application Support/mcpelauncher`.
- Do not delete game data/worlds while repairing the runtime.

## Normal operation

Prefer terminal foreground execution, not the Dock icon.

```text
mc-native
```

Press `Ctrl+C` to stop the game and clean leftover native client processes.
For the dedicated shell:

```text
mc-native-shell
mc
```

Inside that shell, `mcstop`, `mcclean`, and `mcstatus` are available.

To include DNS checks in debug output, pass your own space-separated hosts with `MINECRAFT_DEBUG_HOSTS='server.example.com' mc-native debug`.

## Repair workflow

1. Read `references/use-case.md` before changing anything.
2. Inspect the current game version and runtime architecture.
3. Reproduce from Terminal and capture the final crash/error.
4. Patch only the runtime layer first; preserve APK/game data.
5. Keep a backup of every working binary before replacement.
6. Verify: arm64 process, Minecraft window appears, server UI works, and Ctrl+C leaves no `Runtime-Native/bin/mcpelauncher-client` process.

## Important files

- `scripts/mc-native` — foreground runner and process cleanup.
- `scripts/mc-native-shell` — opens isolated zsh environment.
- `scripts/minecraft-native.zshrc` — aliases/help for that shell.
- `references/use-case.md` — root causes, patches, paths, recovery.
- `references/TODO.md` — unresolved compatibility work.

Do not overwrite the user's normal `~/.zshrc`; this skill intentionally uses an isolated zsh configuration.
