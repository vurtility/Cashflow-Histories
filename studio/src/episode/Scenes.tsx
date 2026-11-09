// Every scene type an edit plan can call (the "k" in edit.json). Each gets its props plus `dur` (frames).
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Asset, AssetImg, Bug, Caption, FootageFrame, INK, InkBar, Over, Plate, Sheet, Wordmark, dots, fmt, marker, slab, type, usePop, useT} from './kit';
import usdots from './data/usdots.json';

type P = Record<string, any> & {dur: number; print: string};
// Ultra is wide (~0.78em per character): shrink a headline until it fits `max` pixels.
const fit = (text: string, size: number, max: number) => Math.min(size, max / (Math.max(1, text.length) * 0.78));
const H: React.FC<{children: React.ReactNode; size?: number; dx?: number; max?: number}> = ({children, size = 80, dx = 6, max = 1600}) => {
  const s = typeof children === 'string' ? fit(children, size, max) : size;
  const d = dx * (s / size);
  return <div style={{fontFamily: slab, fontSize: s, lineHeight: 1}}><Over dx={d} dy={d * 0.66}>{children}</Over></div>;
};
const T: React.FC<{children: React.ReactNode; size?: number; bold?: boolean; color?: string; style?: React.CSSProperties}> = ({children, size = 36, bold, color = INK.ink, style}) => (
  <div style={{fontFamily: type, fontWeight: bold ? 700 : 400, fontSize: size, color, ...style}}>{children}</div>
);

// ---------- footage ----------
const Photo: React.FC<P> = ({a, treat, kb, label, dur, print, focus}) => (
  <FootageFrame label={label} credit={a?.credit} print={print}>
    <Plate treat={treat} kb={kb} dur={dur} focus={focus}>{(st) => <AssetImg a={a} style={st} />}</Plate>
  </FootageFrame>
);

const Video: React.FC<P> = ({a, from, label, vol = 0.08, treat, print, dur}) => (
  <FootageFrame label={label} credit={a?.credit} print={print}>
    <Plate treat={treat} kb="none" dur={dur}>
      {(st) => <OffthreadVideo src={staticFile(a.src)} startFrom={Math.round(from * 30)} volume={vol} style={{...st, transform: 'scale(1.02)'}} />}
    </Plate>
  </FootageFrame>
);

