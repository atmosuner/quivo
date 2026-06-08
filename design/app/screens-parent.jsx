/* Quivo — parent screens: Dashboard, Add Task, Approval */
const { useState: useP } = React;

/* ============================== PARENT DASHBOARD ============================== */
function ParentDashboard({ go, exit, queueCount }) {
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      {/* header */}
      <div style={{ padding: '58px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}><Icons.shield size={14} stroke="var(--brand)" /> Parent area</div>
          <h1 className="t-h1">Family</h1>
        </div>
        <button onClick={exit} style={{ height: 38, padding: '0 14px', borderRadius: 99, border: '1px solid var(--line)', background: 'var(--surface)', boxShadow: 'var(--sh-1)', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          Exit
        </button>
      </div>

      <div className="q-body">
        {/* approval callout */}
        {queueCount > 0 && (
          <div className="pressable g-brand" onClick={() => go('approval')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 'var(--r-lg)', color: '#fff', boxShadow: 'var(--sh-brand)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}><Icons.bell size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{queueCount} items to review</div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>Task completions & redemptions</div>
            </div>
            <Icons.chevR size={20} />
          </div>
        )}

        {/* kids */}
        <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>Children</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Q.KIDS.map(k => (
            <div key={k.name} className="pressable" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <Avatar size={50} initial={k.initial} hue1={k.hue1} hue2={k.hue2} />
                <div style={{ flex: 1 }}>
                  <div className="t-h3" style={{ fontSize: 16.5 }}>{k.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icons.star size={13} stroke="var(--brand)" /> Level {k.level}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--streak)' }}><Icons.flameFill size={13} /> {k.streak}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Coin size={13} /> {k.coins}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="t-num" style={{ fontWeight: 800, fontSize: 15 }}>{k.tasksDone}/{k.tasksTotal}</div>
                  <div className="t-cap">today</div>
                </div>
              </div>
              <div className="bar thin" style={{ marginTop: 13 }}><i style={{ width: `${(k.tasksDone / k.tasksTotal) * 100}%`, background: `linear-gradient(90deg, oklch(0.5 0.15 ${k.hue1}), oklch(0.62 0.15 ${k.hue2}))` }} /></div>
            </div>
          ))}
        </div>

        {/* quick actions */}
        <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>Manage</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: 'plus', label: 'Add task', sub: 'Create a habit', tone: '--brand', go: 'addtask' },
            { icon: 'gift', label: 'Rewards', sub: 'Edit the store', tone: '--coin-ink', go: 'parentrewards' },
            { icon: 'check', label: 'Approvals', sub: `${queueCount} pending`, tone: '--success', go: 'approval' },
            { icon: 'calendar', label: 'Reports', sub: 'Weekly progress', tone: '--cat-reading', go: 'reports' },
          ].map(a => {
            const I = Icons[a.icon];
            return (
              <div key={a.label} className="pressable" onClick={() => go(a.go)} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 16 }}>
                <IconTile icon={a.icon} tone={a.tone} size={40} r={12} />
                <div className="t-h3" style={{ marginTop: 11, fontSize: 15.5 }}>{a.label}</div>
                <div className="t-cap" style={{ marginTop: 1 }}>{a.sub}</div>
              </div>
            );
          })}
        </div>

        {/* weekly summary */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: '17px 18px', marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <span className="t-h3">Family activity</span><span className="t-cap">This week</span>
          </div>
          <WeekChart />
          <div style={{ display: 'flex', gap: 18, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
            <Mini label="Tasks done" value="38" />
            <Mini label="Pages read" value="142" />
            <Mini label="Coins earned" value="186" />
          </div>
        </div>
      </div>
    </div>
  );
}
function Mini({ label, value }) {
  return <div style={{ flex: 1 }}><div className="t-num" style={{ fontSize: 20, fontWeight: 800 }}>{value}</div><div className="t-cap" style={{ marginTop: 1 }}>{label}</div></div>;
}

/* ============================== ADD TASK ============================== */
function AddTaskScreen({ onBack }) {
  const [cat, setCat] = useP('responsibility');
  const [diff, setDiff] = useP(1);
  const [xp, setXp] = useP(10);
  const [coins, setCoins] = useP(5);
  const [approve, setApprove] = useP(true);
  const [repeat, setRepeat] = useP('daily');
  const [assignee, setAssignee] = useP('Mia');

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="New task" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 8 }}>
        <Field label="Task name" placeholder="e.g. Practice piano" />

        {/* category */}
        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Category</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.values(Q.CATS).map(c => (
              <button key={c.key} onClick={() => setCat(c.key)} className="chip" style={{ cursor: 'pointer', border: cat === c.key ? `1.5px solid ${v(c.v)}` : '1.5px solid transparent',
                background: cat === c.key ? v(c.t) : 'var(--surface-3)', color: cat === c.key ? v(c.v) : 'var(--ink-2)', fontWeight: 700 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: v(c.v) }} /> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* assign */}
        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Assign to</span>
          <div className="seg" style={{ marginTop: 10 }}>
            {Q.KIDS.map(k => <button key={k.name} className={assignee === k.name ? 'on' : ''} onClick={() => setAssignee(k.name)}>{k.name}</button>)}
            <button className={assignee === 'Both' ? 'on' : ''} onClick={() => setAssignee('Both')}>Both</button>
          </div>
        </div>

        {/* difficulty */}
        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Difficulty</span>
          <div className="seg" style={{ marginTop: 10 }}>
            {['Easy', 'Medium', 'Hard'].map((d, i) => <button key={d} className={diff === i + 1 ? 'on' : ''} onClick={() => setDiff(i + 1)}>{d}</button>)}
          </div>
        </div>

        {/* rewards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <Stepper label="XP reward" icon="bolt" tone="--brand" value={xp} set={setXp} step={5} />
          <Stepper label="Coins" coin value={coins} set={setCoins} step={1} />
        </div>

        {/* repeat */}
        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Repeat</span>
          <div className="seg" style={{ marginTop: 10 }}>
            {['Once', 'Daily', 'Weekly'].map((d) => <button key={d} className={repeat === d.toLowerCase() ? 'on' : ''} onClick={() => setRepeat(d.toLowerCase())}>{d}</button>)}
          </div>
        </div>

        {/* approval toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-1)' }}>
          <IconTile icon="shield" tone="--brand" size={38} r={11} />
          <div style={{ flex: 1 }}>
            <div className="t-h3" style={{ fontSize: 15 }}>Require approval</div>
            <div className="t-cap">Review before XP is granted</div>
          </div>
          <Toggle on={approve} set={setApprove} />
        </div>
      </div>
      <div style={{ padding: '6px 20px 8px' }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={onBack}><Icons.plus size={20} /> Create task</button>
      </div>
    </div>
  );
}

function Stepper({ label, icon, coin, tone, value, set, step = 1 }) {
  const I = icon ? Icons[icon] : null;
  return (
    <div style={{ flex: 1 }}>
      <span className="t-label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, height: 52, background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)', padding: '0 10px' }}>
        <button onClick={() => set(Math.max(0, value - step))} style={{ width: 30, height: 30, borderRadius: 9, border: 'none', background: 'var(--surface-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}><Icons.plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
        <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {coin ? <Coin size={16} /> : <span style={{ color: v(tone) }}><I size={16} /></span>}
          <span className="t-num" style={{ fontWeight: 800, fontSize: 17 }}>{value}</span>
        </div>
        <button onClick={() => set(value + step)} style={{ width: 30, height: 30, borderRadius: 9, border: 'none', background: 'var(--surface-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}><Icons.plus size={16} /></button>
      </div>
    </div>
  );
}

function Toggle({ on, set }) {
  return (
    <button onClick={() => set(!on)} style={{ width: 50, height: 30, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 3, background: on ? 'var(--success)' : 'var(--surface-3)', transition: 'background .2s', position: 'relative' }}>
      <span style={{ display: 'block', width: 24, height: 24, borderRadius: 99, background: '#fff', boxShadow: 'var(--sh-1)', transform: on ? 'translateX(20px)' : 'translateX(0)', transition: 'transform .2s cubic-bezier(.2,.9,.2,1)' }} />
    </button>
  );
}

/* ============================== APPROVAL ============================== */
function ApprovalScreen({ onBack, queue, redemptions, onResolve, onResolveRedemption }) {
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Approvals" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 6 }}>
        {queue.length === 0 && redemptions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 20, background: 'var(--success-tint)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}><Icons.check size={32} /></div>
            <div className="t-h2">All caught up</div>
            <div className="t-body" style={{ marginTop: 4 }}>No pending approvals.</div>
          </div>
        )}

        {redemptions.length > 0 && <>
          <div className="t-eyebrow" style={{ margin: '4px 2px 12px' }}>Reward redemptions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            {redemptions.map(r => (
              <div key={r.id} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconTile icon="gift" tone="--coin-ink" size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-h3" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reward}</div>
                    <div className="t-cap" style={{ marginTop: 2 }}>{r.child} · wants to redeem</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Coin size={18} /><span className="t-num" style={{ fontWeight: 800 }}>{r.cost}</span></span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button className="btn btn-quiet btn-md" style={{ flex: 1 }} onClick={() => onResolveRedemption(r.id, false)}>Decline</button>
                  <button className="btn btn-primary btn-md" style={{ flex: 1.4 }} onClick={() => onResolveRedemption(r.id, true)}><Icons.check size={18} /> Approve</button>
                </div>
              </div>
            ))}
          </div>
        </>}

        {queue.length > 0 && <div className="t-eyebrow" style={{ margin: '4px 2px 12px' }}>Task completions</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queue.map(item => {
            const c = Q.CATS[item.cat];
            return (
              <div key={item.id} style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-2)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Avatar size={42} initial={item.child[0]} hue1={item.child === 'Leo' ? 200 : 282} hue2={item.child === 'Leo' ? 160 : 250} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-h3" style={{ fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.task}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                      <CatTag cat={item.cat} small />
                      <span className="t-cap" style={{ whiteSpace: 'nowrap' }}>{item.child} · {item.when}</span>
                    </div>
                    {item.note && <div style={{ marginTop: 10, padding: '9px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'flex', gap: 7, alignItems: 'center' }}><Icons.pages size={15} stroke="var(--ink-3)" />{item.note}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icons.bolt size={14} />+{item.xp}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Coin size={14} /><span style={{ color: 'var(--coin-ink)' }}>+{item.coins}</span></span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-quiet btn-sm" onClick={() => onResolve(item.id, false)} style={{ width: 44, padding: 0 }}><Icons.close size={18} /></button>
                    <button className="btn btn-primary btn-sm" onClick={() => onResolve(item.id, true)}><Icons.check size={17} /> Approve</button>
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

Object.assign(window, { ParentDashboard, AddTaskScreen, ApprovalScreen, Stepper, Toggle, Mini });
