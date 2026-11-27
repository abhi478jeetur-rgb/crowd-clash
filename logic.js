const meta = { minPlayers: 1, maxPlayers: 1, tickRate: 30, serverTick: true };

const config = {
  W: 9,
  H: 16,
  crowdZ: 14.4,
  runSpeed: 0.16,
  steerSpeed: 0.30,
  idleLossTicks: 1500,
  levels: [
    {
      name: 'First Steps',
      start: 10,
      enemy: 25,
      rows: [
        { gap: 90, kind: 'gate', left: { k: '+', v: 15 }, right: { k: '+', v: 3 } },
        { gap: 95, kind: 'gate', left: { k: '+', v: 5 }, right: { k: '+', v: 8 } },
        { gap: 95, kind: 'trap', x0: 3.4, x1: 5.6, loss: 8 },
        { gap: 95, kind: 'gate', left: { k: '-', v: 30 }, right: { k: 'x', v: 2 } },
        { gap: 95, kind: 'gate', left: { k: '+', v: 25 }, right: { k: '-', v: 10 } }
      ]
    },
    {
      name: 'Warm Up',
      start: 12,
      enemy: 133,
      rows: [
        { gap: 85, kind: 'gate', left: { k: '+', v: 10 }, right: { k: '+', v: 18 } },
        { gap: 90, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 15 } },
        { gap: 90, kind: 'trap', x0: 2.8, x1: 5.0, loss: 10 },
        { gap: 90, kind: 'gate', left: { k: '+', v: 30 }, right: { k: '-', v: 10 } },
        { gap: 90, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 40 } },
        { gap: 90, kind: 'trap', x0: 4.6, x1: 6.8, loss: 12 },
        { gap: 90, kind: 'gate', left: { k: '-', v: 20 }, right: { k: 'x', v: 2 } }
      ]
    },
    {
      name: 'Drum Run',
      start: 15,
      enemy: 215,
      rows: [
        { gap: 85, kind: 'gate', left: { k: '+', v: 20 }, right: { k: 'x', v: 2 } },
        { gap: 85, kind: 'bonus', x0: 3.2, x1: 5.8, gain: 25 },
        { gap: 85, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 35 } },
        { gap: 85, kind: 'trap', x0: 1.2, x1: 3.6, loss: 15 },
        { gap: 85, kind: 'gate', left: { k: '-', v: 40 }, right: { k: 'x', v: 2 } },
        { gap: 85, kind: 'gate', left: { k: '+', v: 50 }, right: { k: '/', v: 2 } },
        { gap: 85, kind: 'trap', x0: 5.2, x1: 7.6, loss: 15 },
        { gap: 85, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 60 } }
      ]
    },
    {
      name: 'Crossroads',
      start: 20,
      enemy: 740,
      rows: [
        { gap: 80, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 45 } },
        { gap: 80, kind: 'gate', left: { k: '+', v: 60 }, right: { k: 'x', v: 2 } },
        { gap: 80, kind: 'trap', x0: 3.6, x1: 6.0, loss: 20 },
        { gap: 80, kind: 'gate', left: { k: '/', v: 2 }, right: { k: '+', v: 80 } },
        { gap: 80, kind: 'bonus', x0: 0.8, x1: 3.2, gain: 40 },
        { gap: 80, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '-', v: 50 } },
        { gap: 80, kind: 'gate', left: { k: '+', v: 90 }, right: { k: 'x', v: 2 } },
        { gap: 80, kind: 'trap', x0: 2.0, x1: 4.4, loss: 25 },
        { gap: 80, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 120 } }
      ]
    },
    {
      name: 'Spike Alley',
      start: 25,
      enemy: 900,
      rows: [
        { gap: 78, kind: 'gate', left: { k: '+', v: 40 }, right: { k: 'x', v: 2 } },
        { gap: 78, kind: 'trap', x0: 4.2, x1: 6.6, loss: 25 },
        { gap: 78, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 70 } },
        { gap: 78, kind: 'trap', x0: 1.6, x1: 4.0, loss: 25 },
        { gap: 78, kind: 'gate', left: { k: '-', v: 60 }, right: { k: 'x', v: 2 } },
        { gap: 78, kind: 'bonus', x0: 5.6, x1: 8.0, gain: 50 },
        { gap: 78, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 100 } },
        { gap: 78, kind: 'trap', x0: 3.2, x1: 5.6, loss: 30 },
        { gap: 78, kind: 'gate', left: { k: '+', v: 150 }, right: { k: 'x', v: 2 } },
        { gap: 78, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '/', v: 2 } }
      ]
    },
    {
      name: 'Big League',
      start: 30,
      enemy: 2150,
      rows: [
        { gap: 75, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 55 } },
        { gap: 75, kind: 'gate', left: { k: '+', v: 80 }, right: { k: 'x', v: 2 } },
        { gap: 75, kind: 'trap', x0: 2.4, x1: 5.2, loss: 35 },
        { gap: 75, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 90 } },
        { gap: 75, kind: 'gate', left: { k: '-', v: 100 }, right: { k: 'x', v: 2 } },
        { gap: 75, kind: 'bonus', x0: 1.0, x1: 3.4, gain: 60 },
        { gap: 75, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 160 } },
        { gap: 75, kind: 'trap', x0: 4.8, x1: 7.4, loss: 35 },
        { gap: 75, kind: 'gate', left: { k: '+', v: 200 }, right: { k: 'x', v: 2 } },
        { gap: 75, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '-', v: 150 } }
      ]
    },
    {
      name: 'Trap City',
      start: 35,
      enemy: 2700,
      rows: [
        { gap: 72, kind: 'gate', left: { k: '+', v: 60 }, right: { k: 'x', v: 2 } },
        { gap: 72, kind: 'trap', x0: 3.0, x1: 5.4, loss: 40 },
        { gap: 72, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 110 } },
        { gap: 72, kind: 'trap', x0: 5.4, x1: 7.8, loss: 40 },
        { gap: 72, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '-', v: 80 } },
        { gap: 72, kind: 'bonus', x0: 3.4, x1: 5.8, gain: 75 },
        { gap: 72, kind: 'gate', left: { k: '/', v: 2 }, right: { k: 'x', v: 2 } },
        { gap: 72, kind: 'trap', x0: 1.2, x1: 3.8, loss: 45 },
        { gap: 72, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 220 } },
        { gap: 72, kind: 'gate', left: { k: '+', v: 260 }, right: { k: 'x', v: 2 } },
        { gap: 72, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '/', v: 3 } }
      ]
    },
    {
      name: 'High Stakes',
      start: 40,
      enemy: 6100,
      rows: [
        { gap: 70, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 75 } },
        { gap: 70, kind: 'gate', left: { k: '+', v: 120 }, right: { k: 'x', v: 2 } },
        { gap: 70, kind: 'trap', x0: 2.0, x1: 4.8, loss: 55 },
        { gap: 70, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 140 } },
        { gap: 70, kind: 'gate', left: { k: '-', v: 200 }, right: { k: 'x', v: 2 } },
        { gap: 70, kind: 'bonus', x0: 5.0, x1: 7.6, gain: 90 },
        { gap: 70, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 300 } },
        { gap: 70, kind: 'trap', x0: 3.8, x1: 6.4, loss: 55 },
        { gap: 70, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '/', v: 2 } },
        { gap: 70, kind: 'gate', left: { k: '+', v: 400 }, right: { k: 'x', v: 2 } },
        { gap: 70, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '-', v: 250 } }
      ]
    },
    {
      name: 'Gauntlet',
      start: 50,
      enemy: 8000,
      rows: [
        { gap: 68, kind: 'gate', left: { k: '+', v: 90 }, right: { k: 'x', v: 2 } },
        { gap: 68, kind: 'trap', x0: 4.4, x1: 7.0, loss: 70 },
        { gap: 68, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 150 } },
        { gap: 68, kind: 'gate', left: { k: '+', v: 200 }, right: { k: 'x', v: 2 } },
        { gap: 68, kind: 'trap', x0: 1.0, x1: 3.6, loss: 70 },
        { gap: 68, kind: 'bonus', x0: 3.0, x1: 5.6, gain: 120 },
        { gap: 68, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '-', v: 300 } },
        { gap: 68, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 450 } },
        { gap: 68, kind: 'trap', x0: 2.8, x1: 5.4, loss: 80 },
        { gap: 68, kind: 'gate', left: { k: '+', v: 600 }, right: { k: 'x', v: 2 } },
        { gap: 68, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '/', v: 2 } },
        { gap: 68, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 500 } }
      ]
    },
    {
      name: 'Grand Clash',
      start: 60,
      enemy: 45000,
      rows: [
        { gap: 66, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 120 } },
        { gap: 66, kind: 'gate', left: { k: '+', v: 180 }, right: { k: 'x', v: 2 } },
        { gap: 66, kind: 'trap', x0: 3.2, x1: 6.0, loss: 90 },
        { gap: 66, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 240 } },
        { gap: 66, kind: 'bonus', x0: 0.8, x1: 3.2, gain: 150 },
        { gap: 66, kind: 'gate', left: { k: '-', v: 400 }, right: { k: 'x', v: 2 } },
        { gap: 66, kind: 'trap', x0: 5.2, x1: 7.8, loss: 90 },
        { gap: 66, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 700 } },
        { gap: 66, kind: 'gate', left: { k: '+', v: 900 }, right: { k: 'x', v: 2 } },
        { gap: 66, kind: 'gate', left: { k: '/', v: 3 }, right: { k: 'x', v: 3 } },
        { gap: 66, kind: 'gate', left: { k: 'x', v: 2 }, right: { k: '+', v: 1200 } },
        { gap: 66, kind: 'gate', left: { k: 'x', v: 3 }, right: { k: '-', v: 600 } }
      ]
    }
  ]
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function applyOp(crowd, op) {
  switch (op.k) {
    case '+': return crowd + op.v;
    case '-': return Math.max(0, crowd - op.v);
    case 'x': return Math.floor(crowd * op.v);
    case '/': return Math.floor(crowd / op.v);
    default: return crowd;
  }
}