const Logo: React.FC<P> = ({a, sub, print}) => {
  const p = usePop(2);
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 0, top: 300, width: 1920, height: 480, background: INK.yellow, mixBlendMode: 'multiply', transform: 'rotate(-2deg)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50}}>
        <AssetImg a={a} style={{maxWidth: 1100, maxHeight: 360, transform: `scale(${0.85 + 0.15 * p})`, opacity: p}} />
        {sub && <T size={40} bold>{sub}</T>}
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

// ---------- type ----------
const Text: React.FC<P> = ({text, sub, big, print}) => {
  const p = usePop(0);
  const s = useT(10, 22);
  const size = big ? 150 : text.length > 16 ? 104 : 140;
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 100, top: 360, width: 1720, height: 360, background: INK.yellow, mixBlendMode: 'multiply', transform: `rotate(-1.5deg) scaleX(${p})`, transformOrigin: 'left'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 120px'}}>
        <div style={{transform: `scale(${0.9 + 0.1 * p})`}}><H size={size} dx={10}>{text}</H></div>
        {sub && <T size={46} bold style={{opacity: s}}>{sub}</T>}
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Place: React.FC<P> = ({place, year, print}) => {
  const a = useT(0, 14);
  const b = useT(10, 26);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{background: dots(INK.blue, 14, 3.6), opacity: 0.35}} />
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 160px', gap: 24}}>
        <T size={44} bold style={{opacity: a}}>DATELINE —</T>
        <div style={{transform: `translateY(${(1 - a) * 30}px)`, opacity: a}}><H size={120} dx={9}>{place.toUpperCase()}</H></div>
        <div style={{opacity: b}}><span style={{background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 90, padding: '4px 30px'}}>{year}</span></div>
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Person: React.FC<P> = ({name, role, print}) => {
  const p = usePop(0);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80}}>
        <div style={{width: 380, height: 380, borderRadius: '50%', background: dots(INK.blue, 12, 4), border: `8px solid ${INK.ink}`, position: 'relative', transform: `scale(${p})`}}>
          <div style={{position: 'absolute', left: 16, top: -10, width: 380, height: 380, borderRadius: '50%', background: dots(INK.pink, 12, 3), mixBlendMode: 'multiply'}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: slab, fontSize: 130, color: INK.ink}}>
            {name.split(' ').map((w: string) => w[0]).join('')}
          </div>
        </div>
        <div style={{opacity: p}}>
          <H size={110} dx={8} max={1100}>{name.toUpperCase()}</H>
          <T size={44} bold style={{marginTop: 24, background: INK.yellow, display: 'inline-block', padding: '4px 16px'}}>{role}</T>
        </div>
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Sign: React.FC<P> = ({text, year, print}) => {
  const p = usePop(0);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{border: `12px solid ${INK.ink}`, background: INK.yellow, padding: '50px 80px', transform: `rotate(-2deg) scale(${0.9 + 0.1 * p})`, boxShadow: `18px 18px 0 ${INK.pink}`}}>
          <H size={100} dx={7} max={1500}>{text}</H>
        </div>
        <T size={40} bold style={{marginTop: 60}}>The first shop · {year}</T>
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const HandSign: React.FC<P> = ({text, sub, print}) => {
  const p = usePop(0);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: '#FFFDF2', border: `3px solid ${INK.ink}`, width: 1100, height: 640, transform: `rotate(2deg) translateY(${(1 - p) * 60}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `14px 14px 0 ${INK.blue}`}}>
          <div style={{fontFamily: marker, fontSize: 170, color: INK.pink}}>{text}</div>
          <div style={{fontFamily: marker, fontSize: 110, color: INK.blue}}>{sub}</div>
        </div>
      </AbsoluteFill>
      <Caption t="illustration of the 2004 weekend promotion" />
      <Bug />
    </Sheet>
  );
};

const List: React.FC<P> = ({items, print}) => {
  const f = useCurrentFrame();
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 180px', gap: 36}}>
        {items.map((it: string, i: number) => {
          const o = interpolate(f, [i * 14, i * 14 + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <div key={i} style={{opacity: o, transform: `translateX(${(1 - o) * -50}px)`}}><H size={92} dx={7} max={1560}>{it}</H></div>;
        })}
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Teens: React.FC<P> = ({print}) => {
  const a = usePop(0);
  const b = usePop(16);
  const card = (p: number, year: string, money: string, color: string) => (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
      <svg width="260" height="300" viewBox="0 0 260 300">
        <circle cx="130" cy="80" r="62" fill={color} style={{mixBlendMode: 'multiply'}} />
        <path d="M20 300 C20 180 240 180 240 300 Z" fill={color} style={{mixBlendMode: 'multiply'}} />
      </svg>
      <T size={40} bold>AGE 17</T>
      <H size={90} dx={6}>{year}</H>
      <div style={{background: INK.yellow, fontFamily: slab, fontSize: 80, padding: '0 24px'}}>{money}</div>
    </div>
  );
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: '0 200px'}}>
        {card(a, '1965', '$1,000', INK.blue)}
        <div style={{fontFamily: slab, fontSize: 80, color: INK.ink}}>vs</div>
        {card(b, '1975', '$125,000', INK.pink)}
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

// ---------- data ----------
const Counter: React.FC<P> = ({from, to, label, sub, prefix = '', suffix = '', decimals = 0, dur, print}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [4, Math.max(8, dur * 0.55)], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2)});
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 10}}>
        <T size={44} bold>{label}</T>
        <H size={decimals ? 300 : 380} dx={14}>{prefix}{fmt(v, decimals)}{suffix}</H>
        {sub && <T size={36} style={{background: INK.yellow, padding: '2px 16px'}}>{sub}</T>}
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Stat: React.FC<P> = ({kicker, value, sub, tone, print}) => {
  const p = usePop(2);
  const s = useT(12, 24);
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, top: 220, width: 900, height: 640, background: tone === 'blue' ? INK.blue : INK.pink, mixBlendMode: 'multiply', opacity: 0.16, transform: 'rotate(-3deg)'}} />
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 180px', gap: 16}}>
        <T size={48} bold>{kicker}</T>
        <div style={{transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: 'left center'}}><H size={value.length > 6 ? 230 : 300} dx={13}>{value}</H></div>
        <T size={44} style={{opacity: s}}>{sub}</T>
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Cols: React.FC<P> = ({title, rows, src, dur, print}) => {
  const f = useCurrentFrame();
  const max = Math.max(...rows.map((r: any) => r.v));
  const step = Math.min(30, (dur * 0.6) / rows.length);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{padding: '120px 160px 140px', flexDirection: 'column'}}>
        <H size={76}>{title.toUpperCase()}</H>
        <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 120}}>
          {rows.map((r: any, i: number) => {
            const g = interpolate(f, [i * step, i * step + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
            return (
              <div key={r.n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
                <div style={{opacity: g, fontFamily: slab, fontSize: 64}}><Over dx={4} dy={3}>{r.label}</Over></div>
                <InkBar w={190} h={Math.max(14, (r.v / max) * 520 * g)} hero={r.hero} />
                <T size={40} bold>{r.n}</T>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Caption t={src} />
      <Bug />
    </Sheet>
  );
};

const Bars: React.FC<P> = ({title, rows, src, dur, print}) => {
  const f = useCurrentFrame();
  const max = Math.max(...rows.map((r: any) => r.v));
  const step = Math.min(40, (dur * 0.6) / rows.length);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{padding: '150px 160px', justifyContent: 'center'}}>
        <div style={{marginBottom: 70}}><H size={76}>{title.toUpperCase()}</H></div>
        {rows.map((r: any, i: number) => {
          const g = interpolate(f, [i * step, i * step + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
          return (
            <div key={r.n} style={{display: 'flex', alignItems: 'center', marginBottom: 46, opacity: Math.min(1, g * 3)}}>
              <T size={44} bold style={{width: 380}}>{r.n}</T>
              <InkBar w={Math.max(10, (r.v / max) * 980 * g)} h={100} hero={r.hero} />
              <div style={{marginLeft: 28, fontFamily: slab, fontSize: 66, opacity: g}}><Over dx={5} dy={3}>{r.label}</Over></div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption t={src} />
      <Bug />
    </Sheet>
  );
};

const Line: React.FC<P> = ({title, pts, labels, src, turn, note, dur, print}) => {
  const f = useCurrentFrame();
  const W = 1500, Hh = 560, x0 = 210, y0 = 260;
  const xs = pts.map((p: number[]) => p[0]), ys = pts.map((p: number[]) => p[1]);
  const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
  const ymax = Math.max(...ys) * 1.08;
  const P = pts.map((p: number[]) => [x0 + ((p[0] - xmin) / (xmax - xmin || 1)) * W, y0 + Hh - (p[1] / ymax) * Hh]);
  const prog = interpolate(f, [4, Math.max(10, dur * 0.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const segN = P.length - 1;
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, top: 110}}><H size={72}>{title.toUpperCase()}</H></div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={x0} y1={y0 + Hh} x2={x0 + W} y2={y0 + Hh} stroke={INK.ink} strokeWidth={3} />
        {P.slice(0, -1).map((p: number[], i: number) => {
          const q = P[i + 1];
          const local = Math.max(0, Math.min(1, prog * segN - i));
          const ex = p[0] + (q[0] - p[0]) * local, ey = p[1] + (q[1] - p[1]) * local;
          const down = turn !== undefined && i >= turn;
          return local > 0 ? (
            <g key={i}>
              <line x1={p[0]} y1={p[1]} x2={ex} y2={ey} stroke={down ? INK.pink : INK.blue} strokeWidth={16} strokeLinecap="round" style={{mixBlendMode: 'multiply'}} />
              <line x1={p[0] + 6} y1={p[1] - 4} x2={ex + 6} y2={ey - 4} stroke={down ? INK.blue : INK.pink} strokeWidth={6} strokeLinecap="round" opacity={0.6} style={{mixBlendMode: 'multiply'}} />
            </g>
          ) : null;
        })}
        {P.map((p: number[], i: number) => {
          const shown = prog * segN >= i - 0.02;
          return shown ? (
            <g key={'p' + i}>
              <circle cx={p[0]} cy={p[1]} r={16} fill={INK.yellow} stroke={INK.ink} strokeWidth={5} />
              <text x={p[0]} y={y0 + Hh + 56} textAnchor="middle" fontFamily={type} fontWeight={700} fontSize={36} fill={INK.ink}>{pts[i][0]}</text>
              <text x={Math.min(Math.max(p[0], 330), 1600)} y={p[1] - 40} textAnchor="middle" fontFamily={slab} fontSize={52} fill={INK.ink}>{labels?.[i]}</text>
            </g>
          ) : null;
        })}
      </svg>
      {note && prog > 0.95 && <div style={{position: 'absolute', right: 200, top: 400, background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 64, padding: '6px 26px', transform: 'rotate(-4deg)'}}>{note}</div>}
      <Caption t={src} />
      <Bug />
    </Sheet>
  );
};

const MapDots: React.FC<P> = ({mode, count, lost = 0, label, src, dur, print}) => {
  const f = useCurrentFrame();
  const all = (usdots as any).pts as number[][];
  const W = 1500, Hh = W / (usdots as any).aspect, x0 = 210, y0 = 150;
  const n = Math.round(Math.min(all.length, (count / 27000) * all.length));
  const grow = mode === 'fill' ? interpolate(f, [0, Math.max(10, dur * 0.7)], [0.15, 1], {extrapolateRight: 'clamp'}) : 1;
  const shown = Math.round(n * grow);
  const lostN = mode === 'blink' ? Math.round(n * Math.max(lost / count, 0.12)) : 0;
  return (
    <Sheet print={print}>
      <Img src={staticFile('subway/assets/us_map.png')} style={{position: 'absolute', left: x0, top: y0, width: W, opacity: 0.35}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {all.slice(0, shown).map((p, i) => {
          const isLost = i < lostN;
          const t0 = (i / Math.max(1, lostN)) * dur * 0.6;
          const o = isLost ? interpolate(f, [t0, t0 + 8], [1, 0.08], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
          return <circle key={i} cx={x0 + p[0] * W} cy={y0 + p[1] * Hh} r={6} fill={isLost ? INK.pink : INK.blue} opacity={o} style={{mixBlendMode: 'multiply'}} />;
        })}
        {mode === 'agents' && [0.18, 0.36, 0.54, 0.72].map((x) => <line key={x} x1={x0 + x * W} y1={y0} x2={x0 + x * W} y2={y0 + Hh * 0.75} stroke={INK.ink} strokeWidth={4} strokeDasharray="14 10" />)}
        {mode === 'agents' && [[0.1, 0.3], [0.27, 0.5], [0.45, 0.25], [0.63, 0.55], [0.82, 0.35]].map(([x, y], i) => {
          const p = interpolate(f, [8 + i * 8, 16 + i * 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <g key={i} opacity={p}>
              <rect x={x0 + x * W - 80} y={y0 + y * Hh - 30} width={160} height={60} fill={INK.yellow} stroke={INK.ink} strokeWidth={4} />
              <text x={x0 + x * W} y={y0 + y * Hh + 12} textAnchor="middle" fontFamily={type} fontWeight={700} fontSize={30} fill={INK.ink}>AGENT</text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 160, bottom: 110, background: INK.paper, padding: '6px 20px', border: `4px solid ${INK.ink}`}}>
        <T size={44} bold>{label}</T>
      </div>
      <Caption t={src} />
      <Bug />
    </Sheet>
  );
};

const Flow: React.FC<P> = ({dur, print}) => {
  const f = useCurrentFrame();
  const at = (i: number) => interpolate(f, [i * dur * 0.16, i * dur * 0.16 + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const box = (i: number, children: React.ReactNode, bg: string, x: number, w: number) => (
    <div style={{position: 'absolute', left: x, top: 330, width: w, height: 360, opacity: at(i), transform: `translateY(${(1 - at(i)) * 30}px)`,
      background: bg, border: `6px solid ${INK.ink}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 36, gap: 12}}>{children}</div>
  );
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, top: 120}}><H size={72}>THE SUBWAY DEAL</H></div>
      {box(0, <><T size={34} bold>THE FRANCHISEE PAYS</T>{['Build-out', 'Rent', 'Staff', 'Food'].map((x) => <T key={x} size={40}>· {x}</T>)}</>, INK.paper, 160, 480)}
      {box(1, <><T size={34} bold>SALES COME IN</T><H size={120}>$$$</H></>, INK.yellow, 760, 400)}
      {box(2, <><T size={34} bold color={INK.paper}>OFF THE TOP, TO SUBWAY</T><div style={{fontFamily: slab, fontSize: 120, color: INK.paper}}>12.5%</div><T size={30} color={INK.paper}>8% royalty + 4.5% advertising</T></>, INK.pink, 1280, 480)}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M650 510 L750 510" stroke={INK.ink} strokeWidth={8} opacity={at(1)} markerEnd="url(#ah)" />
        <path d="M1170 510 L1270 510" stroke={INK.ink} strokeWidth={8} opacity={at(2)} markerEnd="url(#ah)" />
        <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={INK.ink} /></marker></defs>
      </svg>
      <Caption t="Subway franchise disclosure document: royalty 8%, advertising fund 4.5% of gross sales" />
      <Bug />
    </Sheet>
  );
};

