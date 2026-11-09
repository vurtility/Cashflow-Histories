import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Brand, BRANDS} from './brands';

export type FrameProps = {brand: string; frame: 'title' | 'reveal' | 'bars' | 'quote' | 'logo'};

const Texture: React.FC<{b: Brand}> = ({b}) => {
  if (b.texture === 'grid') {
    return (
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${b.rule} 1px, transparent 1px), linear-gradient(90deg, ${b.rule} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          opacity: 0.55,
        }}
      />
    );
  }
  if (b.texture === 'paper') {
    return (
      <AbsoluteFill style={{opacity: 0.35, mixBlendMode: 'multiply'}}>
        <svg width="100%" height="100%">
          <filter id="n">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.32  0 0 0 0.18 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#n)" />
        </svg>
      </AbsoluteFill>
    );
  }
  return null;
};

export const Mark: React.FC<{b: Brand; size?: number}> = ({b, size = 1}) => {
  const s = size;
  if (b.key === 'ledger') {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 18 * s}}>
        <svg width={46 * s} height={58 * s} viewBox="0 0 46 58">
          <path d="M2 2 H44 V50 L39 55 L34 50 L29 55 L23 50 L17 55 L12 50 L7 55 L2 50 Z" fill={b.panel} stroke={b.ink} strokeWidth="3" />
          <line x1="10" y1="14" x2="36" y2="14" stroke={b.ink} strokeWidth="3" />
          <line x1="10" y1="24" x2="30" y2="24" stroke={b.muted} strokeWidth="3" />
          <line x1="10" y1="34" x2="36" y2="34" stroke={b.accent} strokeWidth="4" />
        </svg>
        <div style={{fontFamily: b.headFont, fontWeight: 800, fontSize: 40 * s, color: b.ink, letterSpacing: -0.5}}>
          {b.workingName}
        </div>
      </div>
    );
  }
  if (b.key === 'terminal') {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * s, fontFamily: b.numFont, fontWeight: 800, fontSize: 36 * s}}>
        <span style={{color: b.accent}}>[</span>
        <span style={{color: b.ink, letterSpacing: 2}}>{b.workingName.toUpperCase()}</span>
        <span style={{width: 18 * s, height: 34 * s, background: b.accent, display: 'inline-block'}} />
        <span style={{color: b.accent}}>]</span>
      </div>
    );
  }
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16 * s}}>
      <div style={{width: 54 * s, height: 54 * s, borderRadius: 999, background: b.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 22 * s, height: 22 * s, borderRadius: 999, background: b.bg}} />
      </div>
      <div style={{fontFamily: b.headFont, fontSize: 40 * s, color: b.ink, lineHeight: 0.9, textTransform: 'uppercase'}}>
        {b.workingName}
      </div>
    </div>
  );
};

const Bug: React.FC<{b: Brand}> = ({b}) => (
  <div style={{position: 'absolute', right: 70, bottom: 56, opacity: 0.85}}>
    <Mark b={b} size={0.55} />
  </div>
);

const Source: React.FC<{b: Brand; text: string}> = ({b, text}) => (
  <div style={{position: 'absolute', left: 90, bottom: 62, fontFamily: b.bodyFont, fontSize: 22, color: b.muted}}>
    Source: {text}
  </div>
);

