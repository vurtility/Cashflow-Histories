// Concept 3: INK MISPRINT: history, reprinted.
// Signature: two fluorescent inks (pink + blue) overprinted slightly out of register,
// halftone dots for every image and bar, registration marks, wood-type slab headlines,
// typewriter captions, and a print number per episode.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadUltra} from '@remotion/google-fonts/Ultra';
import {loadFont as loadCourier} from '@remotion/google-fonts/CourierPrime';
import {EP} from './shared';

const slab = loadUltra('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
const type = loadCourier('normal', {weights: ['400', '700'], subsets: ['latin']}).fontFamily;

export const INK = {
  paper: '#FFFFFF',
  pink: '#FF3DA8', // fluorescent pink
  blue: '#1D5FD6', // medium blue
  yellow: '#FFE21A',
  ink: '#16213E',
};

// Two-ink overprint: blue layer + pink layer offset, multiplied.
export const Over: React.FC<{children: React.ReactNode; dx?: number; dy?: number; style?: React.CSSProperties}> = ({children, dx = 7, dy = 5, style}) => (
  <div style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', ...style}}>
    <div style={{color: INK.blue, mixBlendMode: 'multiply'}}>{children}</div>
    <div style={{position: 'absolute', left: dx, top: -dy, color: INK.pink, mixBlendMode: 'multiply'}}>{children}</div>
  </div>
);

const dots = (color: string, size = 12, r = 3.2) =>
  `radial-gradient(circle, ${color} ${r}px, transparent ${r + 0.6}px) 0 0 / ${size}px ${size}px`;

const Halftone: React.FC<{w: number; h: number; color: string; style?: React.CSSProperties}> = ({w, h, color, style}) => (
  <div style={{width: w, height: h, background: dots(color), mixBlendMode: 'multiply', ...style}} />
);

const Grain: React.FC = () => (
  <AbsoluteFill style={{opacity: 0.22, mixBlendMode: 'multiply', pointerEvents: 'none'}}>
    <svg width="100%" height="100%">
      <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" /><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.2  0 0 0 0.5 0" /></filter>
      <rect width="100%" height="100%" filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

const Reg: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={46} height={46} style={{position: 'absolute', left: x, top: y}}>
    <circle cx="23" cy="23" r="11" fill="none" stroke={INK.ink} strokeWidth="2" />
    <line x1="0" y1="23" x2="46" y2="23" stroke={INK.ink} strokeWidth="2" />
    <line x1="23" y1="0" x2="23" y2="46" stroke={INK.ink} strokeWidth="2" />
  </svg>
);

const Sheet: React.FC<{children: React.ReactNode; w?: number; h?: number; edition?: boolean}> = ({children, w = 1920, h = 1080, edition = true}) => (
  <AbsoluteFill style={{background: INK.paper}}>
    {children}
    <Reg x={24} y={24} /><Reg x={w - 70} y={24} /><Reg x={24} y={h - 70} /><Reg x={w - 70} y={h - 70} />
    {edition && (
      <div style={{position: 'absolute', right: 100, top: 34, fontFamily: type, fontWeight: 700, fontSize: 24, color: INK.ink, letterSpacing: 2}}>
        PRINT Nº 001 · {EP.company}
      </div>
    )}
    <Grain />
  </AbsoluteFill>
);

export const Wordmark: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 30 * scale}}>
    <div style={{width: 130 * scale, height: 130 * scale, position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: INK.yellow, mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: 10 * scale, top: -6 * scale, width: 130 * scale, height: 130 * scale, borderRadius: '50%', background: dots(INK.pink, 10 * scale, 3 * scale)}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: slab, fontSize: 56 * scale, color: INK.ink}}>CH</div>
    </div>
    <div style={{fontFamily: slab, fontSize: 82 * scale, lineHeight: 0.95}}>
      <Over dx={6 * scale} dy={4 * scale}>CASHFLOW</Over>
      <br />
      <Over dx={6 * scale} dy={4 * scale}>HISTORIES</Over>
    </div>
  </div>
);

const Caption: React.FC<{t: string}> = ({t}) => (
  <div style={{position: 'absolute', left: 90, bottom: 90, fontFamily: type, fontSize: 26, color: INK.ink}}>
    [source: {t}]
  </div>
);
const Bug: React.FC = () => <div style={{position: 'absolute', right: 100, bottom: 80}}><Wordmark scale={0.32} /></div>;

