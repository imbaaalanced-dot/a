# Denkmal TD v3.1.0-alpha.3

Combat-variety release based on v3.1.0-alpha.2.

## Wave profiles
- Wave 2: HETZJAGD boosts runner speed.
- Wave 3: BRECHERSTURM increases brute durability.
- Wave 4: PFEILREGEN accelerates archer attack cadence.
- Wave 6: SCHILDWALL strengthens guardian armor.
- Wave 7: SABOTAGE boosts sapper speed and damage.
- Wave 8: RISSSTURM applies a light global speed/damage escalation.
- Build-pause preview and wave banner display the current wave profile.

## Enemy pressure behavior
- Runners enrage below 45% HP and gain speed/damage.
- Guardians break their shield below 50% HP, losing armor but moving faster.
- Archers back away when Marcel gets too close.
- Sappers detonate once at the monument instead of repeatedly melee-attacking it.

## Boss
- DER BELAGERER now has three phases.
- Phase II triggers below 66% HP.
- Phase III triggers below 33% HP.
- Later phases increase speed, damage, attack cadence and armor.
- Boss HUD and world rendering visually surface the escalation.

## Feedback
- Enemies receive a brief visual hit kick on impact.
- Enraged runners, broken guardians and later boss phases receive distinct rendering states.

## Validation
- Regression coverage includes wave modifiers, runner/guardian thresholds, boss phases, sapper detonation and archer retreat.
- Gameplay and Combat FX suites pass on the release branch.
