# Denkmal TD v3.1.0-alpha.2

Mobile combat polish release based on v3.1.0-alpha.1.

## Mobile controls
- Touch joystick now has a 14% deadzone to prevent drift.
- Analog response ramps smoothly instead of jumping from zero to full movement.
- Joystick knob travel is clamped and gets a visible active state while held.

## Camera
- Wide camera is pulled farther back in portrait and landscape.
- Camera adds a small movement-direction lead so more of the path ahead stays visible.
- Existing camera mode toggle remains available.

## HUD and feedback
- Touch action controls stay compact during normal combat and expand only when contextual tower/build actions appear.
- A short wave banner appears when the first enemy of each wave spawns.
- Existing tactical targeting, wave preview and tester telemetry remain unchanged.

## Validation
- Gameplay regression coverage includes joystick deadzone/response, widened zoom, camera lead and wave banner.
- Combat FX regression suite remains part of CI.
- Real Android Chrome/WebView long-run testing remains required.
