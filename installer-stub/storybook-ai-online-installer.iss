; -- StoryBook AI — online installer stub --
;
; A small bootstrapper (roadmap-ideas.md #35), inspired by the "online
; installer" pattern on OnlyOffice's download page: instead of bundling
; everything into one large download, this tiny .exe downloads the two
; real payloads at install time —
;   1. Ollama's own official Windows installer, if Ollama isn't already
;      installed (needed to run AI models locally), run silently; and
;   2. the current StoryBook AI installer (always the latest GitHub
;      Release — this file never needs to be rebuilt just because the
;      app shipped a new version), handed off to the user normally so
;      they see the same installer screens already tested in v1.0.30+.
;
; This stub installs nothing itself (Uninstallable=no below) — it only
; orchestrates the two downloads above, then exits.
;
; Uses Inno Setup 6.3+'s built-in [Files] "download" flag (see the
; official jrsoftware/issrc Examples/DownloadFiles.iss), not a
; third-party plugin DLL — nothing extra to bundle or keep updated.

#define MyAppName "StoryBook AI Online Installer"
#define MyAppVersion "1.0"
#define StoryBookDownloadURL "https://github.com/ocedo-apps/StoryBook-AI/releases/latest/download/StoryBook-AI-Setup.exe"
#define OllamaDownloadURL "https://ollama.com/download/OllamaSetup.exe"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=Ocedo
DefaultDirName={tmp}\StoryBookAIOnlineInstaller
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=no
Uninstallable=no
PrivilegesRequired=lowest
WizardStyle=modern
OutputBaseFilename=StoryBookAI-OnlineInstaller
OutputDir=output
SetupIconFile=..\src-tauri\icons\icon.ico
SolidCompression=yes
Compression=lzma

[Messages]
WelcomeLabel2=This will set up StoryBook AI on your computer.%n%nIf Ollama (the local AI engine StoryBook AI uses) isn't already installed, this installer will download and install it automatically — that's a large download, around 1.5 GB, so it may take a few minutes depending on your connection. If Ollama is already installed, this step is skipped.%n%nStoryBook AI itself never sends your manuscript anywhere; see the in-app Guide for details.

[Files]
; Both of these are downloaded fresh at install time, not bundled into
; this .exe — ExternalSize is an approximate size in bytes, used only
; for the progress display, not a strict requirement.
Source: "{#StoryBookDownloadURL}"; DestName: "StoryBook-AI-Setup.exe"; DestDir: "{tmp}"; ExternalSize: 12000000; Flags: external download ignoreversion
Source: "{#OllamaDownloadURL}"; DestName: "OllamaSetup.exe"; DestDir: "{tmp}"; ExternalSize: 1500000000; Flags: external download ignoreversion; Check: not IsOllamaInstalled

[Run]
; Ollama's own installer is itself built with Inno Setup (confirmed via
; its documented "/DIR=" install-location override, an Inno Setup-
; specific switch) — these are Inno Setup's own standard silent-install
; switches, not something specific to Ollama.
Filename: "{tmp}\OllamaSetup.exe"; Parameters: "/SP- /VERYSILENT /SUPPRESSMSGBOXES /NORESTART"; StatusMsg: "Installing Ollama..."; Flags: waituntilterminated; Check: not IsOllamaInstalled
; Handed off normally (no silent flag) — the user finishes install the
; same way as downloading StoryBook AI directly, nothing new to learn.
Filename: "{tmp}\StoryBook-AI-Setup.exe"; Description: "Continue to the StoryBook AI installer"; Flags: nowait postinstall skipifsilent shellexec

[Code]
function IsOllamaInstalled: Boolean;
begin
  Result := FileExists(ExpandConstant('{localappdata}\Programs\Ollama\ollama.exe'));
end;
