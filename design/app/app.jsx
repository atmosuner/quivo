/* Quivo — app shell: routing, state, celebration, tab bar */
const { useState: uS, useEffect: uE } = React;

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'quests', label: 'Quests', icon: 'quests' },
  { key: 'rewards', label: 'Rewards', icon: 'rewards' },
  { key: 'achievements', label: 'Awards', icon: 'trophy' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];
const TAB_KEYS = TABS.map(t => t.key);

function TabBar({ active, onTab }) {
  return (
    <div className="tabbar">
      {TABS.map(t => {
        const on = active === t.key;
        const I = Icons[on ? t.icon + 'Fill' : t.icon] || Icons[t.icon];
        return (
          <button key={t.key} className={`tab${on ? ' active' : ''}`} onClick={() => onTab(t.key)}>
            <span className="tab-ic"><I size={25} /></span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* celebration overlay */
function Celebration({ data, onClose }) {
  if (!data) return null;
  const confetti = Array.from({ length: 28 });
  const hues = [282, 250, 45, 160, 12];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', background: 'rgba(20,18,40,0.4)', backdropFilter: 'blur(3px)', animation: 'q-rise .2s ease' }}>
      <div className="confetti-layer" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {confetti.map((_, i) => {
          const left = Math.random() * 100, delay = Math.random() * 0.3, dur = 1.4 + Math.random() * 0.8, sz = 7 + Math.random() * 7;
          return <span key={i} style={{ position: 'absolute', left: `${left}%`, top: '-8%', width: sz, height: sz * (Math.random() > 0.5 ? 1 : 0.5), borderRadius: Math.random() > 0.5 ? 99 : 2,
            background: `oklch(0.68 0.16 ${hues[i % hues.length]})`, animation: `q-fall ${dur}s ${delay}s cubic-bezier(.3,.6,.5,1) forwards`, opacity: 0.9 }} />;
        })}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="pop" style={{ width: 280, background: 'var(--surface)', borderRadius: 28, boxShadow: 'var(--sh-4)', padding: '30px 24px 24px', textAlign: 'center', position: 'relative' }}>
        <div className={data.levelUp ? 'g-brand' : 'g-success'} style={{ width: 84, height: 84, margin: '0 auto', borderRadius: 26, display: 'grid', placeItems: 'center', color: '#fff',
          boxShadow: 'var(--sh-3)' }}>
          {data.levelUp ? <Icons.arrowUp size={42} /> : <Icons.check size={44} />}
        </div>
        <h2 className="t-h1" style={{ marginTop: 18, fontSize: 23 }}>{data.title}</h2>
        {data.sub && <div className="t-body" style={{ marginTop: 5 }}>{data.sub}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18 }}>
          {data.xp > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 40, padding: '0 16px', borderRadius: 99, background: 'var(--brand-tint)', color: 'var(--brand-ink)', fontWeight: 800, fontSize: 16 }}><Icons.bolt size={17} />+{data.xp} XP</span>}
          {data.coins > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 16px', borderRadius: 99, background: 'var(--coin-tint)', color: 'var(--coin-ink)', fontWeight: 800, fontSize: 16 }}><Coin size={18} />+{data.coins}</span>}
        </div>
        <button className="btn btn-primary btn-md btn-block" style={{ marginTop: 20 }} onClick={onClose}>Nice!</button>
      </div>
    </div>
  );
}

function App() {
  const c = Q.CHILD;
  const [tab, setTab] = uS('home');
  const [stack, setStack] = uS([]);                 // sub-screen stack: {screen, data}
  const [mode, setMode] = uS('child');              // child | parent
  const [pstack, setPstack] = uS(['dash']);         // parent stack
  const [tasks, setTasks] = uS(Q.TASKS);
  const [coins, setCoins] = uS(c.coins);
  const [xp, setXp] = uS(c.xp);
  const [xpInLevel, setXpInLevel] = uS(c.xpInLevel);
  const [level, setLevel] = uS(c.level);
  const [streak] = uS(c.streak);
  const [celebrate, setCelebrate] = uS(null);
  const [queue, setQueue] = uS(Q.APPROVALS);
  const [redemptions, setRedemptions] = uS(Q.REDEMPTIONS);

  const state = { tasks, coins, xp, xpInLevel, level, streak };

  const grantXp = (addXp, addCoins) => {
    setCoins(v => v + addCoins);
    setXp(v => v + addXp);
    let leveled = false;
    setXpInLevel(prev => {
      let n = prev + addXp;
      if (n >= c.xpToLevel) { n -= c.xpToLevel; leveled = true; }
      return n;
    });
    if (leveled) setLevel(l => l + 1);
    return leveled;
  };

  const actions = {
    complete: (task) => {
      const wasDone = tasks.find(t => t.id === task.id)?.done;
      setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
      if (!wasDone) {
        const leveled = grantXp(task.xp, task.coins);
        setTimeout(() => setCelebrate(leveled
          ? { levelUp: true, title: `Level ${level + 1}!`, sub: 'You leveled up. Keep the streak going.', xp: task.xp, coins: task.coins }
          : { title: 'Task complete!', sub: task.title, xp: task.xp, coins: task.coins }), 180);
      } else {
        setCoins(v => Math.max(0, v - task.coins));
        setXp(v => Math.max(0, v - task.xp));
        setXpInLevel(v => Math.max(0, v - task.xp));
      }
    },
    earn: (addXp, addCoins, label) => {
      const leveled = grantXp(addXp, addCoins);
      setTimeout(() => setCelebrate(leveled
        ? { levelUp: true, title: `Level ${level + 1}!`, sub: 'You leveled up!', xp: addXp, coins: addCoins }
        : { title: label || 'Nice work!', sub: '', xp: addXp, coins: addCoins }), 150);
    },
    redeem: (reward) => {
      setCoins(v => v - reward.cost);
      setRedemptions(r => [{ id: 'd' + Date.now(), child: 'Mia', reward: reward.title, cost: reward.cost, when: 'Just now' }, ...r]);
      popStack();
      setTimeout(() => setCelebrate({ title: 'Sent for approval', sub: `${reward.title} · a parent will confirm`, xp: 0, coins: 0 }), 150);
    },
  };

  // navigation
  const go = (screen, data) => {
    if (TAB_KEYS.includes(screen)) { setStack([]); setTab(screen); }
    else setStack(s => [...s, { screen, data }]);
  };
  const popStack = () => setStack(s => s.slice(0, -1));
  const top = stack[stack.length - 1];

  const pgo = (screen) => {
    if (['addtask', 'approval'].includes(screen)) setPstack(s => [...s, screen]);
    else if (screen === 'parentrewards' || screen === 'reports') setPstack(s => [...s, screen]);
  };
  const ptop = pstack[pstack.length - 1];
  const ppop = () => setPstack(s => s.slice(0, -1));

  const resolveTask = (id, ok) => setQueue(q => q.filter(i => i.id !== id));
  const resolveRedemption = (id) => setRedemptions(r => r.filter(i => i.id !== id));
  const queueCount = queue.length + redemptions.length;

  /* ---------- PARENT MODE ---------- */
  if (mode === 'parent') {
    let screen;
    if (ptop === 'addtask') screen = <AddTaskScreen onBack={ppop} />;
    else if (ptop === 'approval') screen = <ApprovalScreen onBack={ppop} queue={queue} redemptions={redemptions} onResolve={resolveTask} onResolveRedemption={resolveRedemption} />;
    else if (ptop === 'parentrewards' || ptop === 'reports') screen = <ComingSoon title={ptop === 'reports' ? 'Reports' : 'Reward store'} onBack={ppop} />;
    else screen = <ParentDashboard go={pgo} exit={() => { setMode('child'); setPstack(['dash']); }} queueCount={queueCount} />;
    return (
      <div className="q-app">
        {screen}
        <Celebration data={celebrate} onClose={() => setCelebrate(null)} />
      </div>
    );
  }

  /* ---------- CHILD MODE ---------- */
  let content;
  if (top) {
    const d = top.data;
    if (top.screen === 'task') content = <TaskScreen task={tasks.find(t => t.id === d.id) || d} onBack={popStack} actions={actions} />;
    else if (top.screen === 'reward') content = <RewardScreen reward={d} onBack={popStack} state={state} actions={actions} />;
    else if (top.screen === 'achievement') content = <AchievementScreen a={d} onBack={popStack} />;
    else if (top.screen === 'reading') content = <ReadingScreen go={go} onBack={popStack} />;
    else if (top.screen === 'book') content = <BookScreen book={d} onBack={popStack} actions={actions} />;
    else if (top.screen === 'addbook') content = <AddBookScreen onBack={popStack} />;
    else if (top.screen === 'settings') content = <SettingsScreen onBack={popStack} openParent={() => setMode('parent')} />;
  }
  if (!content) {
    if (tab === 'home') content = <HomeScreen state={state} actions={actions} go={go} />;
    else if (tab === 'quests') content = <QuestsScreen state={state} actions={actions} go={go} />;
    else if (tab === 'rewards') content = <RewardsScreen state={state} actions={actions} go={go} />;
    else if (tab === 'achievements') content = <AchievementsScreen go={go} />;
    else if (tab === 'profile') content = <ProfileScreen state={state} go={go} openParent={() => setMode('parent')} />;
  }

  const showTabs = !top;

  return (
    <div className="q-app">
      <div key={tab + (top ? top.screen : '')} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {content}
      </div>
      {showTabs && <TabBar active={tab} onTab={(t) => go(t)} />}
      <Celebration data={celebrate} onClose={() => setCelebrate(null)} />
    </div>
  );
}

function ComingSoon({ title, onBack }) {
  return (
    <div className="q-scroll">
      <SubHead title={title} onBack={onBack} />
      <div style={{ textAlign: 'center', padding: '70px 30px', color: 'var(--ink-3)' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 20, background: 'var(--brand-tint)', color: 'var(--brand)', display: 'grid', placeItems: 'center' }}><Icons.sparkle size={32} /></div>
        <div className="t-h2">{title}</div>
        <div className="t-body" style={{ marginTop: 6 }}>This area is part of the parent toolkit.</div>
      </div>
    </div>
  );
}

window.QuivoApp = App;
