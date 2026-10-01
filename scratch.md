# PRD — Cross-Platform Personal Media Viewer & Player

**Status:** V1 Planning
**Primary platforms:** Windows + macOS
**Primary user:** Owner
**Product type:** Personal desktop utility
**Distribution priority:** Personal use first; public showcase/download optional
**Core principle:** One app, one codebase, two modules: Viewer + Player.

---

# 1. Product Vision

Build a lightweight cross-platform desktop media application that provides a
consistent personal media viewing and playback experience across Windows and macOS.

The product is NOT intended to compete with full-featured applications such as
VLC, IINA, Photos, Preview, or professional media tools.

The product exists because the Owner wants:

1. consistent interaction behavior across Windows and macOS;
2. direct control over shortcuts and workflow;
3. a lightweight tool tailored to personal usage;
4. one unified application for images, audio, and video;
5. a maintainable project that can also be used as a personal showcase.

Core idea:

> Media type changes. Core interaction should remain predictable.

---

# 2. Product Structure

The application is ONE product and ONE codebase.

Internally it contains two major modules:

- Viewer — image viewing and image selection;
- Player — audio/video playback.

Shared functionality belongs in a shared core rather than being duplicated.

Conceptual architecture:

                    Media App
                       │
          ┌────────────┴────────────┐
          │                         │
       Viewer                    Player
       Images                 Audio / Video
          │                         │
          └────────────┬────────────┘
                       │
                  Shared Core
                       │
              File navigation
              Mark state
              Keyboard system
              Clipboard
              Filesystem
              Platform adapters
              Configuration

Viewer and Player MUST remain logically separated modules even though they share
the same application.

---

# 3. Product Goals

## G1 — Cross-platform consistency

The same supported shortcut should have the same conceptual behavior on Windows
and macOS.

Platform-specific conventions may use:

- Ctrl on Windows;
- Cmd on macOS;

when appropriate.

Do not duplicate product behavior unnecessarily between platforms.

---

## G2 — Fast local media consumption

User should be able to:

- double-click/open a supported local media file;
- immediately view/play it;
- navigate nearby media files;
- perform common actions primarily using the keyboard.

Startup and file switching should feel lightweight.

---

## G3 — Lightweight media selection

User can mark interesting media while browsing.

For Viewer V1, marked images can be copied together after browsing.

Mark is temporary session state in V1.

No database is required for mark persistence.

---

## G4 — Focused playback controls

Player prioritizes the Owner's preferred keyboard workflow instead of exposing
a large number of media-player features.

---

## G5 — Maintainability

OS-specific behavior must be isolated from product logic.

Updating Windows/macOS or replacing a media dependency should not require
rewriting Viewer/Player behavior.

---

# 4. Supported Media — V1

Initial target formats:

## Images

- JPEG / JPG
- PNG
- WebP
- GIF
- AVIF if supported reliably by selected stack without significant additional
  complexity

## Video

- MP4
- MOV
- WebM
- MKV

## Audio

- MP3
- WAV
- FLAC
- M4A

Actual codec support may depend on the selected media engine.

Do NOT build custom codecs.

Reuse mature existing media libraries/engines.

---

# 5. Shared Media Navigation

When a local media file is opened, the application should know:

- current file path;
- parent directory;
- supported media files available in that directory;
- current position in the relevant file list.

Sorting must be deterministic.

V1 recommended default:

- filename ascending;
- natural sorting where practical.

Example:

01.jpg
02.jpg
03.jpg
10.jpg

rather than:

01.jpg
02.jpg
10.jpg
03.jpg

Do not recursively scan subdirectories in V1.

---

# 6. Mark System

Viewer and Player share the concept:

> M = Mark / Unmark current media.

Internal state can conceptually be:

markedFiles = Set<FilePath>

Requirements:

- M toggles mark state;
- current mark state must be visually visible;
- UI shows number of marked files where appropriate;
- mark state only needs to survive during the current application session;
- closing the application may clear all marks.

V1 does NOT require:

- database;
- tags;
- rating;
- favorites library;
- persistent collections;
- cloud sync.

---

# 7. Viewer Module

## 7.1 Primary job

Allow the user to quickly inspect images at useful viewing size and select
interesting images.

Core flow:

Open image
    ↓
Browse images
    ↓
Mark / Unmark
    ↓