export const MisprintFrame: React.FC<{frame: string}> = ({frame}) => {
  if (frame === 'logo') {
    return (
      <Sheet edition={false}>
        <AbsoluteFill style={{padding: 150, justifyContent: 'center', gap: 60}}>
          <Wordmark scale={1.5} />
          <div style={{display: 'flex', gap: 18}}>
            {[INK.pink, INK.blue, INK.yellow, INK.ink].map((c) => (
              <div key={c} style={{width: 140, height: 90, background: c, mixBlendMode: 'multiply'}} />
            ))}
            <div style={{width: 140, height: 90, background: dots(INK.blue)}} />
          </div>
          <div style={{fontFamily: type, fontSize: 34, color: INK.ink}}>Two inks, slightly off-register · every image halftoned · a print number per episode</div>
        </AbsoluteFill>
      </Sheet>
    );
  }
  if (frame === 'title') {
    return (
      <Sheet>
        <div style={{position: 'absolute', left: 140, top: 250, width: 700, height: 600, background: INK.yellow, mixBlendMode: 'multiply', transform: 'rotate(-3deg)'}} />
        <Halftone w={900} h={500} color={INK.pink} style={{position: 'absolute', right: 120, top: 120}} />
        <AbsoluteFill style={{padding: '0 160px', justifyContent: 'center'}}>
          <div style={{fontFamily: type, fontWeight: 700, fontSize: 40, color: INK.ink, marginBottom: 20}}>Chapter 5 —</div>
          <div style={{fontFamily: slab, fontSize: 140, lineHeight: 0.95}}>
            <Over dx={9} dy={6}>HERE’S THE</Over><br /><Over dx={9} dy={6}>REAL ISSUE</Over>
          </div>
        </AbsoluteFill>
        <Bug />
      </Sheet>
    );
  }
  if (frame === 'reveal') {
    return (
      <Sheet>
        <AbsoluteFill style={{padding: '0 150px', flexDirection: 'row', alignItems: 'center', gap: 100}}>
          <div style={{flex: 1}}>
            <div style={{fontFamily: type, fontWeight: 700, fontSize: 40, color: INK.ink}}>Subway net income, 2025</div>
            <div style={{fontFamily: slab, fontSize: 250, lineHeight: 1}}><Over dx={12} dy={8}>$688M</Over></div>
            <div style={{fontFamily: type, fontSize: 40, color: INK.ink}}>
              up from <span style={{background: INK.yellow, padding: '0 8px'}}>$15M</span> two years earlier
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, height: 560}}>
            {EP.years.map((x, i) => (
              <div key={x.y} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                <div style={{fontFamily: slab, fontSize: 40, color: INK.ink}}>${x.v}M</div>
                <div style={{position: 'relative', width: 120, height: Math.max(12, (x.v / 688) * 420)}}>
                  <div style={{position: 'absolute', inset: 0, background: i === 2 ? INK.pink : INK.blue, mixBlendMode: 'multiply', opacity: i === 2 ? 1 : 0.85}} />
                  <div style={{position: 'absolute', inset: 0, left: 8, top: -6, background: dots(i === 2 ? INK.blue : INK.pink), mixBlendMode: 'multiply'}} />
                </div>
                <div style={{fontFamily: type, fontWeight: 700, fontSize: 30, color: INK.ink}}>{x.y}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
        <Caption t={EP.sources.reveal} />
        <Bug />
      </Sheet>
    );
  }
  if (frame === 'bars') {
    return (
      <Sheet>
        <AbsoluteFill style={{padding: '160px 150px', justifyContent: 'center'}}>
          <div style={{fontFamily: slab, fontSize: 80, marginBottom: 60}}><Over dx={6} dy={4}>SALES PER STORE</Over></div>
          {EP.bars.map((r) => (
            <div key={r.n} style={{display: 'flex', alignItems: 'center', marginBottom: 44}}>
              <div style={{width: 340, fontFamily: type, fontWeight: 700, fontSize: 42, color: INK.ink}}>{r.n}</div>
              <div style={{position: 'relative', width: (r.v / 4.09) * 1000, height: 90}}>
                <div style={{position: 'absolute', inset: 0, background: r.hero ? INK.pink : INK.blue, mixBlendMode: 'multiply'}} />
                <div style={{position: 'absolute', inset: 0, left: 8, top: 6, background: dots(r.hero ? INK.blue : INK.yellow), mixBlendMode: 'multiply'}} />
              </div>
              <div style={{marginLeft: 26, fontFamily: slab, fontSize: 64}}><Over dx={5} dy={3}>{r.label}</Over></div>
            </div>
          ))}
        </AbsoluteFill>
        <Caption t={EP.sources.bars} />
        <Bug />
      </Sheet>
    );
  }
  return (
    <Sheet>
      <div style={{position: 'absolute', left: 120, top: 200, width: 1680, height: 640, background: INK.pink, mixBlendMode: 'multiply', transform: 'rotate(-1.5deg)'}} />
      <AbsoluteFill style={{padding: '0 220px', justifyContent: 'center'}}>
        <div style={{fontFamily: type, fontWeight: 700, fontSize: 64, color: INK.paper, lineHeight: 1.25}}>
          “…decisions that provide the greatest benefit to the entire Subway system.”
        </div>
        <div style={{marginTop: 36, fontFamily: type, fontSize: 36, color: INK.yellow}}>— {EP.quoteBy}</div>
      </AbsoluteFill>
      <Caption t={EP.sources.quote} />
      <Bug />
    </Sheet>
  );
};

export const MisprintThumb: React.FC = () => (
  <Sheet w={1280} h={720}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 620, height: 720, background: INK.yellow, mixBlendMode: 'multiply'}} />
    {/* halftone storefront */}
    <div style={{position: 'absolute', left: 70, top: 170, width: 430}}>
      <div style={{height: 70, background: INK.blue, mixBlendMode: 'multiply', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: slab, fontSize: 44, color: INK.paper}}>SUBWAY</div>
      <div style={{height: 300, position: 'relative', border: `6px solid ${INK.ink}`, borderTop: 'none'}}>
        <div style={{position: 'absolute', inset: 18, background: dots(INK.ink, 9, 3.6)}} />
        <div style={{position: 'absolute', left: 70, top: 110, transform: 'rotate(-9deg)', background: INK.pink, padding: '6px 22px', fontFamily: slab, fontSize: 42, color: INK.paper}}>CLOSED</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 640, top: 110, right: 30}}>
      <div style={{fontFamily: slab, fontSize: 92, lineHeight: 0.98}}>
        <Over dx={9} dy={6}>CLOSING.</Over><br /><Over dx={9} dy={6}>RICHER.</Over>
      </div>
      <div style={{marginTop: 20, display: 'inline-block', background: INK.pink, padding: '6px 22px', fontFamily: slab, fontSize: 86, color: INK.paper}}>$688M</div>
    </div>
  </Sheet>
);
