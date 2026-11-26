# Crowd Clash — verification

All gates run against the shipped files on 2026-11-26 (OpenGame MCP, headless Chrome 156).

## Deterministic simulation (server, seed 'game-simulation')
- reference route: **WIN** at tick 570 — crowd 89, score 359, winners [player-1]
- idle: **LOSS** at tick 583 (under the 2500-tick bound) — centre line hits the trap and weak gates, clash lost with crowd 0 vs enemy 7 remaining
- weak (always-left steps): **LOSS** at tick 472 — crowd 0 on the −30 gate, partway through the run (4 of 5 rows reached)

## Local harness (node, same logic.js)
- pilot wins all 10 levels: PASS (final crowds 89, 359, 868, 3000, 3840, 12960, 16560, 51840, 21759, 121648)
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
- Visual density, gate/track richness and clash presentation are now polished (runs 2–4). Remaining planned polish: difficulty tuning from simulate margins, richer SFX layering, levels 11–12.
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

## 2026-11-27 ~01:30 IST — gate/track richness improvement (run 3)
- Change (client.js only, logic.js untouched): gate panels taller (z span -0.9/+0.2 → -1.15/+0.45) with colored glow (shadowBlur 14), darker body + bottom band, 3px border + inner highlight, solid top accent strip with chevron, and a dark pill behind the math label so text stays readable. Track: two scrolling dashed lane dividers at W/4 and 3W/4. New deterministic side-stand decorations: stepped 3-tier grandstands with colored spectator dots and pennant flags scrolling along both track edges (8 slots, 6-unit repeat, no randomness). River DeepSeek generated the draw functions; one flag-color fix applied during splice.
- Local harness: ALL PASS (pilot wins all 10 levels, idle loss tick 583, always-left loss tick 472, deterministic, referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 4 self-tests PASS, phase reached win. Contact sheet verified visually: taller glowing gates with readable pill labels (+15/+3, -30/×2), side stands with flags/dots on both edges, lane dividers visible, no broken frames.
- Cover recaptured: early-run frame shows the crowd of 10, the new side stands (flags + spectator dots) and lane dividers; headless capture runs slower than real time so no gate is in frame yet. Note: this run's cover click on #start reported "Node is either not clickable or not an Element" but the game still started (phase playing, crowd 10) and the screenshot saved fine.
- Remaining polish: clash framing, difficulty tuning, sound layering, levels 11–12.


## 2026-11-27 ~01:50 IST — clash presentation: bigger enemy crowd, impact shake/numbers, hit-stop (run 4)
- Change (client.js only, logic.js untouched): enemy crowd redrawn bigger — up to 60 figures (was 30) at 1.35× size in two ranks (front/back arcs), red glow ellipse + dashed arena ring, larger count badge. On clashStart a glowing "⚔ CLASH!" banner shows for 1.4 s with a low horn and a shake jolt. On every clashHit: screen shake (magnitude 9, decaying), ~110 ms hit-stop freeze of the game loop, floating "-N" damage numbers over the enemy and over the player's crowd, red/gold particle bursts. Pulsing red vignette frames the screen while the clash runs. Draw functions generated via River DeepSeek (gen.py) and spliced into gen-client.js; no logic/balance changes.
- Local harness: ALL PASS (pilot wins all 10 levels, idle loss tick 583, always-left loss tick 472, deterministic, referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 4 self-tests PASS, phase reached win (tick 572, crowd 46). Playtest authoritative state confirms clashStart + clashHit events fired (clashTicks 5, enemyLeft 0).
- Cover recaptured: early-run frame (crowd of 10, side stands + lane dividers visible). Note: cover #start click again reported "Node is either not clickable or not an Element" but the game still started and the screenshot saved (same flaky timing as run 3, not a code issue).

---

## 2026-11-27 ~02:15 IST — difficulty tuning: Level 10 'Grand Clash' margin smoothed (run 5)
- Change (logic.js config only, client.js untouched): L10 enemy 4,500 → 45,000 and four ×3 gates softened to ×2 (rows 2, 4, 6, 8). Pilot win margin 127.44× → **2.70×** (pilot crowd 121,648 vs enemy 45,000, win tick 893). All other levels unchanged (L1 3.56×, L2 5.98×, L3–L9 still >6× — next tuning runs take the next most extreme level).
- Local harness: ALL PASS (pilot wins all 10 levels; idle loss tick 583; always-left loss tick 472; deterministic; referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all assertions PASS (playerCount, phase win, scriptedMovement 3.9, mobileHorizontalOverflow, 4 self-tests), phase reached win (tick 579, crowd 15).
- Contact sheet visually verified: gates readable (+15/+3, −30/×2), crowd visible, no broken/empty frames.
- Notes: no visual change, so cover was not recaptured. Studio was down at run start (curl 000) and was restarted with the standard command before the gates.

---

## 2026-11-27 ~02:45 IST — difficulty tuning: Level 9 'Gauntlet' margin smoothed (run 6)
- Change (logic.js config only, client.js untouched): L9 enemy 2,600 → 8,000 and four ×3 gates softened to ×2 (rows 3, 8, 10, 12). Pilot win margin 39.88× → **2.72×** (pilot crowd 21,759 vs enemy 8,000, win tick 917). All other levels unchanged (L1 3.56×, L2 5.98×, L3 7.23×, L4 13.64×, L5 10.11×, L6 19.94×, L7 16.56×, L8 32.40×, L10 2.70× — next tuning runs take the next most extreme level, L8 32.40×).
- Local harness: ALL PASS (pilot wins all 10 levels; idle loss tick 583; always-left loss tick 472; deterministic; referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 8 assertions PASS (playerCount, phase win, scriptedMovement 3.9, mobileHorizontalOverflow, 4 self-tests), phase reached win (tick 572, crowd 46).
- Contact sheet visually verified: gates readable (+15/+3, −30/×2), crowd visible, no broken/empty frames.
- Notes: no visual change, so cover was not recaptured. Studio was down at run start (curl 000) and was restarted with the standard command before the gates.

---

## 2026-11-27 ~03:15 IST — difficulty tuning: Level 8 'High Stakes' margin smoothed (run 7)
- Change (logic.js config only, client.js untouched): L8 enemy 1,600 → 6,100 and three ×3 gates softened to ×2 (rows 2, 4, 9). Pilot win margin 32.40× → **2.70×** (pilot crowd 16,480 vs enemy 6,100, win tick 871; final crowd 15,969). All other levels unchanged (L1 3.64×, L2 6.00×, L3 7.25×, L4 13.64×, L5 10.11×, L6 19.94×, L7 16.56×, L9 2.80×, L10 2.78× — next tuning runs take the next most extreme level, L6 19.94×).
- Local harness: ALL PASS (pilot wins all 10 levels; idle loss tick 583; always-left loss tick 472; deterministic; referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 4 self-tests PASS, phase reached win (tick 572, crowd 46).
- Contact sheet visually verified: gates readable (+15/+3, −30/×2), crowd visible, no broken/empty frames.
- Notes: no visual change, so cover was not recaptured. Studio was down at run start (curl 000) and was restarted with the standard command before the gates.

---

## 2026-11-27 ~03:45 IST — difficulty tuning: Level 6 'Big League' margin smoothed (run 8)
- Change (logic.js config only, client.js untouched): L6 enemy 650 → 2,150 and two ×3 gates softened to ×2 (rows 4, 9). Pilot win margin 19.94× → **2.67×** (pilot crowd 5,744 vs enemy 2,150, win tick 851). All other levels unchanged (L1 3.56×, L2 5.98×, L3 7.23×, L4 13.64×, L5 10.11×, L7 16.56×, L8 2.62×, L9 2.72×, L10 2.70× — next tuning runs take the next most extreme level, L7 16.56×).
- Local harness: ALL PASS (pilot wins all 10 levels; idle loss tick 583; always-left loss tick 472; deterministic; referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 4 self-tests PASS, phase reached win (tick 579, crowd 15).
- Contact sheet visually verified: gates readable (+15/+3, −30/×2), crowd visible, no broken/empty frames.
- Notes: no visual change, so cover was not recaptured. Studio was down at run start (curl 000) and was restarted with the standard command before the gates. First validate/simulate attempt failed on a `~` path-expansion bug in the shell helper (MCP client never ran); retried with the absolute path and all gates passed.

---

## 2026-11-27 ~04:15 IST — difficulty tuning: Level 7 'Trap City' margin smoothed (run 9)
- Change (logic.js config only, client.js untouched): L7 enemy 1,000 → 2,700 and two ×3 gates softened to ×2 (rows 5, 9). Pilot win margin 16.56× → **2.80×** (pilot crowd 7,551 vs enemy 2,700, win tick 893). All other levels unchanged (L1 3.64×, L2 6.00×, L3 7.25×, L4 13.64×, L5 10.11×, L6 2.75×, L8 2.70×, L9 2.80×, L10 2.78× — next tuning runs take the next most extreme level, L4 13.64×).
- Local harness: ALL PASS (pilot wins all 10 levels; idle loss tick 583; always-left loss tick 472; deterministic; referenceRoute win).
- Server gates: validate PASS (no diagnostics) · simulate reference WIN tick 570 [player-1] · idle LOSS tick 583 · always-left LOSS tick 472 · playtest 0 console errors, 0 failed requests, all 4 self-tests PASS, phase reached win (tick 572, crowd 46).
- Contact sheet visually verified: gates readable (+15/+3, −30/×2), crowd visible, no broken/empty frames.
- Notes: no visual change, so cover was not recaptured. Studio was down at run start (curl 000) and was restarted with the standard command before the gates.