const Example: React.FC<P> = ({stage, print}) => {
  const p = usePop(0);
  const store = (x: number, name: string, sales: string, color: string, o = 1) => (
    <div style={{position: 'absolute', left: x, top: 330, width: 420, opacity: o}}>
      <div style={{height: 70, background: color, mixBlendMode: 'multiply', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: slab, fontSize: 44, color: INK.paper}}>{name}</div>
      <div style={{height: 260, border: `6px solid ${INK.ink}`, borderTop: 'none', background: dots(INK.ink, 12, 2), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: INK.paper, padding: '6px 18px', fontFamily: slab, fontSize: 72}}>{sales}</div>
      </div>
      <T size={30} bold style={{marginTop: 12, textAlign: 'center'}}>annual sales</T>
    </div>
  );
  const cut = stage === 0 ? null : stage === 1 ? '$75K' : stage === 2 ? '$112.5K' : '$75K → $112.5K';
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, top: 110}}><H size={64}>ONE TOWN. {stage >= 2 ? 'TWO SUBWAYS.' : 'ONE SUBWAY.'}</H></div>
      <div style={{position: 'absolute', right: 160, top: 120, background: INK.yellow, padding: '4px 14px'}}><T size={28} bold>SIMPLIFIED EXAMPLE</T></div>
      {store(160, 'STORE A', stage >= 2 ? '$450K' : '$600K', INK.blue)}
      {stage >= 2 && store(640, 'STORE B', '$450K', INK.blue, stage === 2 ? p : 1)}
      {stage >= 2 && <T size={36} bold style={{position: 'absolute', left: 300, top: 760, opacity: stage === 2 ? p : 1}}>Together: $900K</T>}
      {cut && (
        <div style={{position: 'absolute', right: 160, top: 330, width: 560, height: 420, background: INK.pink, padding: 40, transform: `scale(${stage === 1 || stage === 3 ? 0.9 + 0.1 * p : 1})`}}>
          <T size={34} bold color={INK.paper}>SUBWAY'S 12.5%</T>
          <div style={{fontFamily: slab, fontSize: stage === 3 ? 76 : 120, color: INK.paper, marginTop: 20}}>{cut}</div>
          {stage === 3 && <T size={34} bold color={INK.yellow} style={{marginTop: 30}}>Each owner: $600K → $450K</T>}
        </div>
      )}
      <Caption t="illustrative numbers, not a real town" />
      <Bug />
    </Sheet>
  );
};

