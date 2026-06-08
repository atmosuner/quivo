/* Quivo — reading tracker + detail screens */
const { useState: useSt } = React;

/* sub-screen scaffold with back nav */
function SubHead({ title, onBack, right }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, paddingTop: 52, paddingBottom: 10, background: 'linear-gradient(var(--bg) 78%, transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 99, border: '1px solid var(--line)', background: 'var(--surface)', boxShadow: 'var(--sh-1)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icons.chevL size={20} />
        </button>
        <span className="t-h3" style={{ fontSize: 16 }}>{title}</span>
        <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>{right}</div>
      </div>
    </div>
  );
}

/* ============================== READING ============================== */
function ReadingScreen({ go, onBack }) {
  const s = Q.STATS;
  const reading = Q.BOOKS.filter(b => b.status === 'reading');
  const done = Q.BOOKS.filter(b => b.status === 'done');
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Reading" onBack={onBack} right={<button onClick={() => go('addbook')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)' }}><Icons.plus size={24} /></button>} />
      <div className="q-body">
        {/* reading hero */}
        <div className="rise" style={{ borderRadius: 'var(--r-xl)', padding: 20, color: '#fff', overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(150deg, oklch(0.6 0.13 250), oklch(0.5 0.14 262))', boxShadow: '0 8px 22px -6px oklch(0.55 0.13 250 / .45)' }}>
          <div style={{ position: 'absolute', right: -30, top: -40, width: 150, height: 150, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.flameFill size={18} /><span style={{ fontWeight: 700, fontSize: 14 }}>{s.readingStreak}-day reading streak</span>
          </div>
          <div style={{ display: 'flex', gap: 26, marginTop: 18, position: 'relative' }}>
            <div><div className="t-num" style={{ fontSize: 30, fontWeight: 800 }}>{s.pagesThisMonth}</div><div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>pages this month</div></div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div><div className="t-num" style={{ fontSize: 30, fontWeight: 800 }}>{s.booksThisYear}</div><div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>books this year</div></div>
          </div>
        </div>

        {/* currently reading */}
        <SectionHead title="Currently reading" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reading.map(b => {
            const pct = Math.round((b.read / b.pages) * 100);
            return (
              <div key={b.id} className="pressable" onClick={() => go('book', b)} style={{ display: 'flex', gap: 14, background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 14 }}>
                <BookCover tone={b.tone} title={b.title} w={58} h={84} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="t-h3" style={{ fontSize: 15.5 }}>{b.title}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 1 }}>{b.author}</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span className="t-num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--cat-reading)' }}>{b.read} / {b.pages} pages</span>
                    <span className="t-num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>{pct}%</span>
                  </div>
                  <div className="bar thin"><i style={{ width: `${pct}%`, background: `linear-gradient(90deg, oklch(0.5 0.14 ${b.tone}), oklch(0.62 0.13 ${b.tone}))` }} /></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* finished */}
        <SectionHead title="Finished" />
        <div style={{ display: 'flex', gap: 13, overflowX: 'auto', padding: '2px 2px 6px', scrollbarWidth: 'none' }}>
          {done.map(b => (
            <div key={b.id} style={{ flexShrink: 0, width: 92 }}>
              <div style={{ position: 'relative' }}>
                <BookCover tone={b.tone} title={b.title} w={92} h={132} />
                <div style={{ position: 'absolute', right: 6, top: 6, width: 24, height: 24, borderRadius: 99, background: 'var(--success)', display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-2)', border: '2px solid #fff' }}><Icons.check size={13} stroke="#fff" /></div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 7, lineHeight: 1.2 }}>{b.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* book detail w/ log pages */
function BookScreen({ book, onBack, actions }) {
  const [read, setRead] = useSt(book.read);
  const pct = Math.round((read / book.pages) * 100);
  const [add, setAdd] = useSt(10);
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <BookCover tone={book.tone} title={book.title} w={118} h={170} />
          <h1 className="t-h1" style={{ marginTop: 18, fontSize: 21, lineHeight: 1.15 }}>{book.title}</h1>
          <div className="t-body" style={{ fontSize: 14, marginTop: 6 }}>{book.author}</div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 18, marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span className="t-h3">Progress</span>
            <span className="t-num" style={{ fontWeight: 700, color: 'var(--cat-reading)', whiteSpace: 'nowrap' }}>{read} / {book.pages}</span>
          </div>
          <div className="bar"><i style={{ width: `${pct}%`, background: `linear-gradient(90deg, oklch(0.5 0.14 ${book.tone}), oklch(0.62 0.13 ${book.tone}))` }} /></div>
          <div className="t-cap" style={{ marginTop: 8 }}>{pct}% complete · {book.pages - read} pages to go</div>
        </div>

        {/* log pages */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 18, marginTop: 14 }}>
          <div className="t-h3" style={{ marginBottom: 14 }}>Log pages read</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <button onClick={() => setAdd(Math.max(1, add - 5))} style={{ width: 44, height: 44, borderRadius: 99, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icons.plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div className="t-num" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{add}</div>
              <div className="t-cap">pages</div>
            </div>
            <button onClick={() => setAdd(add + 5)} style={{ width: 44, height: 44, borderRadius: 99, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icons.plus size={20} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, margin: '14px 0', fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icons.bolt size={14} />+{add} XP</span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Coin size={14} /><span style={{ color: 'var(--coin-ink)' }}>+{Math.round(add / 2)}</span></span>
          </div>
          <button className="btn btn-primary btn-md btn-block" onClick={() => { const nr = Math.min(book.pages, read + add); setRead(nr); actions.earn(add, Math.round(add / 2), nr >= book.pages ? 'Book finished!' : 'Pages logged'); }}>
            <Icons.book size={18} /> Log {add} pages
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600 }}>
          <Icons.shield size={15} /> Parent approval may be required
        </div>
      </div>
    </div>
  );
}

function AddBookScreen({ onBack }) {
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Add a book" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 8 }}>
        <Field label="Book title" placeholder="e.g. The Wild Robot" />
        <Field label="Author" placeholder="e.g. Peter Brown" />
        <Field label="Total pages" placeholder="288" num />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <span className="t-label">Cover</span>
          <Placeholder label="drop cover image" style={{ height: 120 }} />
        </div>
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 22 }} onClick={onBack}><Icons.plus size={20} /> Add book</button>
      </div>
    </div>
  );
}

/* ============================== TASK DETAIL ============================== */
function TaskScreen({ task, onBack, actions }) {
  const c = Q.CATS[task.cat];
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <IconTile icon={task.icon} tone={c.v} size={84} r={26} fill />
          <div style={{ marginTop: 16 }}><CatTag cat={task.cat} /></div>
          <h1 className="t-h1" style={{ marginTop: 12 }}>{task.title}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 24 }}>
          <RewardStat icon="bolt" value={`+${task.xp}`} label="XP" tone="--brand" />
          <CoinStat value={`+${task.coins}`} />
          <RewardStat icon="clock" value={`${task.mins}m`} label="Est. time" tone="--ink-2" />
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '16px 18px', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>Difficulty</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Difficulty level={task.diff} /><span style={{ fontSize: 13, fontWeight: 700 }}>{['Easy','Easy','Medium','Hard'][task.diff]}</span></span>
          </div>
          <hr className="hr" style={{ margin: '13px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>Repeats</span>
            <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>Every day</span>
          </div>
          <hr className="hr" style={{ margin: '13px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>Approval</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}><Icons.shield size={15} /> Parent reviews</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '6px 20px 8px' }}>
        {task.done
          ? <button className="btn btn-quiet btn-lg btn-block" onClick={() => actions.complete(task)}>Mark as not done</button>
          : <button className="btn btn-primary btn-lg btn-block" onClick={() => { actions.complete(task); onBack(); }}><Icons.check size={21} /> Complete task</button>}
      </div>
    </div>
  );
}

function RewardStat({ icon, value, label, tone }) {
  const I = Icons[icon];
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-1)', padding: '14px 8px', textAlign: 'center' }}>
      <span style={{ color: v(tone) }}><I size={22} /></span>
      <div className="t-num" style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: 'var(--ink)' }}>{value}</div>
      <div className="t-cap">{label}</div>
    </div>
  );
}
function CoinStat({ value }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-1)', padding: '14px 8px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Coin size={22} /></div>
      <div className="t-num" style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: 'var(--ink)' }}>{value}</div>
      <div className="t-cap">Coins</div>
    </div>
  );
}

