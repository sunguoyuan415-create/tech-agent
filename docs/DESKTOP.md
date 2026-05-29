# Desktop Distribution

Tech-agent desktop apps should be thin clients for the cloud service. The core agent, model calls, browser automation, code execution, and file processing should run remotely.

## Implemented Option: Tauri

Tauri keeps the installer smaller and is a good fit for a cloud-first desktop client. The scaffold lives in `apps/desktop`.

Current structure:

```txt
apps/desktop
  index.html
  src/
  src-tauri/
  package.json
```

The desktop app should load the same authenticated web workspace and add:

- System tray
- Global quick launcher
- Local notifications
- Drag-and-drop upload
- Deep links
- Auto updater

## Alternative: Electron

Electron is easier for teams that want mature auto-update and cross-platform packaging at the cost of larger installers.

Suggested release artifacts:

- `Tech-Agent-Setup-x64.exe`
- `Tech-Agent-aarch64.dmg`
- `Tech-Agent-x64.dmg`

## Release Flow

1. Push a tag such as `v1.0.0`.
2. Run `.github/workflows/desktop-release.yml`.
3. GitHub Actions builds Windows and macOS bundles.
4. Upload signed artifacts to GitHub Releases.
5. Update the Downloads page links.

## Required Secrets

- Apple Developer ID certificate
- Windows code signing certificate
- GitHub release token
- Update server signing key