Finish browsing
    ↓
Copy all marked images
    ↓
Paste into Finder / Explorer / another compatible destination

---

# 8. Viewer Controls

Required:

| Input | Behavior |
|---|---|
| Left Arrow | Previous image |
| Right Arrow | Next image |
| M | Mark / Unmark current image |
| Ctrl+C / Cmd+C | Copy all marked images to OS clipboard |

Copy must copy FILE REFERENCES suitable for normal OS paste behavior.

It must NOT merely copy:

- image pixels;
- filenames as text;
- paths as text.

Expected behavior:

Mark:
A.jpg
C.jpg
F.jpg

Cmd/Ctrl+C

Then paste into Finder/Explorer:

A.jpg
C.jpg
F.jpg

---

# 9. Viewer UI

Keep UI minimal.

Minimum information:

- current image;
- mark status;
- marked count;
- optional current position, e.g. `12 / 83`.

Avoid permanent toolbars that unnecessarily reduce image viewing area.

Controls may appear contextually or as minimal overlays.

V1 does not need:

- image editing;
- crop;
- rotate persistence;
- color adjustment;
- annotation;
- image library;
- EXIF management;
- batch rename;
- duplicate detection.

Basic zoom may be implemented if inexpensive, but it must not delay V1 core flow.

---

# 10. Player Module

Player handles:

- audio;
- video.

Player behavior should remain as consistent as practical between the two.

Audio may display available metadata instead of video content.

---

# 11. Player Keyboard Contract

Required V1 shortcuts:

| Input | Behavior |
|---|---|
| Space | Play / Pause |
| 0–9 | Jump to corresponding timeline percentage |
| Left Arrow | Seek backward 1 second |
| Right Arrow | Seek forward 1 second |
| Shift + Left Arrow | Seek backward 5 seconds |
| Shift + Right Arrow | Seek forward 5 seconds |
| Ctrl/Cmd + Left Arrow | Previous media file |
| Ctrl/Cmd + Right Arrow | Next media file |
| M | Mark / Unmark current media |
| `[` | Set loop point A |
| `]` | Set loop point B |
| TBD shortcut | Enable / Disable A–B Loop |

0–9 mapping:

0 → 0%
1 → 10%
2 → 20%
...
9 → 90%

Seek operations must clamp to valid timeline boundaries.

Example:

currentTime = 0.5 s
Left Arrow
→ 0 s

Do not create negative timestamps.

---

# 12. A–B Loop

User can define:

A = loop start
B = loop end

Requirements:

- `[` sets A to current playback position;
- `]` sets B to current playback position;
- UI visually indicates A and B;
- timeline should show A/B markers if practical;
- dedicated UI control toggles A–B loop on/off;
- keyboard shortcut for loop toggle may be finalized later.

Valid loop requires:

A < B

Invalid states must not crash playback.

Examples:

- only A exists;
- only B exists;
- B <= A;
- user seeks outside A–B;
- file changes.

Changing media file should reset A/B state in V1.

---

# 13. Adaptive Audio Fade for A–B Loop

Purpose:

Avoid harsh audio transitions at loop boundaries.

This is playback behavior only.

NEVER modify the source media file.

V1 rule:

loopDuration = B - A

if loopDuration < 500 ms:
    fadeDuration = 0
else:
    fadeDuration = min(loopDuration * 0.02, 100 ms)

Loop transition:

approach B
    ↓
fade-out
    ↓
seek to A
    ↓
fade-in
    ↓
continue playback

Example:

1 s loop → ~20 ms fade
2 s loop → ~40 ms fade
3 s loop → ~60 ms fade
5+ s loop → max 100 ms fade

This is NOT crossfade.

Do not implement simultaneous mixing of audio around B and A.

If selected media engine cannot provide sufficiently smooth implementation
without substantial architecture complexity, document the limitation before
implementing a workaround.

Do not build a custom audio engine solely for this feature.

---

# 14. Audio Metadata

For supported audio files, read available metadata such as:

- Title
- Artist
- Album
- Album Artist
- Track
- Year
- Genre
- Embedded album artwork

MP3 ID3 tags are one expected metadata source.

Display only available useful fields.

Missing metadata must not be treated as an error.

Fallback may use filename as display title.

V1 is READ-ONLY.

V1 explicitly excludes:

- metadata editing;
- batch tag editing;
- artwork editing;
- music library management.

---

# 15. Player UI

Video mode should prioritize the media itself.

Audio mode may prioritize:

- album artwork;
- title;
- artist;
- album;
- playback timeline.

Shared player UI should include:

- play/pause state;
- timeline;
- current time;
- duration;
- A/B markers when set;
- A–B loop state;
- mark state.

Do not attempt to recreate a professional media player control surface.

---

# 16. YouTube — NOT V1

YouTube support is explicitly OUT OF SCOPE for V1.

Possible future V1.x/V2 behavior:

User pastes YouTube URL
    ↓
extract video ID
    ↓
use official YouTube embedded player/API

Do NOT design V1 around:

- downloading YouTube videos;
- extracting raw YouTube streams;
- yt-dlp integration;
- bypassing YouTube playback mechanisms.

If YouTube support is later implemented through the official embedded player,
capabilities may differ from local media.

Example:

| Capability | Local | YouTube Embed |
|---|---|---|
| Play/Pause | Yes | Yes |
| Percentage seek | Yes | Yes |
| Time seek | Yes | Yes |
| A–B behavior | Yes | Potentially |
| Mark | Yes | Yes, URL/video reference |
| Local file navigation | Yes | No |

Do not force identical capabilities when underlying sources cannot support them.

---

# 17. Recommended Technical Architecture

Preferred initial stack:

## Desktop framework

Tauri 2.x

Reasons:

- single cross-platform application;
- lightweight compared with a full Electron runtime;
- suitable for personal desktop utility;
- Rust backend provides filesystem/native integration;
- web frontend allows fast UI iteration.

Do not introduce Electron unless a concrete blocker in Tauri is demonstrated.

---

## Frontend

Recommended:

- TypeScript
- React
- Vite

Keep frontend dependency count small.

Do NOT introduce a heavy UI framework unless justified.

CSS may be:

- plain CSS / CSS modules;
- or another lightweight approach already familiar to the implementation agent.

Product does not require a design system framework.

---

## Native / Application Core

Rust through Tauri commands/plugins where native access is required.

Responsibilities may include:

- filesystem;
- directory enumeration;
- natural file sorting;
- clipboard file references;
- platform detection;
- file-open events;
- OS integration;
- media-engine bridge if necessary.

Do not move simple presentation state into Rust unnecessarily.

---

# 18. Media Engine

Preferred investigation target:

mpv / libmpv

FFmpeg may exist underneath or be used where appropriate.

IMPORTANT:

Do NOT implement decoding, demuxing, or codec handling manually.

Before implementation, agent must verify:

1. current libmpv integration options with Tauri 2;
2. Windows packaging;
3. macOS Apple Silicon packaging;
4. redistribution/license implications;
5. video rendering integration;
6. audio/video seek support;
7. volume control/fade feasibility;
8. metadata availability;
9. application bundle size;
10. behavior when required codecs are unavailable.

If libmpv integration introduces disproportionate complexity, agent may propose
an alternative media engine BEFORE implementation.

Alternative must preserve:

- cross-platform behavior;
- required formats;
- seeking;
- A–B looping;
- metadata access;
- reasonable packaging.

Do not silently replace the architecture.

---

# 19. Image Rendering

Use platform/web decoding where reliable.

Introduce an additional image decoder only when required for target formats.

Do not use FFmpeg for every image by default unless implementation evidence
shows a clear benefit.

Gracefully handle unsupported/corrupted files.

---

# 20. Platform Adapter Boundary

OS-specific code must be isolated.

Conceptual structure:

src/
  core/
    media_navigation
    mark_state
    shortcuts
    file_sorting

  viewer/
    image_view
    viewer_controls

  player/
    playback
    timeline
    ab_loop
    adaptive_fade
    metadata

  platform/
    windows/
    macos/

Platform-specific concerns include:

- clipboard;
- file associations;
- open-with events;
- installer/bundle behavior;
- permissions;
- native paths;
- OS-specific shortcuts where necessary.

Do NOT scatter:

if windows ...
if macos ...

through product logic.

---

# 21. File Association / Open Behavior

Target behavior:

User double-clicks a supported file
    ↓
OS opens Media App
    ↓
App opens that file
    ↓
App enumerates relevant neighboring supported media
    ↓
navigation becomes immediately available