const Slice: React.FC<P> = ({dur, print}) => {
  const f = useCurrentFrame();
  const peel = interpolate(f, [dur * 0.15, dur * 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rest = interpolate(f, [dur * 0.45, dur * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, top: 110}}><H size={72}>THE AVERAGE SUBWAY</H></div>
      <div style={{position: 'absolute', left: 160, top: 300, display: 'flex', alignItems: 'center'}}>
        <div style={{transform: `translate(${peel * -30}px, ${peel * -120}px) rotate(${peel * -8}deg)`}}><InkBar w={200} h={150} hero /></div>
        <InkBar w={1400} h={150} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 470, opacity: peel, transform: `translateY(${(1 - peel) * 20}px)`}}>
        <span style={{background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 64, padding: '4px 18px'}}>12.5% → $62,500</span>
      </div>
      <T size={44} bold style={{position: 'absolute', left: 1020, top: 245}}>$500K in sales</T>
      <div style={{position: 'absolute', left: 520, top: 620, display: 'flex', gap: 30, opacity: rest}}>
        {['Food', 'Wages', 'Rent', 'Utilities', '…then profit?'].map((x) => (
          <div key={x} style={{border: `4px solid ${INK.ink}`, padding: '10px 20px', fontFamily: type, fontWeight: 700, fontSize: 36}}>{x}</div>
        ))}
      </div>
      <Caption t="Subway: Circana estimate of average US sales; fees per franchise disclosure document" />
      <Bug />
    </Sheet>
  );
};

