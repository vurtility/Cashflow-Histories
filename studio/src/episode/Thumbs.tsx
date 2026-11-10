// YouTube thumbnails (1280x720) in Ink Misprint, built from the episode's real photos.
// Three variants per episode for YouTube's Test & Compare. Rules: one real image, at most four words,
// numbers big enough to read at phone size, logos only to identify the company.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {INK, dots, slab, type} from './kit';

const W = 1280;
const H = 720;

// A photo reprinted in two inks (blue + pink, off-register), or in natural colour.
const Photo: React.FC<{src: string; style: React.CSSProperties; ink?: boolean; pos?: string; zoom?: number; origin?: string}> = ({src, style, ink, pos = '50% 50%', zoom = 1, origin = '50% 50%'}) => {
  const img = (extra: React.CSSProperties = {}) => (
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos,
      transform: `scale(${zoom})`, transformOrigin: origin, ...extra}} />
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

// D: the slice. What Subway really sells is a cut of every sandwich.
const Slice: React.FC<{a: string}> = ({a}) => (
  <Sheet>
    <Photo src={`${a}/footlong.jpg`} pos="60% 70%" zoom={1.0} style={{inset: 0}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 34%, rgba(255,255,255,0) 52%)'}} />
    <div style={{position: 'absolute', left: 60, top: 46}}>
      <Num size={96}>IT'S NOT THE</Num>
      <Num size={96} style={{marginTop: 6}}>SANDWICH.</Num>
    </div>
    {/* the cut: a pink-outlined wedge over the front sandwich */}
    <div style={{position: 'absolute', left: SL.x, top: SL.y, width: SL.w, height: SL.h, border: `8px dashed ${INK.pink}`,
      background: 'rgba(255,61,168,0.18)', transform: 'rotate(-14deg)'}} />
    <div style={{position: 'absolute', left: 560, top: 596, background: INK.pink, color: INK.paper, fontFamily: slab, whiteSpace: 'nowrap',
      fontSize: 62, padding: '6px 22px 0', boxShadow: `10px 8px 0 ${INK.ink}`, transform: 'rotate(-3deg)'}}>12.5% → SUBWAY</div>
    <Logo src={`${a}/logo_subway.png`} style={{right: 50, top: 50, width: 260, height: 52, objectPosition: 'right center'}} />
  </Sheet>
);
const SL = {x: 930, y: 330, w: 190, h: 230};

// E: the thesis line, over a closed store.
const NotDying: React.FC<{a: string}> = ({a}) => (
  <Sheet>
    <Photo src={`${a}/closed_miami22.jpg`} ink pos="50% 60%" style={{inset: 0}} />
    <Logo src={`${a}/logo_subway.png`} style={{left: 60, top: 54, width: 300, height: 60, objectPosition: 'left center', filter: 'drop-shadow(0 0 10px white)'}} />
    <div style={{position: 'absolute', left: 50, top: 180, background: INK.paper, padding: '18px 34px 6px', boxShadow: `14px 10px 0 ${INK.pink}`}}>
      <Num size={112}>SUBWAY ISN'T</Num>
      <Num size={112} style={{marginTop: 4}}>DYING.</Num>
    </div>
    <Stamp style={{left: 430, top: 500, fontSize: 52, transform: 'rotate(-5deg)'}}>ITS RESTAURANTS ARE.</Stamp>
  </Sheet>
);

// F: two seventeen-year-olds, two opposite strategies.
const Both17: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.ink}>
    <Photo src={`${a}/fred_deluca.jpg`} pos="50% 0%" zoom={1.9} origin="44% 2%" style={{left: 0, top: 0, width: 636, height: H}} />
    <Photo src={`${a}/cancro_still_2024.png`} pos="50% 30%" style={{left: 644, top: 0, width: 636, height: H}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: INK.yellow, padding: '10px 34px 0', boxShadow: `12px 9px 0 ${INK.pink}`}}>
        <span style={{fontFamily: slab, fontSize: 104, color: INK.ink}}>BOTH 17</span>
      </span>
    </div>
    {[{x: 0, t: 'MORE STORES', logo: 'logo_subway.png', lw: 200, lh: 40}, {x: 644, t: 'BETTER STORES', logo: 'logo_jm.png', lw: 90, lh: 66}].map((c) => (
      <div key={c.t} style={{position: 'absolute', left: c.x, width: 636, bottom: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{background: INK.paper, padding: '8px 14px', display: 'flex'}}>
          <Img src={staticFile(`${a}/${c.logo}`)} style={{width: c.lw, height: c.lh, objectFit: 'contain'}} />
        </div>
        <div style={{background: INK.ink, color: INK.paper, fontFamily: slab, fontSize: 52, padding: '6px 20px 0', whiteSpace: 'nowrap'}}>{c.t}</div>
      </div>
    ))}
  </Sheet>
);