function setup(ctx, players) {
  const firstPlayer = players && players[0];
  const levelIndex = clamp((firstPlayer && typeof firstPlayer === 'object' && firstPlayer.level) || 0, 0, config.levels.length - 1);
  const level = config.levels[levelIndex];
  const rawId = typeof firstPlayer === 'string' ? firstPlayer : (firstPlayer && firstPlayer.id !== undefined && firstPlayer.id !== null ? firstPlayer.id : 'player-1');
  const selfId = String(rawId);
  const state = {
    seed: (ctx && ctx.random ? Math.floor(ctx.random() * 0xffffffff) : 12345) >>> 0,
    tick: ctx ? ctx.tick : 0,
    selfId,
    level: levelIndex,
    levelName: level.name,
    phase: 'playing',
    result: null,
    crowd: level.start,
    rowIndex: 0,
    nextRowTick: (ctx ? ctx.tick : 0) + level.rows[0].gap,
    activeRows: [],
    clash: null,
    clashTicks: 0,
    combo: 0,
    score: 0,
    lastInputTick: ctx ? ctx.tick : 0,
    dist: 0,
    totalDist: level.rows.reduce((s, r) => s + r.gap, 0),
    events: [],
    serial: 0,
    players: {}
  };
  state.players[selfId] = {
    id: selfId,
    x: config.W / 2,
    z: config.crowdZ,
    connected: true,
    input: { dx: 0 }
  };
  return state;
}