const H: React.FC<{b: Brand; size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({b, size, color, children, style}) => (
  <div style={{fontFamily: b.headFont, fontWeight: b.headWeight, fontSize: size, color: color ?? b.ink, textTransform: b.headCase, lineHeight: 1.02, letterSpacing: b.key === 'ledger' ? -1.5 : -0.5, ...style}}>
    {children}
  </div>
);

const Title: React.FC<{b: Brand}> = ({b}) => (
  <AbsoluteFill style={{padding: '0 140px', justifyContent: 'center'}}>
    <div style={{fontFamily: b.numFont, fontWeight: b.numWeight, fontSize: 30, color: b.accent, letterSpacing: 6, marginBottom: 26}}>
      CHAPTER 5
    </div>
    <H b={b} size={150}>Here's the real issue</H>
    <div style={{width: 260, height: 10, background: b.accent, marginTop: 40, borderRadius: b.radius}} />
  </AbsoluteFill>
);

const Reveal: React.FC<{b: Brand}> = ({b}) => {
  const bars = [
    {y: '2023', v: 15},
    {y: '2024', v: 397},
    {y: '2025', v: 688},
  ];
  return (
    <AbsoluteFill style={{padding: '110px 140px', flexDirection: 'row', alignItems: 'center', gap: 120}}>
      <div style={{flex: 1}}>
        <div style={{fontFamily: b.bodyFont, fontSize: 30, color: b.muted, fontWeight: 600, marginBottom: 14}}>Subway net income</div>
        <div style={{fontFamily: b.numFont, fontWeight: b.numWeight, fontSize: 210, color: b.gain, lineHeight: 1}}>$688M</div>
        <div style={{fontFamily: b.bodyFont, fontSize: 40, color: b.ink, marginTop: 24, fontWeight: 600}}>
          up from <span style={{color: b.accent}}>$15M</span> two years earlier
        </div>
        <div style={{marginTop: 28, display: 'inline-block', padding: '10px 20px', background: b.panel, border: `2px solid ${b.rule}`, borderRadius: b.radius, fontFamily: b.bodyFont, fontSize: 26, color: b.loss, fontWeight: 600}}>
          ▼ franchise revenue −6%
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 44, height: 620}}>
        {bars.map((x, i) => (
          <div key={x.y} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
            <div style={{fontFamily: b.numFont, fontWeight: b.numWeight, fontSize: 34, color: b.ink}}>${x.v}M</div>
            <div style={{width: 130, height: Math.max(8, (x.v / 688) * 480), background: i === 2 ? b.gain : b.muted, borderRadius: `${b.radius}px ${b.radius}px 0 0`, opacity: i === 2 ? 1 : 0.55}} />
            <div style={{fontFamily: b.bodyFont, fontSize: 28, color: b.muted, fontWeight: 600}}>{x.y}</div>
          </div>
        ))}
      </div>
      <Source b={b} text="Subway 2026 franchise disclosure document (via Restaurant Dive)" />
    </AbsoluteFill>
  );
};

const Bars: React.FC<{b: Brand}> = ({b}) => {
  const rows = [
    {n: "McDonald's", v: 4.09, c: b.muted},
    {n: "Jersey Mike's", v: 1.37, c: b.accent2},
    {n: 'Subway', v: 0.5, c: b.accent, est: true},
  ];
  return (
    <AbsoluteFill style={{padding: '120px 140px', justifyContent: 'center'}}>
      <H b={b} size={74} style={{marginBottom: 18}}>Average sales per restaurant</H>
      <div style={{fontFamily: b.bodyFont, fontSize: 28, color: b.muted, marginBottom: 70}}>United States · 2025 · per year</div>
      {rows.map((r) => (
        <div key={r.n} style={{display: 'flex', alignItems: 'center', marginBottom: 46}}>
          <div style={{width: 330, fontFamily: b.bodyFont, fontWeight: 800, fontSize: 40, color: r.n === 'Subway' ? b.accent : b.ink}}>{r.n}</div>
          <div style={{height: 92, width: (r.v / 4.09) * 1050, background: r.c, borderRadius: b.radius}} />
          <div style={{marginLeft: 26, fontFamily: b.numFont, fontWeight: b.numWeight, fontSize: 52, color: b.ink}}>
            {r.est ? '~' : ''}${r.v >= 1 ? `${r.v.toFixed(2)}M` : '500K'}
          </div>
        </div>
      ))}
      <Source b={b} text="McDonald's and Jersey Mike's filings; Subway: Circana estimate" />
    </AbsoluteFill>
  );
};

const Quote: React.FC<{b: Brand}> = ({b}) => (
  <AbsoluteFill style={{padding: '0 200px', justifyContent: 'center'}}>
    <div style={{fontFamily: b.headFont, fontSize: 220, color: b.accent, lineHeight: 0.6, height: 110}}>“</div>
    <H b={b} size={84} style={{textTransform: 'none'}}>
      …decisions that provide the greatest benefit to the entire Subway system.
    </H>
    <div style={{marginTop: 46, fontFamily: b.bodyFont, fontSize: 32, color: b.muted, fontWeight: 600}}>
      Subway, on its $6.99 footlong deal · 2024
    </div>
    <Source b={b} text="Franchise Times / Entrepreneur, Aug 2024" />
  </AbsoluteFill>
);