/* ============================== REWARD DETAIL ============================== */
function RewardScreen({ reward, onBack, state, actions }) {
  const can = state.coins >= reward.cost;
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 4 }}>
        <Placeholder label={reward.title.toLowerCase()} tone={reward.tone} style={{ height: 180, borderRadius: 'var(--r-xl)' }} />
        <h1 className="t-h1" style={{ marginTop: 18 }}>{reward.title}</h1>
        <div className="t-body" style={{ marginTop: 4 }}>{reward.note}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 18, padding: '14px 16px', background: 'var(--coin-tint)', borderRadius: 'var(--r-lg)' }}>
          <Coin size={28} />
          <div><div className="t-num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{reward.cost} coins</div><div className="t-cap">Cost to redeem</div></div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <div className="t-num" style={{ fontSize: 14, fontWeight: 700, color: can ? 'var(--success)' : 'var(--ink-3)' }}>{can ? 'You can afford this' : `${reward.cost - state.coins} more`}</div>
            <div className="t-cap">Balance: {state.coins}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 16, color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600 }}>
          <Icons.shield size={16} /> A parent will approve this redemption.
        </div>
      </div>
      <div style={{ padding: '6px 20px 8px' }}>
        <button className="btn btn-primary btn-lg btn-block" disabled={!can} style={!can ? { background: 'var(--surface-3)', color: 'var(--ink-4)', boxShadow: 'none', cursor: 'not-allowed' } : {}}
          onClick={() => can && actions.redeem(reward)}>
          {can ? <><Icons.gift size={20} /> Redeem reward</> : 'Not enough coins yet'}
        </button>
      </div>
    </div>
  );
}

