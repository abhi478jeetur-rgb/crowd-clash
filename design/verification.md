# Crowd Clash — verification

All gates run against the shipped files on 2026-11-26 (OpenGame MCP, headless Chrome 156).

## Deterministic simulation (server, seed 'game-simulation')
- reference route: **WIN** at tick 570 — crowd 89, score 359, winners [player-1]
- idle: **LOSS** at tick 583 (under the 2500-tick bound) — centre line hits the trap and weak gates, clash lost with crowd 0 vs enemy 7 remaining
- weak (always-left steps): **LOSS** at tick 472 — crowd 0 on the −30 gate, partway through the run (4 of 5 rows reached)

## Local harness (node, same logic.js)
- pilot wins all 10 levels: PASS (final crowds 89, 359, 868, 3000, 3840, 12960, 16560, 51840, 103680, 573480)
- determinism (two identical pilot runs): PASS
- referenceRoute replay: PASS (13 steps, win)
- viewFor JSON-serializable; isGameOver shape; 50-tick two-player validate smoke: PASS

## Browser playtest (headless Chrome, 1 client, 30 s scripted keys)
- console errors: **0**
- playerCount PASS · phase PASS (reached **win** on scripted keys) · scriptedMovement PASS (3.9 world units)
- mobileHorizontalOverflow PASS (390×844, no overflow)
- runSelfTests: pilotWinsAllLevels PASS · deterministic PASS · viewJson PASS · idleLoses PASS

## Validate
- passed: true, diagnostics: none (cover warning cleared after capture_cover)

## Cover
- assets/cover.png 1280×720, game-canvas only: crowd of 25 under a +5/+8 gate, HUD visible.

## Known gaps (P2)
- Visual density is v1-minimal: runners are small and the track is sparse between gates. Planned polish: larger runner glyphs, wider crowd spread, taller glowing gate panels, side-stand decorations, clash close-up framing.
- Human play-feel (steering weight, gate readability at full speed) is judged from playtest frames; simulation proves rules and balance only.
- Audio is synthesized WebAudio; headless playtest cannot prove how it sounds.

---

## 2026-11-27 ~00:15 IST — visual density improvement (run 2)
- Change: runner glyphs 1.45× bigger (drawFigure size multiplier), crowd spread radius 1.1 → 1.7 world units with figures clamped to the track (x 0.35–8.65), drawn figures cap 44 → 60, getStats entity count updated to match. logic.js untouched.
- Local harness: ALL PASS (pilot wins all 10 levels, idle loss tick 583, always-left loss tick 472, deterministic, referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 4 self-tests PASS, phase reached win.
- Cover recaptured: new frame shows the bigger, wider-spread crowd (10 runners, count badge visible) — headless cover capture runs slower than real time, so the frame is early-run; the playtest late-run frame confirms the denser crowd mid-game.
- Notes: first reference-simulate call failed transiently ("Tool failed") right after the Studio restart; retry passed. First cover attempt failed on the Space key ("Invalid scripted key") — mouse click on #start works instead.
- Visual density (glyphs + spread) now done; remaining polish: taller glowing gate panels / side-stand decorations, clash framing, difficulty tuning, sound layering, levels 11–12.