const LogoSheet: React.FC<{b: Brand}> = ({b}) => {
  const sw = Array.from(new Set([b.bg, b.ink, b.accent, b.accent2, b.gain, b.loss]));
  return (
    <AbsoluteFill style={{padding: 140, justifyContent: 'center', gap: 70}}>
      <Mark b={b} size={2.1} />
      <div style={{fontFamily: b.bodyFont, fontSize: 40, color: b.muted}}>{b.tagline}</div>
      <div style={{display: 'flex', gap: 22}}>
        {sw.map((c) => (
          <div key={c} style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}>
            <div style={{width: 150, height: 110, background: c, borderRadius: b.radius, border: `2px solid ${b.rule}`}} />
            <div style={{fontFamily: b.numFont, fontSize: 22, color: b.muted}}>{c}</div>
          </div>
        ))}
      </div>
      <div style={{fontFamily: b.bodyFont, fontSize: 28, color: b.ink}}>
        <b>Headlines</b> in the display face · <b>Numbers</b> in{' '}
        <span style={{fontFamily: b.numFont, fontWeight: b.numWeight}}>$1,234,567</span> · <b>Body</b> in the text face
      </div>
    </AbsoluteFill>
  );
};

export const BrandFrame: React.FC<FrameProps> = ({brand, frame}) => {
  const b = BRANDS[brand];
  const body = {title: Title, reveal: Reveal, bars: Bars, quote: Quote, logo: LogoSheet}[frame];
  const Body = body;
  return (
    <AbsoluteFill style={{background: b.bg}}>
      <Texture b={b} />
      <Body b={b} />
      {frame !== 'logo' && <Bug b={b} />}
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC<{brand: string}> = ({brand}) => {
  const b = BRANDS[brand];
  return (
    <AbsoluteFill style={{background: b.bg}}>
      <Texture b={b} />
      {/* storefront with lights going out */}
      <div style={{position: 'absolute', left: 70, top: 150, width: 470, height: 440}}>
        <div style={{height: 70, background: b.key === 'terminal' ? b.panel : b.ink, borderRadius: `${b.radius}px ${b.radius}px 0 0`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: b.headFont, fontWeight: b.headWeight, fontSize: 44, color: b.key === 'terminal' ? b.ink : b.bg, letterSpacing: 4}}>
          SUBWAY
        </div>
        <div style={{display: 'flex', height: 26}}>
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} style={{flex: 1, background: i % 2 ? b.accent : b.panel}} />
          ))}
        </div>
        <div style={{height: 344, background: b.panel, border: `6px solid ${b.ink}`, borderTop: 'none', display: 'flex', gap: 18, padding: 26}}>
          <div style={{flex: 1, background: '#1a1a1a', opacity: 0.88}} />
          <div style={{flex: 1, background: '#1a1a1a', opacity: 0.88, position: 'relative'}}>
            <div style={{position: 'absolute', left: 14, right: 14, top: 110, height: 70, border: `4px solid ${b.loss}`, color: b.loss, fontFamily: b.numFont, fontWeight: b.numWeight, fontSize: 24, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-8deg)'}}>
              CLOSED
            </div>
          </div>
        </div>
      </div>
      {/* headline */}
      <div style={{position: 'absolute', left: 600, top: 120, right: 50}}>
        <H b={b} size={b.headCase === 'uppercase' ? 118 : 150} style={{lineHeight: 0.92}}>
          Closing.
        </H>
        <H b={b} size={b.headCase === 'uppercase' ? 118 : 150} color={b.gain} style={{lineHeight: 0.92}}>
          Richer.
        </H>
        <div style={{marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: b.gain, borderRadius: b.radius}}>
          <span style={{fontFamily: b.numFont, fontWeight: b.numWeight, fontSize: 58, color: b.key === 'terminal' ? b.bg : '#fff'}}>▲ $688M</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