/* ============================== ACHIEVEMENT DETAIL ============================== */
function AchievementScreen({ a, onBack }) {
  const I = Icons[a.icon] || Icons.star;
  const earned = a.done;
  const pct = a.total ? Math.round((a.prog / a.total) * 100) : 100;
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 10, textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, margin: '0 auto', borderRadius: 36, display: 'grid', placeItems: 'center', color: earned ? '#fff' : 'var(--ink-4)',
          background: earned ? `linear-gradient(145deg, oklch(0.72 0.14 ${a.tone}), oklch(0.54 0.15 ${a.tone}))` : 'var(--surface-3)',
          boxShadow: earned ? `0 14px 30px -8px oklch(0.6 0.15 ${a.tone} / 0.55)` : 'none' }} className={earned ? 'pop' : ''}>
          {a.locked ? <Icons.lock size={48} /> : <I size={56} />}
        </div>
        <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 13px', borderRadius: 99,
          background: earned ? 'var(--success-tint)' : 'var(--surface-3)', color: earned ? 'var(--success)' : 'var(--ink-3)', fontWeight: 700, fontSize: 12.5 }}>
          {earned ? <><Icons.check size={15} /> Unlocked · {a.tier}</> : `${a.tier} · Locked`}
        </div>
        <h1 className="t-h1" style={{ marginTop: 14 }}>{a.title}</h1>
        <div className="t-body" style={{ marginTop: 6, maxWidth: 280, marginInline: 'auto' }}>{a.desc}</div>

        {!earned && a.total && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 18, marginTop: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span className="t-h3">Progress</span><span className="t-num" style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{a.prog} / {a.total}</span>
            </div>
            <Bar pct={pct} />
            <div className="t-cap" style={{ marginTop: 8 }}>{a.total - a.prog} more to unlock</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== SETTINGS ============================== */
function SettingsScreen({ onBack, openParent }) {
  const groups = [
    { head: 'Account', rows: [ { icon: 'user', label: 'Mia\u2019s profile', tone: '--brand' }, { icon: 'bell', label: 'Notifications', tone: '--cat-family', detail: 'On' } ] },
    { head: 'Parent controls', rows: [ { icon: 'shield', label: 'Parent area', tone: '--brand', action: openParent }, { icon: 'check', label: 'Approval required', tone: '--success', detail: 'Reading & tasks' }, { icon: 'gift', label: 'Reward approvals', tone: '--coin-ink', detail: 'On' } ] },
    { head: 'App', rows: [ { icon: 'moon', label: 'Appearance', tone: '--ink-2', detail: 'Light' }, { icon: 'star', label: 'About Quivo', tone: '--cat-learning', detail: 'v1.0' } ] },
  ];
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Settings" onBack={onBack} />
      <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {groups.map(g => (
          <div key={g.head}>
            <div className="t-eyebrow" style={{ margin: '0 4px 10px' }}>{g.head}</div>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', overflow: 'hidden' }}>
              {g.rows.map((r, i) => {
                const I = Icons[r.icon];
                return (
                  <div key={r.label} className="pressable" onClick={r.action} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', borderBottom: i < g.rows.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                    <IconTile icon={r.icon} tone={r.tone} size={34} r={10} />
                    <span className="t-h3" style={{ flex: 1, fontSize: 15.5 }}>{r.label}</span>
                    {r.detail && <span className="t-cap">{r.detail}</span>}
                    <Icons.chevR size={17} stroke="var(--ink-4)" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, placeholder, num, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      <label className="t-label">{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} inputMode={num ? 'numeric' : 'text'} style={{
        height: 52, borderRadius: 'var(--r-md)', border: '1px solid var(--line)', background: 'var(--surface)',
        padding: '0 16px', fontFamily: 'var(--font)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', outline: 'none',
      }} onFocus={(e) => e.target.style.borderColor = 'var(--brand)'} onBlur={(e) => e.target.style.borderColor = 'var(--line)'} />
    </div>
  );
}

Object.assign(window, { ReadingScreen, BookScreen, AddBookScreen, TaskScreen, RewardScreen, AchievementScreen, SettingsScreen, SubHead, Field });