Support file association for V1 target formats where practical.

Exact installer/association implementation may differ by OS.

Do not modify unrelated OS defaults.

---

# 22. Windows Target

Initial target:

- Windows 11+
- x64

Do not spend effort supporting Windows versions the Owner does not use unless
later required.

Package should be installable/runnable without a development environment.

---

# 23. macOS Target

Initial target:

- modern macOS version used by Owner;
- Apple Silicon first.

Intel Mac support is NOT required for V1 unless trivial.

Agent must configure an explicit minimum deployment target.

Do not artificially support old macOS releases without a concrete requirement.

Consider:

- app signing;
- Gatekeeper;
- notarization requirements;
- file access permissions;
- app bundle behavior.

For personal development builds, signing/notarization may initially be deferred
if this significantly slows implementation.

Architecture must not prevent adding them later.

---

# 24. OS Update Compatibility

Application should minimize direct dependence on unstable/private OS APIs.

After major OS updates, expected maintenance process is smoke testing rather
than automatic code changes.

Minimum smoke test:

- launch application;
- open file by double-click;
- image rendering;
- audio playback;
- video playback;
- previous/next navigation;
- mark/unmark;
- copy marked files;
- clipboard paste into Finder/Explorer;
- 1s/5s seek;
- 0–9 seek;
- A/B points;
- A–B loop;
- fade transition;
- metadata;
- fullscreen if implemented;
- file association;
- reopen application.

Dependency updates should be preferred over custom OS-specific workarounds when
the dependency is the actual source of incompatibility.

---

# 25. Error Handling

Application must fail gracefully for:

- corrupted media;
- unsupported codec;
- missing/deleted file;
- file moved while application is open;
- permission denied;
- empty directory;
- metadata unavailable;
- invalid A/B state;
- clipboard failure;
- media engine failure.

Do not crash the entire application because one media file is invalid.

When navigating a folder, unsupported files may be skipped.

---

# 26. Performance Principles

This is a local lightweight utility.

Prioritize:

1. startup speed;
2. fast next/previous media;
3. responsive keyboard controls;
4. low idle resource usage;
5. predictable behavior.

For images, preload the next/previous image only if it materially improves
navigation and does not create unnecessary memory usage.

Do not preload an entire large folder.

For video/audio, leave buffering/decoding strategy primarily to the media engine.

---

# 27. V1 Non-Goals

V1 explicitly does NOT include:

- media library;
- persistent favorites;
- rating system;
- tagging;
- playlists;
- media editing;
- image editing;
- video editing;
- audio editing;
- transcoding;
- format conversion;
- subtitle management system;
- streaming services;
- YouTube integration;
- YouTube downloading;
- cloud storage;
- cloud sync;
- accounts;
- authentication;
- analytics backend;
- social features;
- casting;
- DLNA;
- AirPlay implementation;
- metadata editing;
- recursive folder library;
- AI features.

When implementation asks:

> "Would feature X be useful?"

Default answer for V1 is:

> No, unless X is necessary for the defined Viewer or Player flow.

---

# 28. V1 Core Flows

## Viewer

Open image
→ inspect
→ Previous / Next
→ Mark useful images
→ Copy marked
→ Paste elsewhere

## Video

Open video
→ Play
→ Seek ±1 / ±5 seconds
→ Percentage jump
→ Set A/B if needed
→ Loop segment
→ Navigate to another file

## Audio

Open audio
→ Read metadata
→ Play
→ Seek
→ Set A/B if needed
→ Loop segment
→ Navigate to another file

---

# 29. Acceptance Criteria

## AC-01 — Cross-platform launch

Given supported Windows/macOS environment,
when application is launched,
then main application starts successfully without development tooling.

## AC-02 — Open image

Given a supported image,
when opened through application or OS association,
then Viewer renders the image and identifies neighboring supported images.

## AC-03 — Viewer navigation

Given multiple supported images in a folder,
when Left/Right is pressed,
then Viewer moves predictably through the naturally sorted image list.

## AC-04 — Mark

Given any supported local media,
when M is pressed,
then current file toggles marked/unmarked state and UI reflects it.

## AC-05 — Copy marked images

Given multiple marked images,
when Ctrl+C / Cmd+C is pressed,
then OS clipboard contains those files as file references and they can be pasted
into Explorer/Finder.

## AC-06 — Playback

