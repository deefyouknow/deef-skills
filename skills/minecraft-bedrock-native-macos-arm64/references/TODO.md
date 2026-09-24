# TODO / Known issues

- [ ] Make `1.26.51.1` launch reliably on macOS arm64.
- [ ] Investigate the SIGSEGV during `libPlayFabMultiplayer.so` constructors on 1.26.51.1.
- [ ] Re-check upstream mcpelauncher changes before carrying local patches forward.
- [ ] Rebuild the custom runtime after major Bedrock updates instead of blindly reusing old compatibility binaries.
- [ ] Confirm Microsoft/Xbox sign-in and multiplayer after each runtime rebuild.
- [ ] Confirm server discovery/ping and direct server join after each game update.
- [ ] Keep terminal-runner cleanup behavior working after launcher/runtime changes.
- [ ] Consider putting the exact source commit/patch in a persistent repo instead of relying on `/tmp` build history.

## Regression checklist

- [ ] `file mcpelauncher-client` reports arm64.
- [ ] `mc-native` opens Minecraft 1.26.50.4.
- [ ] No `pthread_sigmask` loader failure.
- [ ] No false low-storage dialog.
- [ ] ANGLE/MoltenVK initializes on Apple M2.
- [ ] Ctrl+C stops the game.
- [ ] `mc-native status` reports no client after shutdown.
- [ ] Worlds/data remain intact.
