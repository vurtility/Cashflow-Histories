// Concept 2: PRICE TAG: the economics of the places you pay, in retail signage.
// Signature: day-glo starbursts for every key number, WAS/NOW price cards for comparisons,
// shelf-edge strips with barcodes, swing-tag logo, receipt-printer type for sources.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadBowlby} from '@remotion/google-fonts/BowlbyOne';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {loadFont as loadVT} from '@remotion/google-fonts/VT323';
import {loadFont as loadDarker} from '@remotion/google-fonts/DarkerGrotesque';
import {EP, rng} from './shared';

const bowlby = loadBowlby('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
const marker = loadMarker('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
const receipt = loadVT('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
const darker = loadDarker('normal', {weights: ['700', '900'], subsets: ['latin']}).fontFamily;

export const TAG = {
  orange: '#FF5A00',
  acid: '#C6FF00',
  pink: '#FF1F8E',
  yellow: '#FFE100',
  ink: '#111111',
  white: '#FFFFFF',
  red: '#E8141B',
};

const burstPath = (cx: number, cy: number, R: number, r: number, n: number, seed = 3) => {
  const rand = rng(seed);
  let p = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = (i % 2 ? r : R) * (0.94 + rand() * 0.1);
    p += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad).toFixed(1) + ' ' + (cy + Math.sin(a) * rad).toFixed(1);
  }
  return p + 'Z';
};

export const Burst: React.FC<{size: number; color?: string; children: React.ReactNode; rotate?: number}> = ({size, color = TAG.acid, children, rotate = -8}) => (
  <div style={{width: size, height: size, position: 'relative', transform: `rotate(${rotate}deg)`}}>
    <svg width={size} height={size} style={{position: 'absolute', inset: 0}}>
      <path d={burstPath(size / 2, size / 2, size / 2, size * 0.39, 20)} fill={color} stroke={TAG.ink} strokeWidth={size * 0.012} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      {children}
    </div>
  </div>
);

const Barcode: React.FC<{w: number; h: number; seed?: number}> = ({w, h, seed = 7}) => {
  const rand = rng(seed);
  const bars: {x: number; w: number}[] = [];
  let x = 0;
  while (x < w) {
    const bw = 1 + Math.floor(rand() * 4);
    if (rand() > 0.45) bars.push({x, w: bw});
    x += bw + 1;
  }
  return (
    <svg width={w} height={h}>
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={h} fill={TAG.ink} />)}
    </svg>
  );
};

// Swing-tag logo.
export const SwingTag: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24 * scale}}>
    <svg width={120 * scale} height={160 * scale} viewBox="0 0 120 160" style={{transform: 'rotate(-12deg)'}}>
      <path d="M60 2 C 30 -10, 10 20, 40 30" fill="none" stroke={TAG.ink} strokeWidth="3" />
      <path d="M30 22 L90 22 L112 46 L112 156 L8 156 L8 46 Z" fill={TAG.acid} stroke={TAG.ink} strokeWidth="5" />
      <circle cx="60" cy="40" r="7" fill={TAG.white} stroke={TAG.ink} strokeWidth="4" />
      <text x="60" y="118" textAnchor="middle" fontFamily={bowlby} fontSize="48" fill={TAG.ink}>CH</text>
    </svg>
    <div style={{lineHeight: 0.9}}>
      <div style={{fontFamily: bowlby, fontSize: 70 * scale, color: TAG.ink}}>CASHFLOW</div>
      <div style={{display: 'inline-block', marginTop: 8 * scale, padding: `${4 * scale}px ${16 * scale}px`, background: TAG.pink, fontFamily: bowlby, fontSize: 52 * scale, color: TAG.white}}>
        HISTORIES
      </div>
    </div>
  </div>
);

const Receipt: React.FC<{children: React.ReactNode; w: number}> = ({children, w}) => (
  <div style={{width: w, position: 'relative', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.25))'}}>
    <div style={{background: TAG.white, padding: '40px 46px 30px', fontFamily: receipt, fontSize: 46, color: TAG.ink, lineHeight: 1.05}}>{children}</div>
    <svg width={w} height={22} style={{display: 'block'}}>
      <path d={`M0 0 ${Array.from({length: Math.ceil(w / 22)}).map((_, i) => `L${i * 22 + 11} 20 L${i * 22 + 22} 0`).join(' ')} Z`} fill={TAG.white} />
    </svg>
  </div>
);