Given supported audio/video,
when opened,
then media can play/pause reliably.

## AC-07 — Seek

Given playable media,
when Arrow / Shift+Arrow / 0–9 shortcuts are used,
then playback seeks according to the keyboard contract and remains within valid
timeline boundaries.

## AC-08 — File navigation

Given multiple relevant media files,
when Ctrl/Cmd+Left/Right is used,
then Player opens previous/next media according to deterministic ordering.

## AC-09 — A/B

Given valid A < B,
when loop is enabled,
then playback repeatedly plays the A–B region.

## AC-10 — Adaptive fade

Given A–B duration >= 500 ms,
when loop boundary is reached,
then the audio transition uses the defined adaptive fade behavior without
modifying the source file.

Given duration < 500 ms,
then no fade is applied.

## AC-11 — Metadata

Given an audio file containing supported metadata,
when opened,
then available title/artist/album/artwork information is displayed.

Given metadata is missing,
then playback still works.

## AC-12 — Invalid media

Given unsupported/corrupt media,
when opening fails,
then user receives a useful error state and application remains operational.

---

# 30. Implementation Priority

## Phase 0 — Technical Spike

DO NOT build full UI yet.

Verify:

- Tauri 2 Windows/macOS builds;
- selected media engine;
- video rendering;
- audio playback;
- seek;
- file-open event;
- clipboard file copy;
- packaging feasibility.

Deliverable:

> Tiny ugly prototype proving the architecture.

If any core assumption fails, update technical plan before building V1.

---

## Phase 1 — Shared Core

Implement:

- filesystem abstraction;
- media type detection;
- directory enumeration;
- natural sorting;
- current-file state;
- mark state;
- keyboard command architecture;
- platform adapter boundary.

---

## Phase 2 — Viewer

Implement:

- image rendering;
- previous/next;
- mark/unmark;
- marked count;
- copy marked files;
- basic error handling.

Deliverable:

> Viewer independently usable by Owner.

---

## Phase 3 — Player Core

Implement:

- audio/video playback;
- play/pause;
- timeline;
- ±1 second;
- ±5 seconds;
- 0–9 percentage seek;
- previous/next file;
- mark/unmark.

Deliverable:

> Player independently usable for normal playback.

---

## Phase 4 — A/B Loop

Implement:

- A;
- B;
- timeline indicators;
- loop enable/disable;
- adaptive fade;
- invalid-state handling.

---

## Phase 5 — Audio Experience

Implement:

- metadata;
- album artwork;
- audio-specific presentation.

---

## Phase 6 — Platform Integration

Implement/polish:

- Windows file association;
- macOS file association;
- application icons;
- installer/bundle;
- open-with behavior;
- permission behavior.

---

## Phase 7 — Polish / QA

Test:

- Windows 11;
- current Owner macOS;
- common media fixtures;
- corrupted fixtures;
- large image/video;
- rapid navigation;
- keyboard conflicts;
- clipboard;
- repeated A/B looping;
- application reopen;
- OS association.

Do not add new product features during this phase.

---

# 31. Agent Execution Rules

Before writing production code:

1. Read this PRD completely.
2. Produce a technical implementation plan.
3. Inspect current official documentation for Tauri and selected dependencies.
4. Verify current compatibility rather than relying on remembered API behavior.
5. Perform Phase 0 technical spike.
6. Report any architecture blocker before changing the agreed stack or scope.

During implementation:

- keep modules separated;
- reuse mature libraries;
- do not reinvent codecs;
- do not add speculative features;
- do not silently expand scope;
- do not optimize for hypothetical users before Owner use;
- keep dependencies minimal;
- maintain Windows/macOS parity for defined behavior.

When a requirement conflicts with technical reality:

> preserve the user-facing behavior where practical,
> document the tradeoff,
> propose the smallest alternative,
> and do not redesign the product without approval.

---

# 32. Definition of Done — V1

V1 is DONE when the Owner can install the application on both target operating
systems and reliably perform:

IMAGE:
Open → Browse → Mark → Copy marked files

VIDEO:
Open → Play/Pause → Seek → A/B Loop → Navigate files

AUDIO:
Open → View metadata → Play/Pause → Seek → A/B Loop → Navigate files

using the agreed keyboard behavior with no major behavioral difference between
Windows and macOS.

Everything else is optional or future scope.