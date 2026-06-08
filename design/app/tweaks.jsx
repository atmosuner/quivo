/* Quivo — Tweaks panel (accent, corners, motion) */
const { useEffect: uTE } = React;

const ACCENTS = {
  '#6655d6': { name: 'Indigo', h: 280, c: 0.17 },
  '#8a4fd0': { name: 'Violet', h: 305, c: 0.17 },
  '#3f6fd6': { name: 'Blue',   h: 256, c: 0.15 },
  '#1f93a8': { name: 'Teal',   h: 205, c: 0.11 },
};

function applyAccent(hex) {
  const a = ACCENTS[hex] || ACCENTS['#6655d6'];
  const { h, c } = a;
  const r = document.documentElement.style;
  r.setProperty('--brand', `oklch(0.55 ${c} ${h})`);
  r.setProperty('--brand-strong', `oklch(0.47 ${c + 0.01} ${h})`);
  r.setProperty('--brand-press', `oklch(0.42 ${c} ${h})`);
  r.setProperty('--brand-tint', `oklch(0.96 ${(c * 0.18).toFixed(3)} ${h})`);
  r.setProperty('--brand-tint-2', `oklch(0.93 ${(c * 0.28).toFixed(3)} ${h})`);
  r.setProperty('--brand-ink', `oklch(0.40 ${c - 0.01} ${h})`);
  r.setProperty('--sh-brand', `0 8px 22px -6px oklch(0.55 ${c} ${h} / 0.42)`);
}

const CORNERS = { Sharp: 0.55, Default: 1, Soft: 1.3 };

function QuivoTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  uTE(() => { applyAccent(t.accent); }, [t.accent]);
  uTE(() => {
    document.documentElement.style.setProperty('--r-scale', String(CORNERS[t.corners] ?? 1));
  }, [t.corners]);
  uTE(() => {
    document.documentElement.classList.toggle('no-motion', !t.motion);
  }, [t.motion]);

  return (
    <TweaksPanel>
      <TweakSection label="Accent" />
      <TweakColor label="App color" value={t.accent}
        options={Object.keys(ACCENTS)}
        onChange={(v) => setTweak('accent', v)} />
      <TweakSection label="Shape" />
      <TweakRadio label="Corners" value={t.corners}
        options={['Sharp', 'Default', 'Soft']}
        onChange={(v) => setTweak('corners', v)} />
      <TweakSection label="Motion" />
      <TweakToggle label="Animations &amp; celebrations" value={t.motion}
        onChange={(v) => setTweak('motion', v)} />
    </TweaksPanel>
  );
}

const TWEAK_DEFAULTS = { accent: '#6655d6', corners: 'Default', motion: true };

window.QuivoTweaks = QuivoTweaks;
