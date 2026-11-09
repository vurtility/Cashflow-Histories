// Ink Misprint building blocks for full episodes.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadUltra} from '@remotion/google-fonts/Ultra';
import {loadFont as loadCourier} from '@remotion/google-fonts/CourierPrime';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {INK, Over, Wordmark} from '../concepts/Misprint';

export {INK, Over, Wordmark};
export const slab = loadUltra('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const type = loadCourier('normal', {weights: ['400', '700'], subsets: ['latin']}).fontFamily;
export const marker = loadMarker('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;

export type Asset = {id: string; src: string; credit: string; kind: 'image' | 'video'; w?: number; h?: number};

export const dots = (color: string, size = 12, r = 3.2) =>
  `radial-gradient(circle, ${color} ${r}px, transparent ${r + 0.6}px) 0 0 / ${size}px ${size}px`;

// 0→1 ease over [a, b] frames.
export const useT = (a: number, b: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
};
export const usePop = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 14, stiffness: 160, mass: 0.7}});
};

export const Reg: React.FC<{x: number; y: number; color?: string}> = ({x, y, color = INK.ink}) => (
  <svg width={46} height={46} style={{position: 'absolute', left: x, top: y}}>
    <circle cx="23" cy="23" r="11" fill="none" stroke={color} strokeWidth="2" />
    <line x1="0" y1="23" x2="46" y2="23" stroke={color} strokeWidth="2" />
    <line x1="23" y1="0" x2="23" y2="46" stroke={color} strokeWidth="2" />
  </svg>
);

export const Grain: React.FC = () => (
  <Img src={staticFile('grain.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55, mixBlendMode: 'multiply'}} />
);

export const Caption: React.FC<{t?: string; light?: boolean}> = ({t, light}) =>
  t ? (
    <div style={{position: 'absolute', left: 90, bottom: 52, fontFamily: type, fontSize: 22, color: light ? INK.paper : INK.ink,
      background: light ? 'rgba(22,33,62,0.72)' : 'transparent', padding: light ? '3px 10px' : 0, maxWidth: 1300}}>
      [source: {t}]
    </div>
  ) : null;

// White printed sheet with registration marks and the print number.
export const Sheet: React.FC<{children: React.ReactNode; print?: string; bg?: string}> = ({children, print, bg = INK.paper}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    {children}
    <Reg x={24} y={24} /><Reg x={1850} y={24} /><Reg x={24} y={1010} /><Reg x={1850} y={1010} />
    {print && (
      <div style={{position: 'absolute', right: 100, top: 34, fontFamily: type, fontWeight: 700, fontSize: 22, color: INK.ink, letterSpacing: 2}}>
        PRINT Nº {print}
      </div>
    )}
    <Grain />
  </AbsoluteFill>
);

// A photo or video frame, either in natural colour (logos stay recognisable) or reprinted in two inks.
export const Plate: React.FC<{children: (style: React.CSSProperties) => React.ReactNode; treat?: 'color' | 'ink'; kb?: string; dur: number; focus?: [number, number]}> = ({children, treat = 'color', kb = 'in', dur, focus = [0.5, 0.5]}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], {extrapolateRight: 'clamp'});
  const s = kb === 'out' ? 1.16 - 0.1 * p : 1.06 + 0.1 * p;
  const dx = kb === 'left' ? 40 - 80 * p : kb === 'right' ? -40 + 80 * p : 0;
  const base: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
    objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`, transform: `translateX(${dx}px) scale(${s})`};
  // Print-in: the plates start further out of register and settle.
  const reg = interpolate(f, [0, 6], [26, 7], {extrapolateRight: 'clamp'});
  if (treat === 'ink') {
    const gray: React.CSSProperties = {...base, filter: 'grayscale(1) contrast(1.25) brightness(1.05)'};
    return (
      <AbsoluteFill style={{background: INK.paper}}>
        <AbsoluteFill style={{isolation: 'isolate'}}>
          {children(gray)}
          <AbsoluteFill style={{background: INK.blue, mixBlendMode: 'screen'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{isolation: 'isolate', mixBlendMode: 'multiply', transform: `translate(${reg}px, ${-reg * 0.6}px)`, opacity: 0.85}}>
          {children(gray)}
          <AbsoluteFill style={{background: INK.pink, mixBlendMode: 'screen'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: dots(INK.ink, 7, 1.4), mixBlendMode: 'multiply', opacity: 0.18}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: INK.ink}}>
      {children({...base, filter: 'saturate(1.12) contrast(1.06)'})}
      <AbsoluteFill style={{background: dots(INK.ink, 6, 1.1), mixBlendMode: 'multiply', opacity: 0.22}} />
      {/* misregistered pink edge */}
      <div style={{position: 'absolute', inset: 34, border: `5px solid ${INK.pink}`, mixBlendMode: 'multiply', transform: `translate(${reg}px, ${-reg * 0.6}px)`}} />
    </AbsoluteFill>
  );
};

// Paper border around footage, so borrowed material always sits "on the sheet".
export const FootageFrame: React.FC<{children: React.ReactNode; label?: string; credit?: string; print?: string}> = ({children, label, credit, print}) => {
  const lt = useT(4, 16);
  return (
    <Sheet print={print}>
      <div style={{position: 'absolute', left: 80, top: 80, right: 80, bottom: 96, overflow: 'hidden'}}>{children}</div>
      {label && (
        <div style={{position: 'absolute', left: 80, top: 112, transform: `translateX(${(1 - lt) * -40}px)`, opacity: lt,
          background: INK.yellow, padding: '8px 20px', fontFamily: type, fontWeight: 700, fontSize: 32, color: INK.ink}}>
          {label}
        </div>
      )}
      {credit && <div style={{position: 'absolute', left: 84, bottom: 44, fontFamily: type, fontSize: 21, color: INK.ink}}>[source: {credit}]</div>}
    </Sheet>
  );
};

export const AssetImg: React.FC<{a: Asset; style?: React.CSSProperties}> = ({a, style}) => (
  <Img src={staticFile(a.src)} style={style} />
);

export const Bug: React.FC = () => <div style={{position: 'absolute', right: 96, bottom: 34, opacity: 0.9}}><Wordmark scale={0.22} /></div>;

// Halftone bar fill used by charts.
export const InkBar: React.FC<{w: number | string; h: number | string; hero?: boolean; style?: React.CSSProperties}> = ({w, h, hero, style}) => (
  <div style={{position: 'relative', width: w, height: h, ...style}}>
    <div style={{position: 'absolute', inset: 0, background: hero ? INK.pink : INK.blue, mixBlendMode: 'multiply'}} />
    <div style={{position: 'absolute', inset: 0, left: 8, top: -6, background: dots(hero ? INK.blue : INK.pink, 12, 3), mixBlendMode: 'multiply'}} />
  </div>
);

export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
