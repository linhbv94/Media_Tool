# VXMedia — Folder Tabs & Multi-Window Architecture Update

## Context

VXMedia is a combined Viewer + Player desktop application.

A product/architecture issue has been identified:

- Opening an image must NOT interrupt currently playing audio.
- Different folders should be treated as separate working contexts.
- Users may want to compare media from different folders.
- Multiple folder contexts therefore need to coexist.
- A folder context should eventually be movable between windows.

We will introduce:

**App → Windows → Tabs → Folder Sessions**

while playback remains an **app-level shared playback session**.

---

# 1. Core Mental Model

Use the following model:

> Folder = workspace  
> File = item currently viewed/played inside that workspace  
> Tab = UI representation of a Folder Session  
> Window = container for one or more tabs  
> Playback Session = app-level shared playback resource

Do NOT model each file as a tab.

Conceptually:

    VXMedia
    │
    ├── Global Playback Session
    │
    ├── Window A
    │   ├── Tab → Folder Session: /Photos/Camera A
    │   └── Tab → Folder Session: /Music/OST
    │
    └── Window B
        └── Tab → Folder Session: /Photos/Camera B

---

# 2. Folder Session

Each opened folder context should have its own persistent runtime state.

Conceptually:

    FolderSession {
        id
        folderPath
        mediaList
        currentFile
        currentIndex
        markedFiles
        mode // viewer | player
        viewState
        playerStateIfNeeded
    }

Exact implementation should follow the existing codebase architecture rather than blindly copying this interface.

A Folder Session should preserve relevant context such as:

- current file
- current index
- media list
- marked files
- Viewer state where applicable
- other existing folder-specific state

Do not unnecessarily reset a Folder Session when switching tabs or windows.

---

# 3. Folder → Tab Rules

## Same folder

If Folder A is already open and the user opens another media file from Folder A:

    Folder A / image-01.jpg
    ↓
    Tab A exists

    later:

    Folder A / image-50.jpg

Then:

- reuse the existing Folder A session
- focus its existing tab/window
- navigate that session to `image-50.jpg`
- DO NOT create a duplicate Folder A tab

Default rule:

> One Folder Session per folder path.

Use appropriate canonical/normalized path comparison for the target OS.

## Different folder

If Folder A is open and the user opens a media file from Folder B:

    [ Folder A ]
          +
    open file from Folder B
          ↓
    [ Folder A ] [ Folder B ]

Create a new Folder Session and a new tab.

Do NOT replace Folder A.

---

# 4. Playback Ownership

Playback must NOT belong to the currently visible tab or window.

There should be an app-level playback concept.

Primary problem to solve:

    Open song
    → song is playing

    Open image
    → Viewer becomes active
    → song MUST continue playing

Opening or viewing an image must not kill, pause, or reset active audio playback.

## Audio/video contention

Only one active audible playback session is required for now.

Expected behavior:

### Audio playing → open image

Audio continues.

### Audio playing → open another audio and play it

Previous playback yields to the new media.

### Audio playing → open video and play it

Previous audio yields to video playback.

Do NOT allow unrelated audio and video to accidentally play simultaneously.

Exact pause/stop semantics should preserve current VXMedia behavior where possible and should be documented in the implementation plan.

---

# 5. Multi-Window — IMPLEMENT NOW

Implement Phase 1 now.

A tab / Folder Session must be movable into a separate window through an explicit UI command.

Examples of acceptable UI:

- context menu on tab → `Open in New Window`
- tab action/menu → `Move to New Window`

Choose the least intrusive implementation consistent with the current VXMedia UI.

Required flow:

    BEFORE

    Window A
    ┌───────────────────────────────┐
    │ [ Folder A ] [ Folder B ]     │
    └───────────────────────────────┘


    Move Folder B to New Window
                  ↓


    Window A                     Window B
    ┌──────────────────┐        ┌──────────────────┐
    │ [ Folder A ]     │        │ [ Folder B ]     │
    └──────────────────┘        └──────────────────┘

This must MOVE the existing Folder Session.

Do NOT destroy the session and recreate it from scratch.

Folder B should preserve its state:

- current file
- current index
- marked files
- relevant Viewer state
- relevant Player state
- any other existing folder-specific runtime state

---

# 6. Window State

Refactor state ownership as necessary so the conceptual hierarchy becomes:

    AppState
    │
    ├── windows[]
    │    │
    │    └── WindowState
    │         ├── windowId
    │         ├── tabs[]
    │         └── activeTabId
    │
    ├── folderSessions
    │
    └── globalPlaybackSession

This is conceptual, not a mandatory exact schema.

Adapt it to the existing implementation.

Important architectural rule:

> FolderSession must NOT be permanently owned by one Window.

A Window displays/contains Folder Sessions.

A Folder Session should therefore be movable between windows without losing its identity or state.

---

# 7. Window Closing Behavior

Handle window lifecycle explicitly.

If a secondary window is closed:

- cleanly remove/update its WindowState
- do not leave orphaned UI state
- do not crash other windows
- preserve global application consistency

If the closed window contains a Folder Session associated with currently active playback, do NOT accidentally kill playback merely because its UI window closed.

Playback belongs to the app level.

Quitting the entire VXMedia application should stop playback normally.

Document any platform-specific lifecycle differences between macOS and Windows.

---

# 8. Comparison Use Case

The reason for multi-window support is primarily media comparison.