const Price: React.FC<P> = ({dur, print}) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [0, dur * 0.8], [0.2, 1], {extrapolateRight: 'clamp'});
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 900, bottom: 200, display: 'flex', gap: 60, alignItems: 'flex-end'}}>
        {['Food cost', 'Wages', 'Rent'].map((x, i) => (
          <div key={x} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
            <InkBar w={170} h={120 + 520 * g * (0.8 + i * 0.1)} />
            <T size={36} bold>{x} ↑</T>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 170, top: 330, transform: 'rotate(-6deg)', background: INK.yellow, border: `10px solid ${INK.ink}`, padding: '30px 60px'}}>
        <div style={{fontFamily: slab, fontSize: 260}}><Over dx={10} dy={6}>$5</Over></div>
        <T size={40} bold>FOOTLONG · STILL</T>
      </div>
      <Caption t="illustrative: costs rose while the expected price stayed at $5" />
      <Bug />
    </Sheet>
  );
};

const Pps: React.FC<P> = ({dur, print}) => {
  const a = useT(0, 14);
  const b = useT(dur * 0.45, dur * 0.45 + 14);
  const row = (o: number, logo: string, calc: string, res: string, hero: boolean) => (
    <div style={{opacity: o, transform: `translateX(${(1 - o) * -40}px)`, display: 'flex', alignItems: 'center', gap: 40, marginBottom: 70}}>
      <div style={{width: 360, fontFamily: slab, fontSize: 60}}>{logo}</div>
      <T size={48} bold style={{width: 700}}>{calc}</T>
      <div style={{background: hero ? INK.pink : INK.blue, color: INK.paper, fontFamily: slab, fontSize: 84, padding: '4px 26px'}}>{res}</div>
    </div>
  );
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 160px'}}>
        <div style={{marginBottom: 80}}><H size={76}>VALUE PER RESTAURANT</H></div>
        {row(a, 'SUBWAY', '$9.55B ÷ ~37,000 stores', '≈ $260K', false)}
        {row(b, "JERSEY MIKE'S", '$7.3B ÷ ~3,400 stores', '≈ $2.2M', true)}
      </AbsoluteFill>
      <Caption t="different years and deal types; approximate" />
      <Bug />
    </Sheet>
  );
};

