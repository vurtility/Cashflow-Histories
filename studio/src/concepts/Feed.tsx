// A YouTube-style feed (dark mode) to test whether a thumbnail stands out among generic ones.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rng} from './shared';
import {BanknoteThumb} from './Banknote';
import {PriceTagThumb} from './PriceTag';
import {MisprintThumb} from './Misprint';

const W = 512;
const H = 288;

const Scaled: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{width: W, height: H, overflow: 'hidden', borderRadius: 12, position: 'relative'}}>
    <div style={{width: 1280, height: 720, transform: `scale(${W / 1280})`, transformOrigin: '0 0', position: 'absolute'}}>{children}</div>
  </div>
);

// Generic competitor-style placeholder: muted photo-ish gradient + white headline blocks.
const Placeholder: React.FC<{seed: number}> = ({seed}) => {
  const r = rng(seed * 7919 + 13);
  const hues = [0, 28, 48, 140, 200, 280, 330, 190, 10];
  const h = hues[seed % hues.length];
  return (
    <div style={{width: W, height: H, borderRadius: 12, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(${Math.floor(r() * 360)}deg, hsl(${h} 65% ${28 + r() * 12}%), hsl(${h + 25} 70% ${48 + r() * 12}%))`}}>
      <div style={{position: 'absolute', left: 30 + r() * 200, top: 40 + r() * 80, width: 160, height: 160, borderRadius: '50%', background: `hsl(${h} 15% 70% / 0.35)`}} />
      <div style={{position: 'absolute', left: 24, bottom: 30, width: 200 + r() * 150, height: 34, background: '#fff', opacity: 0.92}} />
      <div style={{position: 'absolute', left: 24, bottom: 74, width: 120 + r() * 140, height: 34, background: r() > 0.5 ? '#ffd400' : '#fff', opacity: 0.92}} />
    </div>
  );
};

const Card: React.FC<{children: React.ReactNode; title: string}> = ({children, title}) => (
  <div style={{width: W}}>
    {children}
    <div style={{display: 'flex', gap: 12, marginTop: 12}}>
      <div style={{width: 36, height: 36, borderRadius: '50%', background: '#3a3a3a', flexShrink: 0}} />
      <div>
        <div style={{color: '#f1f1f1', fontFamily: 'Roboto, Arial, sans-serif', fontSize: 18, fontWeight: 600, lineHeight: 1.3}}>{title}</div>
        <div style={{color: '#aaa', fontFamily: 'Roboto, Arial, sans-serif', fontSize: 15, marginTop: 4}}>Channel · 1.2M views · 3 days ago</div>
      </div>
    </div>
  </div>
);

export const FeedMock: React.FC<{which: string}> = ({which}) => {
  const ours = {banknote: <BanknoteThumb />, pricetag: <PriceTagThumb />, misprint: <MisprintThumb />}[which];
  const titles = ['Why Every Airline Is Losing Money', 'The Collapse of a Retail Giant', 'How This App Makes Billions',
    'The Dark Truth About Fast Food', 'Inside the Biggest Merger Ever', 'Why Nobody Buys This Anymore',
    'The $10 Billion Mistake', 'How Costco Really Makes Money'];
  let k = 0;
  return (
    <AbsoluteFill style={{background: '#0F0F0F', padding: '70px 96px', flexDirection: 'row', flexWrap: 'wrap', gap: '56px 48px', alignContent: 'flex-start'}}>
      {Array.from({length: 9}).map((_, i) =>
        i === 4 ? (
          <Card key={i} title="Subway Is Closing Two Stores a Day. So Why Is It Making More Money?"><Scaled>{ours}</Scaled></Card>
        ) : (
          <Card key={i} title={titles[k++]}><Placeholder seed={i} /></Card>
        ),
      )}
    </AbsoluteFill>
  );
};