function emit(state, kind, data) {
  const ev = Object.assign({ id: state.serial++, kind, tick: state.tick }, data || {});
  state.events.push(ev);
  return ev;
}

function validateAction(state, playerId, action, ctx) {
  if (!action || typeof action !== 'object') return false;
  if (action.type === 'tick') return true;
  if (action.type === 'restart') return !!state.result;
  if (action.type === 'input') {
    if (state.result) return false;
    if (playerId !== state.selfId) return false;
    return typeof action.dx === 'number' && action.dx >= -1 && action.dx <= 1;
  }
  return false;
}

function applyAction(state, playerId, action, ctx) {
  if (!action) return state;
  if (action.type === 'restart') {
    if (!state.result) return state;
    const lvl = typeof action.level === 'number' ? action.level : state.level;
    const players = [{ id: state.selfId, level: lvl }];
    const fresh = setup(ctx, players);
    fresh.seed = state.seed;
    return fresh;
  }
  if (action.type === 'input') {
    if (state.result) return state;
    if (playerId !== state.selfId) return state;
    const p = state.players[state.selfId];
    if (!p) return state;
    const dx = clamp(action.dx || 0, -1, 1);
    p.input = { dx };
    if (dx !== 0) state.lastInputTick = ctx.tick;
    return state;
  }
  if (action.type === 'tick') {
    return tick(state, ctx);
  }
  return state;
}