const Diverge: React.FC<P> = ({dur, print}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [4, dur * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x1 = 260, x2 = 260 + 1300 * p;
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, top: 110}}><H size={72}>OPPOSITE DIRECTIONS</H></div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={x1} y1={560} x2={x2} y2={560 - 330 * p} stroke={INK.pink} strokeWidth={20} strokeLinecap="round" />
        <line x1={x1} y1={600} x2={x2} y2={600 + 280 * p} stroke={INK.blue} strokeWidth={20} strokeLinecap="round" />
      </svg>
      <T size={46} bold style={{position: 'absolute', left: x2 - 420, top: 170 + 330 * (1 - p), opacity: p}}>Corporate profit</T>
      <T size={46} bold style={{position: 'absolute', left: x2 - 420, top: 920 - 50 * (1 - p), opacity: p}}>Franchisees' livelihoods</T>
      <Caption t="illustrative" />
      <Bug />
    </Sheet>
  );
};

// ---------- documents & quotes ----------
const Quote: React.FC<P> = ({text, by, src, style, print}) => {
  const p = usePop(0);
  const hl = useT(14, 34);
  if (style === 'clip') {
    return (
      <Sheet print={print}>
        <AbsoluteFill style={{background: dots(INK.blue, 16, 3), opacity: 0.25}} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 1300, background: '#F7F3E8', padding: '60px 80px', transform: `rotate(-1.5deg) translateY(${(1 - p) * 50}px)`,
            boxShadow: `16px 16px 0 ${INK.ink}`, clipPath: 'polygon(0 3%, 6% 0, 20% 2%, 40% 0, 62% 3%, 80% 0, 100% 2%, 99% 97%, 85% 100%, 60% 98%, 35% 100%, 12% 97%, 0 100%)'}}>
            <div style={{fontFamily: 'Georgia, serif', fontSize: 70, lineHeight: 1.25, color: INK.ink}}>
              <span style={{background: `linear-gradient(${INK.yellow}, ${INK.yellow}) 0 85% / ${hl * 100}% 45% no-repeat`}}>“{text}”</span>
            </div>
            <T size={36} bold style={{marginTop: 30}}>— {by}</T>
          </div>
        </AbsoluteFill>
        <Caption t={src} />
        <Bug />
      </Sheet>
    );
  }
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 120, top: 210, width: 1680, height: 640, background: INK.pink, mixBlendMode: 'multiply', transform: `rotate(-1.5deg) scaleY(${p})`}} />
      <AbsoluteFill style={{padding: '0 220px', justifyContent: 'center'}}>
        <T size={64} bold color={INK.paper} style={{lineHeight: 1.25, opacity: p}}>“{text}”</T>
        <T size={36} color={INK.yellow} style={{marginTop: 36}}>— {by}</T>
      </AbsoluteFill>
      <Caption t={src} />
      <Bug />
    </Sheet>
  );
};