const ShelfStrip: React.FC<{label: string; price: string; w: number; hero?: boolean}> = ({label, price, w, hero}) => (
  <div style={{display: 'flex', alignItems: 'stretch', height: 104, marginBottom: 30}}>
    <div style={{width: 330, background: TAG.ink, color: TAG.white, fontFamily: darker, fontWeight: 900, fontSize: 44, display: 'flex', alignItems: 'center', paddingLeft: 26}}>
      {label.toUpperCase()}
    </div>
    <div style={{width: w, background: hero ? TAG.pink : TAG.yellow, border: `4px solid ${TAG.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px'}}>
      <Barcode w={Math.min(120, Math.max(40, w - 40))} h={56} seed={label.length * 13} />
    </div>
    <div style={{marginLeft: 22, display: 'flex', alignItems: 'center', fontFamily: bowlby, fontSize: 72, color: hero ? TAG.pink : TAG.ink}}>{price}</div>
  </div>
);

const Src: React.FC<{t: string; light?: boolean}> = ({t, light}) => (
  <div style={{position: 'absolute', left: 70, bottom: 50, fontFamily: receipt, fontSize: 34, color: light ? TAG.white : TAG.ink}}>
    SRC: {t.toUpperCase()}
  </div>
);
const Bug: React.FC = () => (
  <div style={{position: 'absolute', right: 60, bottom: 36}}><SwingTag scale={0.42} /></div>
);

export const PriceTagFrame: React.FC<{frame: string}> = ({frame}) => {
  if (frame === 'logo') {
    return (
      <AbsoluteFill style={{background: TAG.white, padding: 140, justifyContent: 'center', gap: 60}}>
        <SwingTag scale={1.6} />
        <div style={{display: 'flex', gap: 18}}>
          {[TAG.orange, TAG.acid, TAG.pink, TAG.yellow, TAG.ink].map((c) => (
            <div key={c} style={{width: 130, height: 90, background: c, border: `4px solid ${TAG.ink}`}} />
          ))}
        </div>
        <div style={{fontFamily: receipt, fontSize: 44, color: TAG.ink}}>STARBURST = KEY NUMBER · WAS/NOW = COMPARISON · RECEIPT = SOURCE</div>
      </AbsoluteFill>
    );
  }
  if (frame === 'title') {
    return (
      <AbsoluteFill style={{background: TAG.orange}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 300, background: TAG.yellow, borderTop: `8px solid ${TAG.ink}`, borderBottom: `8px solid ${TAG.ink}`, display: 'flex', alignItems: 'center', padding: '0 120px', gap: 60}}>
          <div style={{fontFamily: bowlby, fontSize: 120, color: TAG.ink}}>05</div>
          <div style={{fontFamily: marker, fontSize: 130, color: TAG.ink, lineHeight: 1}}>Here’s the real issue</div>
        </div>
        <div style={{position: 'absolute', right: 120, top: 640}}><Barcode w={260} h={70} /></div>
        <Bug />
      </AbsoluteFill>
    );
  }
  if (frame === 'reveal') {
    return (
      <AbsoluteFill style={{background: TAG.white}}>
        <div style={{position: 'absolute', left: 150, top: 230}}>
          <div style={{fontFamily: darker, fontWeight: 900, fontSize: 50, color: TAG.ink}}>SUBWAY NET INCOME</div>
          <div style={{fontFamily: marker, fontSize: 100, color: TAG.red, marginTop: 30, position: 'relative', display: 'inline-block'}}>
            WAS $15M
            <div style={{position: 'absolute', left: -10, right: -10, top: '58%', height: 6, background: TAG.ink, transform: 'rotate(-4deg)'}} />
          </div>
          <div style={{fontFamily: marker, fontSize: 64, color: TAG.ink, marginTop: 30}}>(2023)</div>
          <div style={{marginTop: 40, display: 'inline-block', background: TAG.pink, color: TAG.white, fontFamily: darker, fontWeight: 900, fontSize: 40, padding: '8px 20px'}}>
            FRANCHISE REVENUE −6%
          </div>
        </div>
        <div style={{position: 'absolute', right: 120, top: 120}}>
          <Burst size={760}>
            <div style={{fontFamily: bowlby, fontSize: 70, color: TAG.ink}}>NOW</div>
            <div style={{fontFamily: bowlby, fontSize: 150, color: TAG.ink, lineHeight: 0.95}}>$688M</div>
            <div style={{fontFamily: marker, fontSize: 52, color: TAG.ink}}>in 2025!</div>
          </Burst>
        </div>
        <Src t={EP.sources.reveal} />
        <Bug />
      </AbsoluteFill>
    );
  }
  if (frame === 'bars') {
    return (
      <AbsoluteFill style={{background: TAG.white, padding: '150px 120px', justifyContent: 'center'}}>
        <div style={{fontFamily: bowlby, fontSize: 70, color: TAG.ink, marginBottom: 50}}>SALES PER STORE</div>
        {EP.bars.map((r) => (
          <ShelfStrip key={r.n} label={r.n} price={r.label} w={(r.v / 4.09) * 1000} hero={r.hero} />
        ))}
        <div style={{position: 'absolute', right: 200, top: 650}}>
          <Burst size={300} color={TAG.acid} rotate={10}>
            <div style={{fontFamily: bowlby, fontSize: 70, color: TAG.ink, lineHeight: 0.9}}>8×</div>
            <div style={{fontFamily: marker, fontSize: 34, color: TAG.ink}}>less!</div>
          </Burst>
        </div>
        <Src t={EP.sources.bars} />
        <Bug />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: TAG.orange, alignItems: 'center', justifyContent: 'center'}}>
      <Receipt w={1100}>
        <div style={{textAlign: 'center'}}>*** SUBWAY HQ ***</div>
        <div style={{textAlign: 'center', marginBottom: 24}}>STATEMENT · AUG 2024</div>
        <div style={{fontSize: 60}}>"…DECISIONS THAT PROVIDE THE GREATEST BENEFIT TO THE ENTIRE SUBWAY SYSTEM."</div>
        <div style={{marginTop: 24, borderTop: `4px dashed ${TAG.ink}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between'}}>
          <span>$6.99 FOOTLONG</span><span>OPT-OUT? Y</span>
        </div>
      </Receipt>
      <Src t={EP.sources.quote} light />
      <Bug />
    </AbsoluteFill>
  );
};

export const PriceTagThumb: React.FC = () => (
  <AbsoluteFill style={{background: TAG.orange}}>
    {/* flat storefront */}
    <div style={{position: 'absolute', left: 50, top: 170, width: 440}}>
      <div style={{background: TAG.ink, color: TAG.white, fontFamily: bowlby, fontSize: 46, textAlign: 'center', padding: '10px 0'}}>SUBWAY</div>
      <div style={{height: 300, background: TAG.white, border: `6px solid ${TAG.ink}`, borderTop: 'none', display: 'flex', gap: 16, padding: 20, position: 'relative'}}>
        <div style={{flex: 1, background: '#2a2a2a'}} />
        <div style={{flex: 1, background: '#2a2a2a'}} />
        <div style={{position: 'absolute', left: 60, top: 110, transform: 'rotate(-10deg)', background: TAG.white, border: `5px dashed ${TAG.pink}`, padding: '8px 22px', fontFamily: bowlby, fontSize: 44, color: TAG.pink}}>
          CLOSED
        </div>
      </div>
    </div>
    <div style={{position: 'absolute', right: 30, top: 30}}>
      <Burst size={560}>
        <div style={{fontFamily: bowlby, fontSize: 56, color: TAG.ink}}>PROFIT</div>
        <div style={{fontFamily: bowlby, fontSize: 112, color: TAG.ink, lineHeight: 0.95}}>$688M</div>
      </Burst>
    </div>
    <div style={{position: 'absolute', left: 560, bottom: 50, fontFamily: marker, fontSize: 74, color: TAG.white, transform: 'rotate(-4deg)'}}>
      2 closing a day?!
    </div>
    <div style={{position: 'absolute', left: 36, top: 30}}><SwingTag scale={0.5} /></div>
  </AbsoluteFill>
);
