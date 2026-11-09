// Concept 1: BANKNOTE: every episode is freshly printed money.
// Signature: guilloche rosettes + engraved line bands, a serial number per episode,
// a per-episode "denomination" colour, inline-engraved numerals.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadMarcellus} from '@remotion/google-fonts/MarcellusSC';
import {loadFont as loadInline} from '@remotion/google-fonts/BigShouldersInline';
import {loadFont as loadShoulders} from '@remotion/google-fonts/BigShoulders';
import {EP} from './shared';

const engraved = loadMarcellus('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
const inline = loadInline('normal', {weights: ['800', '900'], subsets: ['latin']}).fontFamily;
const shoulders = loadShoulders('normal', {weights: ['600', '800', '900'], subsets: ['latin']}).fontFamily;

// Per-episode denomination palette (Subway = magenta note).
export const NOTE = {
  base: '#B0105F', // magenta
  base2: '#E2362B', // vermilion gradient end
  line: '#FFB3D9', // engraving lines
  ink: '#FFF7FB',
  lime: '#C8FF1A',
  violet: '#3B0B4F',
  serial: '#C8FF1A',
};

// Hypotrochoid: the classic banknote rosette.
const rosettePath = (cx: number, cy: number, R: number, r: number, d: number, steps = 1400) => {
  const k = (R - r) / r;
  const turns = r / gcd(Math.round(R), Math.round(r));
  let p = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const x = cx + (R - r) * Math.cos(t) + d * Math.cos(k * t);
    const y = cy + (R - r) * Math.sin(t) - d * Math.sin(k * t);
    p += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return p;
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export const Rosette: React.FC<{size: number; color: string; opacity?: number; layers?: number}> = ({size, color, opacity = 0.8, layers = 5}) => {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({length: layers}).map((_, i) => (
        <path key={i} d={rosettePath(c, c, size * 0.3, size * (0.035 + i * 0.006), size * (0.17 - i * 0.018))}
          fill="none" stroke={color} strokeWidth={0.9} opacity={opacity * (1 - i * 0.12)} />
      ))}
    </svg>
  );
};

// Engraved wave band (guilloche ribbon).
const Band: React.FC<{w: number; h: number; color: string; lines?: number; opacity?: number}> = ({w, h, color, lines = 22, opacity = 0.55}) => {
  const paths = Array.from({length: lines}).map((_, i) => {
    let p = '';
    for (let x = 0; x <= w; x += 6) {
      const y = h / 2 + Math.sin(x / 38 + i * 0.28) * (h * 0.32) + Math.sin(x / 11 + i) * (h * 0.06);
      p += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    return p;
  });
  return (
    <svg width={w} height={h}>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth={0.8} opacity={opacity} />)}
    </svg>
  );
};

const Micro: React.FC<{w: number; color: string}> = ({w, color}) => (
  <div style={{width: w, overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: shoulders, fontWeight: 600, fontSize: 11, letterSpacing: 1.5, color, opacity: 0.85}}>
    {'CASHFLOW HISTORIES · '.repeat(60)}
  </div>
);

const Note: React.FC<{children: React.ReactNode; w?: number; h?: number; serial?: boolean}> = ({children, w = 1920, h = 1080, serial = true}) => (
  <AbsoluteFill style={{background: `linear-gradient(115deg, ${NOTE.base} 0%, ${NOTE.base} 55%, ${NOTE.base2} 100%)`}}>
    {/* background engraving */}
    <div style={{position: 'absolute', right: -260, top: -220, opacity: 0.55}}><Rosette size={1000} color={NOTE.line} layers={6} /></div>
    <div style={{position: 'absolute', left: -320, bottom: -380, opacity: 0.35}}><Rosette size={820} color={NOTE.line} layers={4} /></div>
    <div style={{position: 'absolute', left: 0, bottom: 34}}><Band w={w} h={80} color={NOTE.line} /></div>
    {/* double frame */}
    <div style={{position: 'absolute', inset: 22, border: `3px solid ${NOTE.ink}`, opacity: 0.85}} />
    <div style={{position: 'absolute', inset: 32, border: `1px solid ${NOTE.ink}`, opacity: 0.6}} />
    <div style={{position: 'absolute', left: 40, right: 40, top: 40}}><Micro w={w - 80} color={NOTE.ink} /></div>
    {serial && (
      <div style={{position: 'absolute', right: 70, top: 66, fontFamily: shoulders, fontWeight: 900, fontSize: 34, letterSpacing: 6, color: NOTE.serial}}>
        {EP.serial} · {EP.company}
      </div>
    )}
    {children}
  </AbsoluteFill>
);

