// YouTube thumbnails (1280x720) in Ink Misprint, built from the episode's real photos.
// Three variants per episode for YouTube's Test & Compare. Rules: one real image, at most four words,
// numbers big enough to read at phone size, logos only to identify the company.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {INK, dots, slab, type} from './kit';

const W = 1280;
const H = 720;

// A photo reprinted in two inks (blue + pink, off-register), or in natural colour.
const Photo: React.FC<{src: string; style: React.CSSProperties; ink?: boolean; pos?: string; zoom?: number}> = ({src, style, ink, pos = '50% 50%', zoom = 1}) => {
  const img = (extra: React.CSSProperties = {}) => (
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos,
      transform: `scale(${zoom})`, ...extra}} />
  );
  return (
    <div style={{position: 'absolute', overflow: 'hidden', background: INK.paper, ...style}}>
      {ink ? (
        <>
          <AbsoluteFill style={{isolation: 'isolate'}}>
            {img({filter: 'grayscale(1) contrast(1.35) brightness(1.08)'})}
            <AbsoluteFill style={{background: INK.blue, mixBlendMode: 'screen'}} />
          </AbsoluteFill>
          <AbsoluteFill style={{isolation: 'isolate', mixBlendMode: 'multiply', transform: 'translate(9px, -6px)', opacity: 0.8}}>
            {img({filter: 'grayscale(1) contrast(1.35) brightness(1.08)'})}
            <AbsoluteFill style={{background: INK.pink, mixBlendMode: 'screen'}} />
          </AbsoluteFill>
        </>
      ) : img({filter: 'saturate(1.2) contrast(1.08)'})}
      <AbsoluteFill style={{background: dots(INK.ink, 6, 1.2), mixBlendMode: 'multiply', opacity: 0.2}} />
    </div>
  );
};

const Reg: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={34} height={34} style={{position: 'absolute', left: x, top: y}}>
    <circle cx="17" cy="17" r="8" fill="none" stroke={INK.ink} strokeWidth="2" />
    <line x1="0" y1="17" x2="34" y2="17" stroke={INK.ink} strokeWidth="2" />
    <line x1="17" y1="0" x2="17" y2="34" stroke={INK.ink} strokeWidth="2" />
  </svg>
);

const Sheet: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = INK.paper}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    {children}
    <Reg x={14} y={14} /><Reg x={W - 48} y={14} /><Reg x={14} y={H - 48} /><Reg x={W - 48} y={H - 48} />
  </AbsoluteFill>
);

const Stamp: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{position: 'absolute', fontFamily: slab, color: INK.paper, background: INK.pink, outline: `6px solid ${INK.paper}`,
    padding: '8px 30px 0', lineHeight: 1.05, boxShadow: `14px 10px 0 ${INK.ink}`, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

const Num: React.FC<{children: React.ReactNode; size: number; style?: React.CSSProperties}> = ({children, size, style}) => (
  <div style={{position: 'relative', fontFamily: slab, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', ...style}}>
    <div style={{position: 'absolute', left: size * 0.06, top: size * 0.045, color: INK.pink}}>{children}</div>
    <div style={{position: 'relative', color: INK.ink}}>{children}</div>
  </div>
);

const Logo: React.FC<{src: string; style: React.CSSProperties}> = ({src, style}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', objectFit: 'contain', ...style}} />
);

// A: "CLOSED" stamp over a closed store · $688M PROFIT
const ClosedRicher: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.yellow}>
    <Photo src={`${a}/closed_miami23.jpg`} ink pos="45% 55%" style={{left: 0, top: 0, width: 700, height: H}} />
    <div style={{position: 'absolute', left: 690, top: 0, width: 26, height: H, background: INK.ink}} />
    <Stamp style={{left: 90, top: 270, fontSize: 112, transform: 'rotate(-8deg)'}}>CLOSED</Stamp>
    <div style={{position: 'absolute', left: 750, top: 120, width: 500}}>
      <Logo src={`${a}/logo_subway.png`} style={{position: 'relative', width: 340, height: 68, objectPosition: 'left center'}} />
      <Num size={120} style={{marginTop: 52}}>$688M</Num>
      <div style={{display: 'inline-block', marginTop: 26, background: INK.ink, color: INK.yellow, fontFamily: slab, fontSize: 72, padding: '6px 24px 0'}}>PROFIT ▲</div>
    </div>
  </Sheet>
);

// B: $15M → $688M over the closed store
const Jump: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.yellow}>
    <Photo src={`${a}/closed_miami22.jpg`} ink pos="45% 60%" style={{left: 0, top: 0, width: 620, height: H}} />
    <div style={{position: 'absolute', left: 610, top: 0, width: 26, height: H, background: INK.ink}} />
    <Logo src={`${a}/logo_subway.png`} style={{left: 50, top: 48, width: 320, height: 64, objectPosition: 'left center', filter: 'drop-shadow(0 0 10px white)'}} />
    <Stamp style={{left: 60, bottom: 90, fontSize: 60, transform: 'rotate(-6deg)'}}>2 CLOSED A DAY</Stamp>
    <div style={{position: 'absolute', left: 690, top: 110, width: 560}}>
      <div style={{fontFamily: slab, fontSize: 96, color: INK.ink, opacity: 0.8, position: 'relative', display: 'inline-block'}}>
        $15M
        <div style={{position: 'absolute', left: -10, right: -10, top: '46%', height: 14, background: INK.pink, transform: 'rotate(-6deg)'}} />
      </div>
      <Num size={132} style={{marginTop: 34}}>$688M</Num>
      <div style={{display: 'inline-block', marginTop: 26, background: INK.ink, color: INK.yellow, fontFamily: slab, fontSize: 60, padding: '6px 22px 0'}}>PROFIT ▲</div>
    </div>
  </Sheet>
);

// C: value per store, Subway vs Jersey Mike's
const PerStore: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.ink}>
    <Photo src={`${a}/store_chatt.jpg`} ink pos="50% 45%" style={{left: 0, top: 0, width: 636, height: H}} />
    <Photo src={`${a}/jm_valdosta.jpg`} pos="45% 50%" style={{left: 644, top: 0, width: 636, height: H}} />
    <Logo src={`${a}/logo_subway.png`} style={{left: 60, top: 50, width: 300, height: 60, objectPosition: 'left center', filter: 'drop-shadow(0 0 8px white)'}} />
    <Logo src={`${a}/logo_jm.png`} style={{right: 60, top: 36, width: 150, height: 110, objectPosition: 'right center'}} />
    {[{x: 40, v: '$260K', bg: INK.paper, c: INK.ink}, {x: 690, v: '$2.2M', bg: INK.yellow, c: INK.ink}].map((b) => (
      <div key={b.v} style={{position: 'absolute', left: b.x, bottom: 70, background: b.bg, padding: '10px 30px 0', boxShadow: `12px 9px 0 ${INK.pink}`}}>
        <div style={{fontFamily: slab, fontSize: 150, color: b.c, lineHeight: 1}}>{b.v}</div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center'}}>
      <span style={{fontFamily: type, fontWeight: 700, fontSize: 40, color: INK.ink, background: INK.paper, padding: '6px 18px'}}>VALUE PER STORE</span>
    </div>
  </Sheet>
);

export const Thumb: React.FC<{ep: string; v: 'a' | 'b' | 'c'}> = ({ep, v}) => {
  const a = `${ep}/assets`;
  return v === 'b' ? <Jump a={a} /> : v === 'c' ? <PerStore a={a} /> : <ClosedRicher a={a} />;
};