Example:

    Window A                 Window B

    Photoshoot A             Photoshoot B
    IMG_1032.jpg             IMG_8841.jpg

The user can use native OS window management:

- macOS window placement
- Windows Snap
- multiple monitors

to arrange the two VXMedia windows.

DO NOT implement an internal split-view/comparison mode at this stage.

The OS already provides window arrangement.

---

# 9. Detachable & Cross-Window Tabs — BACKLOG ONLY

The following capability is explicitly BACKLOG.

**DO NOT implement it now.**

Phase 2 and Phase 3 are combined into one future capability:

## Detachable & Cross-Window Tabs

**Status:** Backlog  
**Priority:** After multi-window stabilization

### Goal

Allow Folder Session tabs to move freely between VXMedia windows using direct drag-and-drop interaction.

### Future behavior A — Drag tab out to create a new window

    Window A

    [ Folder A ] [ Folder B ]
                     │
                     │ drag outside window
                     ▼

    Window A                 Window B

    [ Folder A ]             [ Folder B ]

Dragging a tab outside its current window should create a new VXMedia window and MOVE the existing Folder Session into it.

Do NOT recreate the session.

### Future behavior B — Drag between existing windows

    Window A                 Window B

    [ Folder A ]             [ Folder B ]
                                  │
                         drag Folder B
                                  │
                                  ▼

    Window A

    [ Folder A ] [ Folder B ]

Eventually tabs should support:

1. Drag tab outside current window → create new window containing that Folder Session.
2. Drag tab from Window A → existing Window B.
3. Drag tab from secondary Window B → Window A.
4. Preserve complete Folder Session state during movement.
5. Preserve app-level playback state.
6. Provide appropriate visual drag/drop feedback.

### Backlog Non-Goals

Do NOT include:

- internal split view
- arbitrary pane layouts
- browser-style tab groups
- saved workspaces
- complex window session restoration

unless separately approved later.

---

# 10. Architecture Requirement for Future Detachable Tabs

Although drag-based detachment is NOT implemented now, Phase 1 architecture must NOT make it unnecessarily difficult later.

Therefore:

- Folder Sessions must have stable identity.
- Folder Sessions must not be tightly coupled to a single Window.
- Moving a Folder Session between WindowStates should be conceptually supported.
- Playback ownership must remain independent of Window ownership.
- Avoid assumptions such as "the application has exactly one window".
- Avoid global DOM/UI state that only works with one webview/window.
- Window creation/destruction should not imply Folder Session creation/destruction unless explicitly intended.

Do NOT overengineer a complete drag/drop infrastructure now.

Simply ensure Phase 1 does not create obvious architectural blockers for the backlog capability.

---

# 11. Implementation Order

## Step 1 — Inspect

Inspect the current VXMedia architecture and identify:

- current media state ownership
- folder state ownership
- Player state ownership
- Viewer state ownership
- assumptions about a single window
- Tauri window/webview communication
- existing open-file handling
- current media engine ownership/lifecycle

Do NOT immediately start refactoring.

## Step 2 — Plan

Produce a concise implementation plan describing:

- required state-model changes
- Window / Folder Session ownership
- cross-window state synchronization
- playback ownership
- window lifecycle
- risks
- files/modules expected to change

Prefer adapting existing architecture over unnecessary rewrites.

## Step 3 — Implement Phase 1

Implement now:

- Folder Sessions
- folder-based tabs
- same-folder reuse
- different-folder new tab
- app-level playback behavior
- audio continuing while images are viewed
- explicit `Open/Move to New Window`
- multi-window state/lifecycle
- required macOS behavior
- architecture compatible with later Windows support

## Step 4 — Test

At minimum test:

1. Open image from Folder A.
2. Open another image from Folder A → same tab.
3. Open image from Folder B → new tab.
4. Switch Folder A/B repeatedly → state preserved.
5. Mark files independently in Folder A and Folder B.
6. Play audio → open image → audio continues.
7. Play audio → switch between image tabs → audio continues.
8. Play audio → play another audio/video → no unintended simultaneous playback.
9. Move Folder B into a new window → state preserved.
10. Navigate Folder B independently in Window B.
11. Continue navigating Folder A independently in Window A.
12. Close Window B → Window A remains healthy.
13. Exercise active playback while another window opens/closes.
14. Verify A/B loop and existing Player state are not unintentionally broken.
15. Verify Viewer navigation/mark/copy behavior is not unintentionally broken.
16. Relaunch and smoke-test existing Viewer + Player functionality for regressions.

## Step 5 — Documentation

Update architecture/project documentation.

Add:

`Detachable & Cross-Window Tabs`

to the backlog.

Clearly mark it as NOT IMPLEMENTED.

---

# 12. Scope Guard

This task DOES authorize implementation of:

- folder-based tabs
- multiple Folder Sessions
- app-level playback ownership
- explicit command to move/open a tab in a new window
- multiple VXMedia windows
- required state/lifecycle refactoring

This task DOES NOT authorize implementation of:

- drag-to-detach tabs
- cross-window drag/drop
- internal split view
- multiple simultaneous playback streams
- saved workspace layouts
- session restoration after application restart
- tab groups
- major visual redesign
- unrelated Player/Viewer features

Implement Phase 1 cleanly.

Document Phase 2 + Phase 3 as the single combined backlog capability:

**Detachable & Cross-Window Tabs**

Do not implement that backlog capability yet.