export const Seal: React.FC<{size: number; bg?: string}> = ({size, bg = NOTE.violet}) => (
  <div style={{width: size, height: size, position: 'relative'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: bg, border: `${size * 0.025}px solid ${NOTE.lime}`}} />
    <div style={{position: 'absolute', inset: size * 0.04}}><Rosette size={size * 0.92} color={NOTE.lime} opacity={0.75} layers={4} /></div>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inline, fontWeight: 900, fontSize: size * 0.42, color: NOTE.ink, letterSpacing: -2}}>
      CH
    </div>
  </div>
);

const Wordmark: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 26 * scale}}>
    <Seal size={150 * scale} />
    <div>
      <div style={{fontFamily: engraved, fontSize: 74 * scale, color: NOTE.ink, letterSpacing: 6 * scale, lineHeight: 1}}>CASHFLOW</div>
      <div style={{fontFamily: engraved, fontSize: 74 * scale, color: NOTE.lime, letterSpacing: 6 * scale, lineHeight: 1}}>HISTORIES</div>
    </div>
  </div>
);

const Source: React.FC<{t: string}> = ({t}) => (
  <div style={{position: 'absolute', left: 70, bottom: 130, fontFamily: shoulders, fontWeight: 600, fontSize: 24, letterSpacing: 2, color: NOTE.ink, opacity: 0.85}}>
    SOURCE · {t.toUpperCase()}
  </div>
);