const Doc: React.FC<P> = ({title, sub, lines = [], hi, cover, print}) => {
  const p = usePop(0);
  const hl = useT(16, 34);
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{background: INK.blue, opacity: 0.12}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: cover ? 900 : 1400, minHeight: cover ? 860 : 0, background: INK.paper, border: `3px solid ${INK.ink}`, boxShadow: `14px 14px 0 ${INK.pink}`,
          padding: '60px 80px', transform: `translateY(${(1 - p) * 80}px) rotate(${cover ? -2 : 0.5}deg)`}}>
          <T size={cover ? 30 : 26} bold style={{letterSpacing: 3}}>{sub?.toUpperCase()}</T>
          <div style={{fontFamily: 'Georgia, serif', fontSize: cover ? 84 : 56, fontWeight: 700, color: INK.ink, margin: '24px 0 36px', lineHeight: 1.1}}>{title}</div>
          {lines.map((l: string, i: number) => (
            <div key={i} style={{fontFamily: 'Georgia, serif', fontSize: 44, color: INK.ink, lineHeight: 1.6,
              background: i === hi ? `linear-gradient(${INK.pink}, ${INK.pink}) 0 80% / ${hl * 100}% 50% no-repeat` : 'none'}}>{l}</div>
          ))}
          {cover && <div style={{marginTop: 80, height: 300, background: dots(INK.ink, 10, 1.6), opacity: 0.25}} />}
        </div>
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Clips: React.FC<P> = ({items, instant = 0, dur, print}) => {
  const f = useCurrentFrame();
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{background: dots(INK.pink, 16, 3), opacity: 0.2}} />
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 220px', gap: 40}}>
        {items.map((it: any, i: number) => {
          const t0 = i < instant ? -20 : (i - instant) * dur * 0.3;
          const o = interpolate(f, [t0, t0 + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: o, transform: `rotate(${i % 2 ? 1 : -1}deg) translateX(${(1 - o) * 60}px)`, background: INK.paper,
              border: `4px solid ${INK.ink}`, boxShadow: `10px 10px 0 ${INK.blue}`, padding: '26px 40px', display: 'flex', gap: 30, alignItems: 'center'}}>
              <span style={{background: INK.yellow, fontFamily: type, fontWeight: 700, fontSize: 34, padding: '2px 12px'}}>{it.date}</span>
              <span style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 52, color: INK.ink}}>{it.text}</span>
            </div>
          );
        })}
      </AbsoluteFill>
      <Bug />
    </Sheet>
  );
};

const Timeline: React.FC<P> = ({items, dur, print}) => {
  const f = useCurrentFrame();
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 160, right: 160, top: 530, height: 10, background: INK.ink}} />
      {items.map((it: any, i: number) => {
        const x = 160 + (i / (items.length - 1)) * 1480;
        const left = Math.min(x - 60, 1920 - 160 - 520);
        const t0 = (i * dur * 0.6) / items.length;
        const o = interpolate(f, [t0, t0 + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left, top: i % 2 ? 580 : 230, width: 520, opacity: o, textAlign: left < x - 60 ? 'right' : 'left'}}>
            <div style={{fontFamily: slab, fontSize: 60}}><Over dx={5} dy={3}>{it.date}</Over></div>
            <T size={38} bold style={{marginTop: 10}}>{it.text}</T>
          </div>
        );
      })}
      {items.map((_: any, i: number) => (
        <div key={'d' + i} style={{position: 'absolute', left: 160 + (i / (items.length - 1)) * 1480 - 22, top: 512, width: 44, height: 44, borderRadius: '50%', background: INK.pink, border: `5px solid ${INK.ink}`}} />
      ))}
      <Caption t="Stuart Frankel interviews; Subway" />
      <Bug />
    </Sheet>
  );
};

