# Crowd Clash — plan

## First glance
- **Box line:** Steer your running crowd through math gates, dodge the spikes, and crush the enemy crowd at the finish line.
- **First 5 seconds:** A neon stadium track scrolls toward you; your crowd of 10 runners bobs at the bottom with a big count badge. The first gate pair (+15 | +3) is already approaching — one drag and the crowd visibly grows with a green +15 pop and a rising blip.
- **Fantasy:** You are the coach of a living number — every gate is a bet you place with your whole crowd.

## Fun engine
- **Core verb:** steer (one axis: drag / mouse / ←→ / A/D).
- **Decision per gate (~3 s):** evaluate both operations against the *current* crowd size — +40 beats ×2 at 15 runners, loses at 100. The better gate changes as you grow, so the math stays live.
- **Escalation:** 10 hand-tuned levels; traps widen, bait pairs appear (×3 next to a "safe" +90 that is actually worse), bonus drums reward centre-line risks, enemy crowds grow 25 → 4500.
- **Skill test:** reading two operations and committing laterally in under a second; trap dodges punish greedy lines.
- **Failure sting:** watching a ×2 become a −30 because you drifted — the count badge makes every loss legible.

## Outcome model
- Win a level by surviving the final clash (crowd attrition battle, ~2 s). Lose when the crowd hits 0 (bad gates, traps) or loses the clash.
- Stars by clash margin (crowd at clash ÷ enemy): ≥1.8 → 3★, ≥1.3 → 2★, else 1★. Unlocks and stars persist in localStorage.
- Score: net runners gained + win bonus (100 + 2× surviving crowd).

## Signature twist & peak moment
- **Twist:** the crowd *is* the score, the health bar and the weapon — one number does everything.
- **Peak:** the final clash — both crowds collide with drum hits, shake and flying numbers until one side is gone.

## Determinism & verification invariants
1. `pilot()` wins all 10 levels (checked by client runSelfTests and by simulate's reference route on level 1).
2. Idle play loses level 1 before tick 2500 (centre line is a trap + weak gates; idleLossTicks backstop).
3. Always-left play dies mid-run on level 1 (the −30 gate).
4. Identical inputs → identical outcomes (seeded state RNG only; no Math.random/Date.now in logic.js).
5. viewFor is always JSON-serializable.

## Config levers (logic.js `config`)
`steerSpeed`, `runSpeed`, `idleLossTicks`, clash rates, and `levels[]` (start/enemy/rows with gap, gate ops, trap spans, bonus zones) — a difficulty pass is a data edit only.
