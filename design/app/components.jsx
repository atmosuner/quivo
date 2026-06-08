/* Quivo — shared UI atoms & molecules */
const { useState, useEffect, useRef } = React;
const v = (token) => `var(${token})`;

/* ---------- Avatar (abstract geometric, soft gradient) ---------- */
function Avatar({ size = 48, initial = 'M', hue1 = 282, hue2 = 250, ring = false, glyphs = true }) {
  const r = size * 0.3;
  return (
    <div className="avatar" style={{
      width: size, height: size, borderRadius: r, fontSize: size * 0.42,
      background: `linear-gradient(140deg, oklch(0.64 0.16 ${hue1}), oklch(0.52 0.17 ${hue2}))`,
      boxShadow: ring ? `0 0 0 ${size*0.05}px var(--surface), 0 0 0 calc(${size*0.05}px + 2px) oklch(0.6 0.15 ${hue1} / .5), var(--sh-2)` : 'var(--sh-2)',
    }}>
      {glyphs && <>
        <span className="avatar-glyph" style={{ width: size*0.5, height: size*0.5, right: -size*0.12, top: -size*0.12, background: `oklch(0.85 0.12 ${hue1} / 0.4)` }} />
        <span className="avatar-glyph" style={{ width: size*0.34, height: size*0.34, left: -size*0.08, bottom: -size*0.08, background: `oklch(0.45 0.16 ${hue2} / 0.45)` }} />
      </>}
      <span style={{ position: 'relative', zIndex: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>{initial}</span>
    </div>
  );
}

/* ---------- Coin chip ---------- */
function Coin({ size = 18 }) {
  return (
    <span className="coin" style={{ width: size, height: size }}>
      <span style={{ fontSize: size * 0.58 }}>Q</span>
    </span>
  );
}
function CoinValue({ value, size = 15, gap = 5, weight = 800 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Coin size={size + 3} />
      <span className="t-num" style={{ fontWeight: weight, fontSize: size, color: 'var(--ink)' }}>{value}</span>
    </span>
  );
}

/* ---------- XP / progress bar ---------- */
function Bar({ pct, thin = false }) {
  return <div className={`bar${thin ? ' thin' : ''}`}><i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
}

/* ---------- Difficulty dots ---------- */
function Difficulty({ level = 1 }) {
  return <span className="diff">{[1,2,3].map(i => <i key={i} className={i <= level ? 'on' : ''} />)}</span>;
}

/* ---------- Category tag ---------- */
function CatTag({ cat, small = false }) {
  const c = Q.CATS[cat];
  if (!c) return null;
  return (
    <span className="tag" style={{ background: v(c.t), color: v(c.v), height: small ? 22 : 24 }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: v(c.v) }} />
      {c.label}
    </span>
  );
}

/* ---------- Stat pill (icon + value) ---------- */
function StatPill({ icon, value, tone = '--brand', tint }) {
  const I = Icons[icon];
  return (
    <span className="stat-pill">
      <span style={{
        width: 24, height: 24, borderRadius: 99, display: 'grid', placeItems: 'center',
        background: tint || `color-mix(in oklab, ${v(tone)} 14%, white)`, color: v(tone),
      }}>
        <I size={15} />
      </span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </span>
  );
}

/* ---------- Icon tile (rounded square w/ tinted glyph) ---------- */
function IconTile({ icon, tone = '--brand', size = 44, r = 13, fill }) {
  const I = Icons[icon] || Icons.star;
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      display: 'grid', placeItems: 'center',
      background: fill ? v(tone) : `color-mix(in oklab, ${v(tone)} 13%, white)`,
      color: fill ? '#fff' : v(tone),
    }}>
      <I size={size * 0.5} />
    </div>
  );
}

/* ---------- Section header ---------- */
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 12px' }}>
      <h3 className="t-h2">{title}</h3>
      {action && <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 700, fontSize: 14, color: 'var(--brand)' }}>{action}</button>}
    </div>
  );
}

/* ---------- Task row ---------- */
function TaskRow({ task, onToggle, onOpen }) {
  const c = Q.CATS[task.cat];
  return (
    <div className="pressable" onClick={() => onOpen && onOpen(task)} style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px',
      background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-1)',
      opacity: task.done ? 0.62 : 1,
    }}>
      <IconTile icon={task.icon} tone={c.v} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="t-h3" style={{ textDecoration: task.done ? 'line-through' : 'none', textDecorationColor: 'var(--ink-4)' }}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: 'var(--brand)' }}>
            <Icons.bolt size={13} />+{task.xp}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Coin size={14} /><span className="t-num" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--coin-ink)' }}>+{task.coins}</span></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}><Icons.clock size={13} />{task.mins}m</span>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggle && onToggle(task); }} className={`cbx${task.done ? ' on' : ''}`} aria-label="complete">
        {task.done && <Icons.check size={16} stroke="#fff" />}
      </button>
    </div>
  );
}

/* ---------- Book cover placeholder ---------- */
function BookCover({ tone = 250, w = 56, h = 80, title }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 8, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(145deg, oklch(0.72 0.12 ${tone}), oklch(0.55 0.14 ${tone}))`,
      boxShadow: 'var(--sh-2)',
    }}>
      <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 3, background: 'rgba(0,0,0,0.12)' }} />
      <div style={{ position: 'absolute', inset: 0, padding: '10px 8px 8px 14px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: w*0.13, fontWeight: 800, color: 'rgba(255,255,255,0.96)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>{title}</div>
      </div>
    </div>
  );
}

/* ---------- Image placeholder ---------- */
function Placeholder({ label = 'image', tone, style }) {
  return (
    <div className="ph" style={{ ...(tone ? { background: `linear-gradient(145deg, oklch(0.92 0.05 ${tone}), oklch(0.86 0.07 ${tone}))` } : {}), ...style }}>
      <span className="ph-label" style={tone ? { color: `oklch(0.45 0.12 ${tone})` } : {}}>{label}</span>
    </div>
  );
}

/* ---------- Top header (greeting + stats) ---------- */
function Header({ title, subtitle, right, large = true, pad = true }) {
  return (
    <div style={{ padding: pad ? '60px 20px 8px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {subtitle && <div className="t-eyebrow" style={{ marginBottom: 6 }}>{subtitle}</div>}
          <h1 className={large ? 't-display' : 't-h1'}>{title}</h1>
        </div>
        {right}
      </div>
    </div>
  );
}

/* ---------- Generic sheet / modal ---------- */
function Sheet({ open, onClose, children, height }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(20,18,40,0.32)', backdropFilter: 'blur(2px)', animation: 'q-rise .25s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: 'var(--surface)', borderRadius: '28px 28px 0 0',
        boxShadow: 'var(--sh-4)', padding: '12px 20px 34px', maxHeight: height || '86%', overflowY: 'auto',
        animation: 'q-sheet .34s cubic-bezier(.2,.85,.2,1)',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 16px' }} />
        {children}
      </div>
    </div>
  );
}

window.UI = { Avatar, Coin, CoinValue, Bar, Difficulty, CatTag, StatPill, IconTile, SectionHead, TaskRow, BookCover, Placeholder, Header, Sheet, v };
Object.assign(window, { Avatar, Coin, CoinValue, Bar, Difficulty, CatTag, StatPill, IconTile, SectionHead, TaskRow, BookCover, Placeholder, Header, Sheet });
