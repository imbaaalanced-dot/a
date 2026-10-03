# Denkmal TD v3.0.0-alpha.6

Portrait/mobile layout pass — 3 October 2026.

## Portrait gameplay
- Dedicated portrait HUD layout for narrow Android screens.
- Joystick remains bottom-left; combat actions move into a compact 2-column panel bottom-right.
- Contextual tower arsenal becomes a 2×2 block above the action panel.
- Health, monument, resources, wave state and menu are reflowed to keep the center battlefield readable.
- Boss bar and subtitles receive portrait-specific placement.
- Safe-area insets are respected with viewport-fit=cover.

## Camera
- Portrait mode uses a wider gameplay zoom than landscape.
- Marcel is framed at roughly 43% screen height instead of dead center so touch controls cover less useful world space.
- Rotation/resizing preserves play state.

## Menus
- Start screen stacks vertically with a shorter hero-art header.
- Inventory, perks, story and character screens switch to single-column layouts where needed.

## Regression coverage
- Portrait resize and camera zoom are tested.
- Portrait screen-to-world mapping is tested.
- Viewport safe-area and portrait CSS presence are verified.

## Tester focus
1. 360×800, 390×844 and 412×915 Android portrait sizes.
2. Joystick + dodge + Seelenruf multi-touch.
3. Building/upgrading without the arsenal covering Marcel.
4. Browser address-bar resize without pausing or camera jumps.
5. Rotate portrait ↔ landscape during an active run.
