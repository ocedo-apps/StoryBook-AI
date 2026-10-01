; -- StoryBook AI — online installer stub --
;
; A small bootstrapper (roadmap-ideas.md #35), inspired by the "online
; installer" pattern on OnlyOffice's download page: instead of bundling
; everything into one large download, this tiny .exe downloads the two
; real payloads at install time —
;   1. Ollama's own official Windows installer, run silently — but only
;      if the user opts in on the page below AND neither Ollama nor
;      LM Studio is already detected; and
;   2. the current StoryBook AI installer (always the latest GitHub
;      Release — this file never needs to be rebuilt just because the
;      app shipped a new version), handed off to the user normally so
;      they see the same installer screens already tested in v1.0.30+.
;
; StoryBook AI's own Settings already support LM Studio (or any other
; OpenAI-compatible local server) via the "OpenAI-compatible" engine
; option — this stub's job is only to not get in that person's way by
; presuming they want Ollama too.
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
WelcomeLabel2=This will set up StoryBook AI on your computer.%n%nThe next page lets you choose whether to also install Ollama, the local AI engine StoryBook AI uses — skip it if you already use Ollama, prefer LM Studio, or have your own local server.%n%nStoryBook AI itself never sends your manuscript anywhere; see the in-app Guide for details.

[Files]
; Both of these are downloaded fresh at install time, not bundled into
; this .exe — ExternalSize is an approximate size in bytes, used only
; for the progress display, not a strict requirement.
Source: "{#StoryBookDownloadURL}"; DestName: "StoryBook-AI-Setup.exe"; DestDir: "{tmp}"; ExternalSize: 12000000; Flags: external download ignoreversion
Source: "{#OllamaDownloadURL}"; DestName: "OllamaSetup.exe"; DestDir: "{tmp}"; ExternalSize: 1500000000; Flags: external download ignoreversion; Check: WantOllama

[Run]
; Ollama's own installer is itself built with Inno Setup (confirmed via
; its documented "/DIR=" install-location override, an Inno Setup-
; specific switch) — these are Inno Setup's own standard silent-install
; switches, not something specific to Ollama.
Filename: "{tmp}\OllamaSetup.exe"; Parameters: "/SP- /VERYSILENT /SUPPRESSMSGBOXES /NORESTART"; StatusMsg: "Installing Ollama..."; Flags: waituntilterminated; Check: WantOllama
; Handed off normally (no silent flag) — the user finishes install the
; same way as downloading StoryBook AI directly, nothing new to learn.
Filename: "{tmp}\StoryBook-AI-Setup.exe"; Description: "Continue to the StoryBook AI installer"; Flags: nowait postinstall skipifsilent shellexec

[Code]
var
  OllamaChoicePage: TInputOptionWizardPage;

function IsOllamaInstalled: Boolean;
begin
  Result := FileExists(ExpandConstant('{localappdata}\Programs\Ollama\ollama.exe'));
end;

// LM Studio is a per-user install (no admin rights needed, like Ollama),
// so its uninstall registry entry should be under HKCU — checking HKLM
// too costs nothing and covers an all-users install if one exists.
function IsLMStudioInstalled: Boolean;
const
  UninstallKey = 'Software\Microsoft\Windows\CurrentVersion\Uninstall\LM-Studio';
begin
  Result := RegKeyExists(HKEY_CURRENT_USER, UninstallKey) or
    RegKeyExists(HKEY_LOCAL_MACHINE, UninstallKey);
end;

// Reflects the user's actual choice on OllamaChoicePage, not just the
// auto-detection — someone who unchecks it (or checks it, even if we
// guessed they already have something) gets what they asked for.
function WantOllama: Boolean;
begin
  Result := OllamaChoicePage.Values[0];
end;

procedure InitializeWizard;
begin
  OllamaChoicePage := CreateInputOptionPage(wpWelcome,
    'Local AI engine', 'Install Ollama?',
    'StoryBook AI needs a local AI engine to write with. Ollama is the ' +
    'one it''s built around, and this installer can set it up for you ' +
    '(a large download, around 1.5 GB, done silently in the background).' + #13#10#13#10 +
    'If you already have Ollama, already use LM Studio, or run your own ' +
    'local server, leave this unchecked — StoryBook AI''s own Settings ' +
    'can connect to any OpenAI-compatible server, LM Studio included.',
    False, False);
  OllamaChoicePage.Add('Install Ollama automatically');
  // Pre-checked only when neither is already detected — always the
  // user's own final choice via the checkbox either way.
  OllamaChoicePage.Values[0] := not (IsOllamaInstalled or IsLMStudioInstalled);
end;