// G: stores down, profit up. Two lines crossing in an X.
const Cross: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.paper}>
    <AbsoluteFill style={{background: dots(INK.blue, 14, 1.6), opacity: 0.25}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <line x1={150} y1={170} x2={1130} y2={590} stroke={INK.blue} strokeWidth={34} strokeLinecap="round" />
      <line x1={150} y1={590} x2={1130} y2={150} stroke={INK.pink} strokeWidth={34} strokeLinecap="round" style={{mixBlendMode: 'multiply'}} />
      <polygon points="1130,150 1060,150 1112,205" fill={INK.pink} />
    </svg>
    <div style={{position: 'absolute', left: 120, top: 70, background: INK.blue, color: INK.paper, fontFamily: slab, fontSize: 56, padding: '6px 20px 0'}}>STORES ▼</div>
    <div style={{position: 'absolute', right: 110, top: 64, background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 56, padding: '6px 20px 0'}}>PROFIT ▲</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: INK.yellow, padding: '14px 44px 0', boxShadow: `14px 10px 0 ${INK.ink}`}}>
        <span style={{fontFamily: slab, fontSize: 150, color: INK.ink}}>HOW?</span>
      </span>
    </div>
    <Logo src={`${a}/logo_subway.png`} style={{left: 70, bottom: 50, width: 300, height: 60, objectPosition: 'left center'}} />
    <div style={{position: 'absolute', right: 80, bottom: 58, fontFamily: type, fontWeight: 700, fontSize: 34, color: INK.ink}}>2023 → 2025</div>
  </Sheet>
);

// Lessons from competitors' best thumbnails (research/thumbnail-study.md): the brand is the hero (big logo
// or storefront), 2-4 words that pose a verdict or question, one dominant subject, a simple decline symbol.

const FallArrow: React.FC<{style?: React.CSSProperties; w?: number; h?: number}> = ({style, w = 620, h = 300}) => (
  <svg width={w} height={h} viewBox="0 0 620 300" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <polyline points="10,30 170,120 250,80 420,210 560,250" fill="none" stroke={INK.ink} strokeWidth={44} strokeLinejoin="miter" transform="translate(10,10)" />
    <polyline points="10,30 170,120 250,80 420,210 560,250" fill="none" stroke="#E8173A" strokeWidth={34} strokeLinejoin="miter" />
    <polygon points="610,268 520,290 548,200" fill="#E8173A" stroke={INK.ink} strokeWidth={6} />
  </svg>
);

// H: who pays for the closures?
const WhoPays: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.ink}>
    <Photo src={`${a}/store_foggy.jpg`} pos="50% 30%" zoom={1.45} origin="50% 30%" style={{inset: 0}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(22,33,62,0) 45%, rgba(22,33,62,0.6) 100%)'}} />
    <FallArrow style={{left: 640, top: 330}} w={560} h={270} />
    <div style={{position: 'absolute', left: 46, bottom: 52, background: INK.yellow, padding: '14px 34px 2px', boxShadow: `14px 10px 0 ${INK.pink}`}}>
      <span style={{fontFamily: slab, fontSize: 132, color: INK.ink, whiteSpace: 'nowrap'}}>WHO PAYS?</span>
    </div>
  </Sheet>
);