function tick(state, ctx) {
  state.tick = ctx.tick;
  if (state.result) return state;

  const level = config.levels[state.level];
  const p = state.players[state.selfId];

  if (state.clash) {
    const c = state.clash;
    c.enemyLeft -= Math.max(1, Math.round(state.crowd * 0.10));
    if (c.enemyLeft > 0) {
      state.crowd -= Math.max(1, Math.round(c.enemyLeft * 0.06));
    }
    state.clashTicks++;
    if (state.clashTicks % 5 === 0) {
      emit(state, 'clashHit', { enemyLeft: Math.max(0, c.enemyLeft), crowd: Math.max(0, state.crowd) });
    }
    if (c.enemyLeft <= 0) {
      state.score += 100 + state.crowd * 2;
      state.result = 'win';
      state.phase = 'win';
      emit(state, 'win', { crowd: state.crowd, score: state.score });
      return state;
    }
    if (state.crowd <= 0) {
      state.result = 'loss';
      state.phase = 'loss';
      emit(state, 'loss', { reason: 'clash' });
      return state;
    }
    if (state.clashTicks > 120) {
      if (state.crowd > c.enemyLeft) {
        state.score += 100 + state.crowd * 2;
        state.result = 'win';
        state.phase = 'win';
        emit(state, 'win', { crowd: state.crowd, score: state.score });
      } else {
        state.result = 'loss';
        state.phase = 'loss';
        emit(state, 'loss', { reason: 'clash' });
      }
      return state;
    }
    return state;
  }

  if (p) {
    const dx = p.input ? p.input.dx : 0;
    p.x = clamp(p.x + dx * config.steerSpeed, 0.6, config.W - 0.6);
    p.z = config.crowdZ;
  }

  state.dist += config.runSpeed;

  while (state.rowIndex < level.rows.length && ctx.tick >= state.nextRowTick) {
    const row = level.rows[state.rowIndex];
    state.activeRows.push(Object.assign({}, row, { z: -1.2, resolved: false, rowIdx: state.rowIndex }));
    state.rowIndex++;
    if (state.rowIndex < level.rows.length) {
      state.nextRowTick = ctx.tick + level.rows[state.rowIndex].gap;
    } else {
      state.nextRowTick = Infinity;
    }
  }

  for (let i = 0; i < state.activeRows.length; i++) {
    const r = state.activeRows[i];
    if (!r.resolved) r.z += config.runSpeed;
  }

  for (let i = 0; i < state.activeRows.length; i++) {
    const r = state.activeRows[i];
    if (r.resolved) continue;
    if (r.z < config.crowdZ) continue;
    r.resolved = true;
    const px = p ? p.x : config.W / 2;
    if (r.kind === 'gate') {
      const side = px < config.W / 2 ? 'left' : 'right';
      const op = side === 'left' ? r.left : r.right;
      const oldCrowd = state.crowd;
      const newCrowd = applyOp(state.crowd, op);
      state.crowd = newCrowd;
      const gained = newCrowd > oldCrowd;
      state.combo = gained ? state.combo + 1 : 0;
      if (gained) state.score += (newCrowd - oldCrowd);
      emit(state, 'gate', { good: gained, op, crowd: newCrowd, side, x: px, z: config.crowdZ });
      if (state.crowd <= 0) {
        state.result = 'loss';
        state.phase = 'loss';
        emit(state, 'loss', { reason: 'crowd' });
        return state;
      }
    } else if (r.kind === 'trap') {
      if (px >= r.x0 && px <= r.x1) {
        state.crowd -= r.loss;
        state.combo = 0;
        emit(state, 'trap', { x: px, z: config.crowdZ, loss: r.loss });
        if (state.crowd <= 0) {
          state.result = 'loss';
          state.phase = 'loss';
          emit(state, 'loss', { reason: 'crowd' });
          return state;
        }
      } else {
        emit(state, 'dodge', { x: px, z: config.crowdZ });
      }
    } else if (r.kind === 'bonus') {
      if (px >= r.x0 && px <= r.x1) {
        state.crowd += r.gain;
        state.score += r.gain;
        emit(state, 'bonus', { x: px, z: config.crowdZ, gain: r.gain });
      } else {
        emit(state, 'miss', { x: px, z: config.crowdZ });
      }
    }
  }

  state.activeRows = state.activeRows.filter(r => !r.resolved);

  if (state.rowIndex >= level.rows.length && state.activeRows.length === 0 && !state.clash) {
    state.clash = { enemyLeft: level.enemy };
    state.clashTicks = 0;
    emit(state, 'clashStart', { enemy: level.enemy });
  }

  if (!state.clash && ctx.tick - state.lastInputTick > config.idleLossTicks) {
    state.result = 'loss';
    state.phase = 'loss';
    emit(state, 'idle', {});
  }

  return state;
}

