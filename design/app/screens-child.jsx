/* Quivo — child screens: Home, Quests, Rewards, Achievements, Profile */
const { useState: useS } = React;

/* ============================== HOME ============================== */
function HomeScreen({ state, actions, go }) {
  const c = Q.CHILD;
  const today = state.tasks.filter(t => t.today);
  const doneCount = today.filter(t => t.done).length;
  const nextTask = today.find(t => !t.done);
  const pct = Math.round((state.xpInLevel / c.xpToLevel) * 100);

  return (
    <div className="q-scroll q-body-tabbed">
      {/* greeting */}
      <div style={{ padding: '60px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 5 }}>Saturday · June 8</div>
          <h1 className="t-h1">Good morning, {c.name}</h1>
        </div>
        <div onClick={() => go('profile')} style={{ cursor: 'pointer' }}>
          <Avatar size={48} initial={c.initial} hue1={c.hue1} hue2={c.hue2} />
        </div>
      </div>

      <div className="q-body">
        {/* ---- Level / XP hero ---- */}
        <div className="rise g-brand" style={{
          borderRadius: 'var(--r-xl)', padding: 20, position: 'relative', overflow: 'hidden', color: '#fff',
          boxShadow: 'var(--sh-brand)',
        }}>
          <div style={{ position: 'absolute', right: -40, top: -50, width: 170, height: 170, borderRadius: 99, background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ position: 'absolute', right: 40, bottom: -70, width: 130, height: 130, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}>
                  <div style={{ textAlign: 'center', lineHeight: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.8, letterSpacing: '0.06em' }}>LVL</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }} className="t-num">{state.level}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.82 }}>{state.xp.toLocaleString()} total XP</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', borderRadius: 99, background: 'rgba(255,255,255,0.2)', fontWeight: 800, fontSize: 14 }} className="t-num">
                  <Icons.flameFill size={15} />{state.streak}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7, gap: 10 }}>
                <span className="t-num" style={{ fontSize: 13, fontWeight: 700, opacity: 0.95, whiteSpace: 'nowrap' }}>{state.xpInLevel} / {c.xpToLevel} XP</span>
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, whiteSpace: 'nowrap' }}>{c.xpToLevel - state.xpInLevel} to Lvl {state.level + 1}</span>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'rgba(255,255,255,0.95)', transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ---- balance + streak stats ---- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div className="pressable" onClick={() => go('rewards')} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '15px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Coin size={22} /><span className="t-cap">Coin balance</span></div>
            <div className="t-num" style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: 'var(--ink)' }}>{state.coins}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', marginTop: 2 }}>Spend in Rewards →</div>
          </div>
          <div className="pressable" onClick={() => go('reading')} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '15px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cat-reading)' }}><Icons.book size={20} /><span className="t-cap">Reading</span></div>
            <div className="t-num" style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: 'var(--ink)' }}>{Q.STATS.pagesThisMonth}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginTop: 2 }}>pages this month</div>
          </div>
        </div>

        {/* ---- Today's tasks ---- */}
        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 13px' }}>
            <h3 className="t-h2">Today</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="t-num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>{doneCount}/{today.length} done</span>
              <Ring pct={(doneCount / today.length) * 100} size={26} />
            </div>
          </div>

          {/* next-up CTA */}
          {nextTask ? (
            <div style={{ marginBottom: 14, background: 'var(--brand-tint)', borderRadius: 'var(--r-lg)', padding: 16, border: '1px solid color-mix(in oklab, var(--brand) 12%, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconTile icon={nextTask.icon} tone={Q.CATS[nextTask.cat].v} size={46} fill />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-eyebrow" style={{ color: 'var(--brand)' }}>Up next</div>
                  <div className="t-h3" style={{ marginTop: 2 }}>{nextTask.title}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-md btn-block" style={{ marginTop: 14, whiteSpace: 'nowrap' }} onClick={() => actions.complete(nextTask)}>
                <Icons.check size={19} /> Complete · +{nextTask.xp} XP
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 14, background: 'var(--success-tint)', borderRadius: 'var(--r-lg)', padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--success)', display: 'grid', placeItems: 'center', color: '#fff' }}><Icons.check size={24} /></div>
              <div><div className="t-h3">All done for today!</div><div className="t-body" style={{ fontSize: 13 }}>Amazing work. Come back tomorrow.</div></div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {today.map(t => <TaskRow key={t.id} task={t} onToggle={actions.complete} onOpen={(task) => go('task', task)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* progress ring */
function Ring({ pct, size = 26, sw = 4, color = 'var(--brand)' }) {
  const r = (size - sw) / 2, cx = size / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={sw} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * Math.min(100, pct)) / 100}
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }} />
    </svg>
  );
}

/* ============================== QUESTS ============================== */
function QuestsScreen({ state, actions, go }) {
  const [filter, setFilter] = useS('all');
  const cats = ['all', ...Object.keys(Q.CATS)];
  const list = state.tasks.filter(t => filter === 'all' || t.cat === filter);
  const active = list.filter(t => !t.done);
  const done = list.filter(t => t.done);

  return (
    <div className="q-scroll q-body-tabbed">
      <Header title="Quests" subtitle={`${active.length} tasks available`} />
      {/* category chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '6px 20px 4px', scrollbarWidth: 'none' }}>
        {cats.map(k => (
          <button key={k} onClick={() => setFilter(k)} className={`chip${filter === k ? ' chip-active' : ''}`} style={{ flexShrink: 0, cursor: 'pointer', border: 'none', font: 'inherit' }}>
            {k === 'all' ? 'All' : Q.CATS[k].label}
          </button>
        ))}
      </div>

      <div className="q-body" style={{ paddingTop: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.map(t => <TaskRow key={t.id} task={t} onToggle={actions.complete} onOpen={(task) => go('task', task)} />)}
        </div>
        {done.length > 0 && <>
          <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>Completed today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {done.map(t => <TaskRow key={t.id} task={t} onToggle={actions.complete} onOpen={(task) => go('task', task)} />)}
          </div>
        </>}
      </div>
    </div>
  );
}

/* ============================== REWARDS ============================== */
function RewardsScreen({ state, actions, go }) {
  return (
    <div className="q-scroll q-body-tabbed">
      <Header title="Rewards" subtitle="Reward store" right={
        <span className="stat-pill" style={{ marginTop: 30 }}><Coin size={20} /><span className="t-num">{state.coins}</span></span>
      } />
      <div className="q-body" style={{ paddingTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {Q.REWARDS.map(r => {
            const can = state.coins >= r.cost;
            return (
              <div key={r.id} className="pressable" onClick={() => go('reward', r)} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', overflow: 'hidden' }}>
                <Placeholder label={r.title.toLowerCase()} tone={r.tone} style={{ height: 92, borderRadius: 0 }} />
                <div style={{ padding: '11px 13px 13px' }}>
                  <div className="t-h3" style={{ fontSize: 15 }}>{r.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginTop: 2, marginBottom: 10 }}>{r.note}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Coin size={17} /><span className="t-num" style={{ fontWeight: 800, fontSize: 15, color: can ? 'var(--ink)' : 'var(--ink-4)' }}>{r.cost}</span></span>
                    {can
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', whiteSpace: 'nowrap' }}>Affordable</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{r.cost - state.coins} more</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== ACHIEVEMENTS ============================== */
function AchievementsScreen({ go }) {
  const earned = Q.ACHIEVEMENTS.filter(a => a.done);
  const prog = Q.ACHIEVEMENTS.filter(a => !a.done);
  return (
    <div className="q-scroll q-body-tabbed">
      <Header title="Achievements" subtitle={`${earned.length} of ${Q.ACHIEVEMENTS.length} unlocked`} />
      <div className="q-body" style={{ paddingTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
          {earned.map(a => <Badge key={a.id} a={a} onClick={() => go('achievement', a)} />)}
        </div>
        <div className="t-eyebrow" style={{ margin: '22px 2px 14px' }}>In progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {prog.map(a => <ProgBadge key={a.id} a={a} onClick={() => go('achievement', a)} />)}
        </div>
      </div>
    </div>
  );
}

function Badge({ a, onClick }) {
  const I = Icons[a.icon] || Icons.star;
  return (
    <div className="pressable" onClick={onClick} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '16px 8px 13px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, margin: '0 auto', borderRadius: 18, display: 'grid', placeItems: 'center', color: '#fff',
        background: `linear-gradient(145deg, oklch(0.7 0.14 ${a.tone}), oklch(0.55 0.15 ${a.tone}))`,
        boxShadow: `0 6px 14px -4px oklch(0.6 0.15 ${a.tone} / 0.5)` }}>
        <I size={28} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 9, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{a.title}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.tier}</div>
    </div>
  );
}

function ProgBadge({ a, onClick }) {
  const I = Icons[a.icon] || Icons.star;
  const pct = a.total ? (a.prog / a.total) * 100 : 0;
  return (
    <div className="pressable" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-1)', padding: '13px 15px', opacity: a.locked ? 0.7 : 1 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'grid', placeItems: 'center',
        background: a.locked ? 'var(--surface-3)' : `color-mix(in oklab, oklch(0.62 0.15 ${a.tone}) 14%, white)`,
        color: a.locked ? 'var(--ink-4)' : `oklch(0.55 0.15 ${a.tone})` }}>
        {a.locked ? <Icons.lock size={22} /> : <I size={24} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <div className="t-h3" style={{ fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
          <span className="t-num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>{a.prog}/{a.total}</span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', margin: '2px 0 9px' }}>{a.desc}</div>
        <Bar pct={pct} thin />
      </div>
    </div>
  );
}

/* ============================== PROFILE ============================== */
function ProfileScreen({ state, go, openParent }) {
  const c = Q.CHILD, s = Q.STATS;
  const statCards = [
    { icon: 'bolt', label: 'Total XP', value: state.xp.toLocaleString(), tone: '--brand' },
    { icon: 'flame', label: 'Day streak', value: state.streak, tone: '--streak' },
    { icon: 'book', label: 'Books read', value: s.booksRead, tone: '--cat-reading' },
    { icon: 'check', label: 'Tasks done', value: s.tasksCompleted, tone: '--success' },
  ];
  return (
    <div className="q-scroll q-body-tabbed">
      <div style={{ padding: '70px 20px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Avatar size={92} initial={c.initial} hue1={c.hue1} hue2={c.hue2} ring />
        <h1 className="t-h1" style={{ marginTop: 16 }}>{c.name}</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 8, height: 30, padding: '0 14px', borderRadius: 99, background: 'var(--brand-tint)', color: 'var(--brand-ink)', fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap' }}>
          <Icons.star size={15} /> Level {state.level} · {c.title}
        </div>
      </div>
      <div className="q-body" style={{ paddingTop: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {statCards.map(st => (
            <div key={st.label} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '15px 16px' }}>
              <IconTile icon={st.icon} tone={st.tone} size={36} r={11} />
              <div className="t-num" style={{ fontSize: 24, fontWeight: 800, marginTop: 11, color: 'var(--ink)' }}>{st.value}</div>
              <div className="t-cap" style={{ marginTop: 1 }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* weekly activity */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '17px 18px', marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <span className="t-h3">This week</span>
            <span className="t-num" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>410 XP</span>
          </div>
          <WeekChart />
        </div>

        {/* menu */}
        <div style={{ marginTop: 14, background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', overflow: 'hidden' }}>
          {[
            { icon: 'book', label: 'Reading tracker', tone: '--cat-reading', go: 'reading' },
            { icon: 'trophy', label: 'Achievements', tone: '--coin-ink', go: 'achievements' },
            { icon: 'settings', label: 'Settings', tone: '--ink-2', go: 'settings' },
          ].map((m, i, arr) => {
            const I = Icons[m.icon];
            return (
              <div key={m.label} className="pressable" onClick={() => go(m.go)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                <span style={{ color: v(m.tone) }}><I size={21} /></span>
                <span className="t-h3" style={{ flex: 1, fontSize: 15.5 }}>{m.label}</span>
                <Icons.chevR size={18} stroke="var(--ink-4)" />
              </div>
            );
          })}
        </div>

        {/* parent area */}
        <button onClick={openParent} className="btn btn-ghost btn-md btn-block" style={{ marginTop: 18 }}>
          <Icons.shield size={19} stroke="var(--brand)" /> Parent area
        </button>
      </div>
    </div>
  );
}

function WeekChart() {
  const max = Math.max(...Q.WEEK.map(d => d.xp));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 96, gap: 9 }}>
      {Q.WEEK.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 26, height: `${(d.xp / max) * 100}%`, borderRadius: 7,
            background: d.today ? 'var(--surface-3)' : 'linear-gradient(var(--brand), var(--brand-strong))',
            border: d.today ? '2px dashed var(--brand)' : 'none', opacity: d.done || d.today ? 1 : 0.4 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: d.today ? 'var(--brand)' : 'var(--ink-4)' }}>{d.d}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { HomeScreen, QuestsScreen, RewardsScreen, AchievementsScreen, ProfileScreen, Ring, Badge, WeekChart });
