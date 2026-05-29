# Desktop Distribution

Tech-agent desktop apps should be thin clients for the cloud service. The core agent, model calls, browser automation, code execution, and file processing should run remotely.

## Recommended Option: Tauri

Tauri keeps the installer smaller and is a good fit for a cloud-first desktop client.

Suggested structure:

```txt
apps/desktop
  src-tauri/
  package.json
  tauri.conf.json
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

1. Build the web app.
2. Package desktop shell for Windows and macOS.
3. Sign installers.
4. Upload artifacts to GitHub Releases.
5. Update the Downloads page links.

## Required Secrets

- Apple Developer ID certificate
- Windows code signing certificate
- GitHub release token
- Update server signing key