export const BanknoteFrame: React.FC<{frame: string}> = ({frame}) => {
  if (frame === 'logo') {
    return (
      <Note serial={false}>
        <AbsoluteFill style={{padding: 150, justifyContent: 'center', gap: 60}}>
          <Wordmark scale={1.4} />
          <div style={{display: 'flex', gap: 18}}>
            {[NOTE.base, NOTE.base2, NOTE.violet, NOTE.lime, '#1F8BFF', '#12B76A'].map((c) => (
              <div key={c} style={{width: 120, height: 80, background: c, border: `2px solid ${NOTE.ink}`}} />
            ))}
          </div>
          <div style={{fontFamily: shoulders, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: NOTE.ink}}>
            ONE “DENOMINATION” COLOUR PER EPISODE · SERIAL NUMBER ON EVERY FRAME
          </div>
        </AbsoluteFill>
      </Note>
    );
  }
  if (frame === 'title') {
    return (
      <Note>
        <AbsoluteFill style={{padding: '0 150px', justifyContent: 'center'}}>
          <div style={{fontFamily: inline, fontWeight: 900, fontSize: 200, color: NOTE.lime, lineHeight: 0.8}}>V</div>
          <div style={{fontFamily: engraved, fontSize: 132, color: NOTE.ink, lineHeight: 1.02, letterSpacing: 3, maxWidth: 1300}}>
            HERE’S THE REAL ISSUE
          </div>
        </AbsoluteFill>
      </Note>
    );
  }
  if (frame === 'reveal') {
    return (
      <Note>
        <AbsoluteFill style={{padding: '0 150px', flexDirection: 'row', alignItems: 'center', gap: 100}}>
          <div style={{flex: 1}}>
            <div style={{fontFamily: engraved, fontSize: 40, color: NOTE.ink, letterSpacing: 4}}>SUBWAY NET INCOME</div>
            <div style={{fontFamily: inline, fontWeight: 900, fontSize: 300, color: NOTE.lime, lineHeight: 0.95}}>$688M</div>
            <div style={{fontFamily: shoulders, fontWeight: 800, fontSize: 48, color: NOTE.ink, letterSpacing: 1}}>
              UP FROM $15M · TWO YEARS EARLIER
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 36, height: 560}}>
            {EP.years.map((x, i) => (
              <div key={x.y} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                <div style={{fontFamily: inline, fontWeight: 900, fontSize: 52, color: i === 2 ? NOTE.lime : NOTE.ink}}>${x.v}M</div>
                <div style={{width: 120, height: Math.max(10, (x.v / 688) * 420), border: `3px solid ${NOTE.ink}`,
                  background: i === 2 ? NOTE.lime : `repeating-linear-gradient(135deg, ${NOTE.line}99 0 2px, transparent 2px 8px)`}} />
                <div style={{fontFamily: shoulders, fontWeight: 800, fontSize: 30, color: NOTE.ink}}>{x.y}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
        <Source t={EP.sources.reveal} />
      </Note>
    );
  }
  if (frame === 'bars') {
    return (
      <Note>
        <AbsoluteFill style={{padding: '170px 150px', justifyContent: 'center'}}>
          <div style={{fontFamily: engraved, fontSize: 64, color: NOTE.ink, letterSpacing: 4, marginBottom: 60}}>SALES PER RESTAURANT · PER YEAR</div>
          {EP.bars.map((r) => (
            <div key={r.n} style={{display: 'flex', alignItems: 'center', marginBottom: 40}}>
              <div style={{width: 340, fontFamily: shoulders, fontWeight: 900, fontSize: 46, color: r.hero ? NOTE.lime : NOTE.ink, letterSpacing: 1}}>{r.n.toUpperCase()}</div>
              <div style={{height: 84, width: (r.v / 4.09) * 1000, border: `3px solid ${NOTE.ink}`,
                background: r.hero ? NOTE.lime : `repeating-linear-gradient(90deg, ${NOTE.ink}cc 0 2px, transparent 2px 7px)`}} />
              <div style={{marginLeft: 24, fontFamily: inline, fontWeight: 900, fontSize: 76, color: r.hero ? NOTE.lime : NOTE.ink}}>{r.label}</div>
            </div>
          ))}
        </AbsoluteFill>
        <Source t={EP.sources.bars} />
      </Note>
    );
  }
  // quote
  return (
    <Note>
      <AbsoluteFill style={{padding: '0 180px', justifyContent: 'center'}}>
        <div style={{fontFamily: engraved, fontSize: 82, color: NOTE.ink, lineHeight: 1.12, letterSpacing: 2}}>
          “…DECISIONS THAT PROVIDE THE GREATEST BENEFIT TO THE ENTIRE SUBWAY SYSTEM.”
        </div>
        <div style={{marginTop: 40, fontFamily: shoulders, fontWeight: 800, fontSize: 36, color: NOTE.lime, letterSpacing: 3}}>
          {EP.quoteBy.toUpperCase()}
        </div>
      </AbsoluteFill>
      <Source t={EP.sources.quote} />
    </Note>
  );
};

// Engraved-style storefront (hatched line art).
const EngravedStore: React.FC<{w: number}> = ({w}) => {
  const h = w * 0.9;
  return (
    <svg width={w} height={h} viewBox="0 0 300 270">
      <defs>
        <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={NOTE.ink} strokeWidth="1.4" />
        </pattern>
        <pattern id="hatch2" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={NOTE.ink} strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect x="10" y="10" width="280" height="44" fill="url(#hatch2)" stroke={NOTE.ink} strokeWidth="3" />
      <text x="150" y="42" textAnchor="middle" fontFamily={shoulders} fontWeight={900} fontSize="30" fill={NOTE.lime} letterSpacing="6">SUBWAY</text>
      {Array.from({length: 7}).map((_, i) => (
        <path key={i} d={`M${10 + i * 40} 54 h40 v18 q-20 12 -40 0 z`} fill={i % 2 ? NOTE.ink : 'none'} stroke={NOTE.ink} strokeWidth="2" />
      ))}
      <rect x="10" y="72" width="280" height="190" fill="none" stroke={NOTE.ink} strokeWidth="3" />
      <rect x="28" y="92" width="112" height="150" fill="url(#hatch)" stroke={NOTE.ink} strokeWidth="2" />
      <rect x="160" y="92" width="112" height="150" fill="url(#hatch)" stroke={NOTE.ink} strokeWidth="2" />
      <g transform="rotate(-9 216 165)">
        <rect x="170" y="145" width="96" height="40" fill={NOTE.base} stroke={NOTE.lime} strokeWidth="3" />
        <text x="218" y="173" textAnchor="middle" fontFamily={shoulders} fontWeight={900} fontSize="22" fill={NOTE.lime} letterSpacing="2">CLOSED</text>
      </g>
    </svg>
  );
};

export const BanknoteThumb: React.FC = () => (
  <Note w={1280} h={720}>
    <div style={{position: 'absolute', left: 60, top: 150}}><EngravedStore w={470} /></div>
    <div style={{position: 'absolute', left: 580, top: 120, right: 40}}>
      <div style={{fontFamily: engraved, fontSize: 92, color: NOTE.ink, lineHeight: 0.95, letterSpacing: 2}}>CLOSING.</div>
      <div style={{fontFamily: engraved, fontSize: 92, color: NOTE.ink, lineHeight: 0.95, letterSpacing: 2}}>RICHER.</div>
      <div style={{fontFamily: inline, fontWeight: 900, fontSize: 210, color: NOTE.lime, lineHeight: 0.95, marginTop: 6}}>$688M</div>
    </div>
    <div style={{position: 'absolute', left: 52, top: 52}}><Seal size={96} /></div>
  </Note>
);