// I: hero footlong with the 12.5% slice lifted out.
const CUT = {x: 960, y: 352, w: 92, h: 250, lift: 120};
const RealProduct: React.FC<{a: string}> = ({a}) => {
  const img = <Img src={staticFile(`${a}/footlong.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 70%', filter: 'saturate(1.25) contrast(1.08)'}} />;
  return (
    <Sheet>
      <AbsoluteFill>{img}</AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0) 46%)'}} />
      {/* the gap the slice leaves */}
      <div style={{position: 'absolute', left: CUT.x, top: CUT.y, width: CUT.w, height: CUT.h, background: INK.ink, opacity: 0.85, border: `6px dashed ${INK.pink}`}} />
      {/* the slice, lifted */}
      <AbsoluteFill style={{transform: `translate(30px, ${-CUT.lift}px) rotate(-4deg)`, transformOrigin: `${CUT.x + CUT.w / 2}px ${CUT.y + CUT.h / 2}px`,
        filter: `drop-shadow(14px 18px 0 ${INK.ink})`}}>
        <AbsoluteFill style={{clipPath: `inset(${CUT.y}px ${1280 - CUT.x - CUT.w}px ${720 - CUT.y - CUT.h}px ${CUT.x}px)`}}>{img}</AbsoluteFill>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: CUT.x - 170, top: CUT.y - CUT.lift - 150, background: INK.pink, padding: '8px 22px 0', boxShadow: `10px 8px 0 ${INK.ink}`, transform: 'rotate(-4deg)'}}>
        <span style={{fontFamily: slab, fontSize: 96, color: INK.paper, whiteSpace: 'nowrap'}}>12.5%</span>
      </div>
      <div style={{position: 'absolute', left: 56, top: 44}}>
        <Img src={staticFile(`${a}/logo_subway.png`)} style={{width: 420, height: 84, objectFit: 'contain', objectPosition: 'left center', display: 'block'}} />
        <Num size={86} style={{marginTop: 22}}>THE REAL</Num>
        <Num size={86} style={{marginTop: 4}}>PRODUCT</Num>
      </div>
    </Sheet>
  );
};

// J: after Modern MBA's "Why Hotels Don't Fear Airbnb" (3.5M): stacked word boxes beside the evidence.
const WhyFine: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.yellow}>
    <Photo src={`${a}/closed_miami23.jpg`} pos="50% 55%" style={{left: 600, top: 0, width: 680, height: H}} />
    <div style={{position: 'absolute', left: 586, top: 0, width: 20, height: H, background: INK.ink}} />
    <Stamp style={{left: 760, top: 300, fontSize: 92, transform: 'rotate(-8deg)'}}>CLOSED</Stamp>
    <div style={{position: 'absolute', left: 50, top: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12}}>
      {['WHY', 'SUBWAY', 'IS FINE'].map((w) => (
        <div key={w} style={{background: INK.ink, color: INK.paper, fontFamily: slab, fontSize: 96, lineHeight: 1, padding: '14px 24px 4px', whiteSpace: 'nowrap'}}>{w}</div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 50, bottom: 56, background: INK.paper, padding: '14px 22px', boxShadow: `10px 8px 0 ${INK.pink}`}}>
      <Img src={staticFile(`${a}/logo_subway.png`)} style={{width: 400, height: 80, objectFit: 'contain', display: 'block'}} />
    </div>
  </Sheet>
);

// ---- Episode 2 (airlines): Spirit vs Delta ----
// P: the title question on the dead airline's plane.
const WhySpiritDied: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.yellow}>
    <Photo src={`${a}/spirit_a320neo.jpg`} pos="45% 50%" zoom={1.25} style={{left: 560, top: 0, width: 720, height: H}} />
    <div style={{position: 'absolute', left: 546, top: 0, width: 20, height: H, background: INK.ink}} />
    <Stamp style={{left: 700, top: 300, fontSize: 96, transform: 'rotate(-8deg)'}}>CLOSED</Stamp>
    <div style={{position: 'absolute', left: 46, top: 56, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12}}>
      {['WHY', 'SPIRIT', 'DIED'].map((w) => (
        <div key={w} style={{background: INK.ink, color: INK.paper, fontFamily: slab, fontSize: 104, lineHeight: 1, padding: '14px 24px 4px', whiteSpace: 'nowrap'}}>{w}</div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 46, bottom: 50, background: INK.paper, padding: '14px 22px', boxShadow: `10px 8px 0 ${INK.pink}`}}>
      <Img src={staticFile(`${a}/logo_spirit.png`)} style={{width: 330, height: 92, objectFit: 'contain', display: 'block'}} />
    </div>
  </Sheet>
);

// Q: the hidden business: a card pays more than the flying makes.
const FromACard: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.ink}>
    <Photo src={`${a}/delta_atl.jpg`} pos="50% 50%" zoom={1.9} origin="38% 58%" style={{inset: 0}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(22,33,62,0.0) 35%, rgba(22,33,62,0.75) 100%)'}} />
    <div style={{position: 'absolute', left: 46, top: 46, background: INK.paper, padding: '12px 20px', boxShadow: `10px 8px 0 ${INK.pink}`}}>
      <Img src={staticFile(`${a}/logo_delta.jpg`)} style={{width: 300, height: 70, objectFit: 'contain', display: 'block'}} />
    </div>
    <div style={{position: 'absolute', right: 50, top: 150, textAlign: 'right'}}>
      <div style={{display: 'inline-block', background: INK.yellow, padding: '10px 30px 0', boxShadow: `12px 9px 0 ${INK.pink}`}}>
        <span style={{fontFamily: slab, fontSize: 170, color: INK.ink, whiteSpace: 'nowrap'}}>$8.2B</span>
      </div>
      <div style={{marginTop: 26}}>
        <span style={{display: 'inline-block', background: INK.ink, color: INK.paper, fontFamily: slab, fontSize: 76, padding: '8px 22px 0', whiteSpace: 'nowrap'}}>FROM A CARD</span>
      </div>
      <div style={{marginTop: 26, display: 'inline-block', background: INK.paper, padding: '12px 20px'}}>
        <Img src={staticFile(`${a}/logo_amex.png`)} style={{width: 220, height: 80, objectFit: 'contain', display: 'block'}} />
      </div>
    </div>
  </Sheet>
);

// R: the twin/foil, in one picture.
const OneDied: React.FC<{a: string}> = ({a}) => (
  <Sheet bg={INK.ink}>
    <Photo src={`${a}/spirit_a320neo.jpg`} ink pos="40% 50%" zoom={1.5} origin="40% 45%" style={{left: 0, top: 0, width: 636, height: H}} />
    <Photo src={`${a}/delta_atl.jpg`} pos="50% 50%" zoom={2.1} origin="45% 58%" style={{left: 644, top: 0, width: 636, height: H}} />
    {[{x: 40, t: 'DIED', logo: 'logo_spirit.png', bg: INK.paper}, {x: 684, t: 'THRIVED', logo: 'logo_delta.jpg', bg: INK.yellow}].map((c) => (
      <div key={c.t} style={{position: 'absolute', left: c.x, bottom: 56}}>
        <div style={{background: INK.paper, padding: '10px 16px', display: 'inline-block', marginBottom: 14}}>
          <Img src={staticFile(`${a}/${c.logo}`)} style={{width: 220, height: 60, objectFit: 'contain', display: 'block'}} />
        </div>
        <div style={{background: c.bg, padding: '10px 28px 0', boxShadow: `12px 9px 0 ${INK.pink}`}}>
          <span style={{fontFamily: slab, fontSize: 92, color: INK.ink, whiteSpace: 'nowrap'}}>{c.t}</span>
        </div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 120, padding: '12px 40px 0', boxShadow: `12px 9px 0 ${INK.ink}`}}>WHY?</span>
    </div>
  </Sheet>
);

export const Thumb: React.FC<{ep: string; v: string}> = ({ep, v}) => {
  const a = `${ep}/assets`;
  const V: Record<string, React.FC<{a: string}>> = {a: ClosedRicher, b: Jump, c: PerStore, d: Slice, e: NotDying, f: Both17, g: Cross, h: WhoPays, i: RealProduct, j: WhyFine, p: WhySpiritDied, q: FromACard, r: OneDied};
  const C = V[v] ?? ClosedRicher;
  return <C a={a} />;
};