function isGameOver(state, ctx) {
  return {
    over: !!state.result,
    winners: state.result === 'win' ? [state.selfId] : []
  };
}

function viewFor(state, playerId, ctx) {
  return Object.assign({}, state, { rules: config, tickRate: meta.tickRate });
}

function pilot(state) {
  if (state.result || state.clash) return { type: 'input', dx: 0 };
  const p = state.players[state.selfId];
  if (!p) return { type: 'input', dx: 0 };
  const level = config.levels[state.level];

  let target = null;

  let nearest = null;
  for (let i = 0; i < state.activeRows.length; i++) {
    const r = state.activeRows[i];
    if (r.resolved) continue;
    if (r.z >= config.crowdZ) continue;
    if (nearest === null || r.z > nearest.z) nearest = r;
  }

  let row = nearest;
  if (!row) {
    if (state.rowIndex < level.rows.length) {
      row = level.rows[state.rowIndex];
    }
  }

  if (!row) return { type: 'input', dx: 0 };

  if (row.kind === 'gate') {
    const leftCrowd = applyOp(state.crowd, row.left);
    const rightCrowd = applyOp(state.crowd, row.right);
    let side;
    if (leftCrowd > rightCrowd) side = 'left';
    else if (rightCrowd > leftCrowd) side = 'right';
    else {
      const preferX = state.crowd >= 40;
      const leftIsX = row.left.k === 'x';
      const rightIsX = row.right.k === 'x';
      if (preferX) {
        if (leftIsX && !rightIsX) side = 'left';
        else if (rightIsX && !leftIsX) side = 'right';
        else side = leftCrowd >= rightCrowd ? 'left' : 'right';
      } else {
        const leftIsPlus = row.left.k === '+';
        const rightIsPlus = row.right.k === '+';
        if (leftIsPlus && !rightIsPlus) side = 'left';
        else if (rightIsPlus && !leftIsPlus) side = 'right';
        else side = leftCrowd >= rightCrowd ? 'left' : 'right';
      }
    }
    target = side === 'left' ? config.W * 0.25 : config.W * 0.75;
  } else if (row.kind === 'trap') {
    if (p.x >= row.x0 && p.x <= row.x1) {
      const leftEdge = row.x0 - 0.7;
      const rightEdge = row.x1 + 0.7;
      const distLeft = Math.abs(p.x - leftEdge);
      const distRight = Math.abs(p.x - rightEdge);
      target = distLeft <= distRight ? leftEdge : rightEdge;
      target = clamp(target, 0.6, config.W - 0.6);
    } else {
      return { type: 'input', dx: 0 };
    }
  } else if (row.kind === 'bonus') {
    const centre = (row.x0 + row.x1) / 2;
    if (Math.abs(p.x - centre) > 0.3) {
      target = centre;
    } else {
      return { type: 'input', dx: 0 };
    }
  }

  if (target === null) return { type: 'input', dx: 0 };
  let dx = clamp((target - p.x) * 2, -1, 1);
  if (Math.abs(dx) < 0.12) dx = 0;
  return { type: 'input', dx };
}

function referenceRoute(playerIndex) {
  const ctx = { tick: 0, now: 0, random: mulberry32(12345 + (playerIndex || 0)) };
  let s = setup(ctx, ['player-1']);
  const route = [];
  for (let tick = 1; tick <= 6000 && !s.result; tick++) {
    ctx.tick = tick;
    ctx.now = tick * 1000 / meta.tickRate;
    const a = pilot(s);
    const last = route[route.length - 1];
    if (last && last.action.dx === a.dx && last.toTick === tick - 1) last.toTick = tick;
    else route.push({ fromTick: tick, toTick: tick, action: a });
    s = applyAction(s, s.selfId, a, ctx);
    s = applyAction(s, null, { type: 'tick' }, ctx);
  }
  return route.slice(0, 1000);
}

function summarize(state) {
  return {
    phase: state.result || state.phase,
    crowd: state.crowd,
    score: state.score,
    level: state.level,
    tick: state.tick,
    rows: state.rowIndex,
    clash: state.clash ? state.clash.enemyLeft : null
  };
}

export { meta, config, setup, validateAction, applyAction, isGameOver, viewFor, pilot, referenceRoute, summarize };