const Stamps: React.FC<P> = ({items, dur, print}) => {
  const f = useCurrentFrame();
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
        {items.map((it: any, i: number) => {
          const t0 = i * dur * 0.35;
          const s = interpolate(f, [t0, t0 + 6], [1.8, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const o = interpolate(f, [t0, t0 + 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{opacity: o, transform: `scale(${s}) rotate(${i ? 5 : -6}deg)`, border: `10px solid ${INK.pink}`, padding: '30px 50px', textAlign: 'center', color: INK.pink}}>
              <div style={{fontFamily: slab, fontSize: 80}}>BANKRUPT</div>
              <div style={{fontFamily: type, fontWeight: 700, fontSize: 46, color: INK.ink, marginTop: 14}}>{it.name}</div>
              <div style={{fontFamily: type, fontSize: 40, color: INK.ink}}>{it.stores} Subway stores · {it.year}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption t="US bankruptcy court filings" />
      <Bug />
    </Sheet>
  );
};

const Deal: React.FC<P> = ({a, date, text, value, stamp, dur, print}) => {
  const p = usePop(0);
  const st = interpolate(useCurrentFrame(), [dur * 0.55, dur * 0.55 + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Sheet print={print}>
      <AbsoluteFill style={{justifyContent: 'center', padding: '0 180px', gap: 30}}>
        <div style={{opacity: p}}><AssetImg a={a} style={{height: 120}} /></div>
        <T size={44} bold>{date}</T>
        <H size={84} max={1560}>{text.toUpperCase()}</H>
        <div style={{fontFamily: slab, fontSize: 170}}><Over dx={10} dy={6}>{value}</Over></div>
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 200, top: 300, border: `10px solid ${INK.pink}`, color: INK.pink, fontFamily: slab, fontSize: 72, padding: '14px 36px',
        transform: `rotate(-10deg) scale(${2 - st})`, opacity: st}}>{stamp}</div>
      <Caption t="Roark Capital / Subway announcements, 2023–24" />
      <Bug />
    </Sheet>
  );
};

const Vs: React.FC<P> = ({left_a, right_a, left, right, logos, print}) => {
  const a = usePop(0);
  const b = usePop(8);
  const half = (asset: Asset, label: string, p: number, side: 'l' | 'r') => (
    <div style={{position: 'absolute', top: 80, bottom: 96, left: side === 'l' ? 80 : 970, width: 870, overflow: 'hidden', opacity: p}}>
      {logos ? (
        <div style={{position: 'absolute', inset: 0, background: side === 'l' ? INK.blue : INK.pink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: INK.paper, padding: 40}}><AssetImg a={asset} style={{maxWidth: 560, maxHeight: 300}} /></div>
        </div>
      ) : (
        <AssetImg a={asset} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      )}
      <div style={{position: 'absolute', left: 30, bottom: 40, background: INK.yellow, padding: '6px 22px', fontFamily: slab, fontSize: 56, color: INK.ink}}>{label}</div>
    </div>
  );
  return (
    <Sheet print={print}>
      {half(left_a, left, a, 'l')}
      {half(right_a, right, b, 'r')}
      <Caption t={logos ? undefined : `${left_a.credit} · ${right_a.credit}`} />
    </Sheet>
  );
};

const End: React.FC<P> = ({print}) => {
  const p = usePop(0);
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 1080, background: INK.yellow, mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: 90, top: 400, transform: `scale(${0.9 + 0.1 * p})`, transformOrigin: 'left'}}><Wordmark scale={0.8} /></div>
      <AbsoluteFill style={{left: 900, width: 860, justifyContent: 'center', gap: 40}}>
        <T size={44} bold>The economics nobody explains, one company at a time.</T>
        <div style={{background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 80, padding: '10px 36px', alignSelf: 'flex-start'}}>SUBSCRIBE</div>
        <div style={{width: 700, height: 394, border: `6px solid ${INK.ink}`, background: dots(INK.blue, 12, 3), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <T size={36} bold style={{background: INK.paper, padding: '4px 14px'}}>NEXT EPISODE</T>
        </div>
      </AbsoluteFill>
    </Sheet>
  );
};

const Sot: React.FC<P> = ({text, print}) => (
  <Sheet print={print} bg={INK.ink}>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 200}}>
      <T size={40} bold color={INK.yellow}>REAL-VOICE CLIP GOES HERE</T>
      <T size={34} color={INK.paper} style={{marginTop: 30, textAlign: 'center'}}>{text}</T>
    </AbsoluteFill>
  </Sheet>
);

export const SCENES: Record<string, React.FC<P>> = {
  photo: Photo, video: Video, logo: Logo, text: Text, place: Place, person: Person, sign: Sign, handsign: HandSign,
  list: List, teens: Teens, counter: Counter, stat: Stat, cols: Cols, bars: Bars, line: Line, map: MapDots, flow: Flow,
  example: Example, slice: Slice, price: Price, pps: Pps, diverge: Diverge, quote: Quote, doc: Doc, clips: Clips,
  timeline: Timeline, stamps: Stamps, deal: Deal, vs: Vs, end: End, sot: Sot,
};
