// A full episode: shots from build_shots.py, narration takes on the same frame grid, chapter stamps on top.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SCENES} from './Scenes';
import {INK, slab, type} from './kit';
import subway from './data/subway.json';
import airlines from './data/airlines.json';
import statefarm from './data/statefarm.json';
import carvana from './data/carvana.json';
import amex from './data/amex.json';
import timeshare from './data/timeshare.json';

export const EPISODES: Record<string, any> = {subway, airlines, statefarm, carvana, amex, timeshare};

const ChapterStamp: React.FC<{name: string; n: number}> = ({name, n}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, 66, 78], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = interpolate(f, [0, 8], [-60, 0], {extrapolateRight: 'clamp'});
  const label = name.replace(/^\d+\.\s*/, '');
  return (
    <div style={{position: 'absolute', left: 80, top: 34, opacity: o, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', gap: 0}}>
      <div style={{background: INK.ink, color: INK.yellow, fontFamily: type, fontWeight: 700, fontSize: 26, padding: '8px 16px'}}>
        {n === 0 ? 'COLD OPEN' : `CH. ${n}`}
      </div>
      {n > 0 && <div style={{background: INK.pink, color: INK.paper, fontFamily: slab, fontSize: 30, padding: '6px 18px'}}>{label}</div>}
    </div>
  );
};

export const Episode: React.FC<{ep: string}> = ({ep}) => {
  const d = EPISODES[ep];
  return (
    <AbsoluteFill style={{background: INK.paper}}>
      {d.shots.map((s: any, i: number) => {
        const Scene = SCENES[s.kind];
        if (!Scene) throw new Error(`Unknown scene type "${s.kind}" (${s.seg})`);
        return (
          <Sequence key={i} from={s.start} durationInFrames={s.dur} name={`${s.seg} ${s.kind}`}>
            <Scene {...s.p} dur={s.dur} print={d.print} />
          </Sequence>
        );
      })}
      {d.vo.map((v: any, i: number) => (
        <Sequence key={'vo' + i} from={v.from} durationInFrames={v.len} name={`vo ${i + 1}`}>
          <Audio src={staticFile(v.src)} startFrom={v.trim || 0} />
        </Sequence>
      ))}
      {d.chapters.map((c: any, i: number) =>
        c.name === 'VERDICT' || i > 0 ? (
          <Sequence key={'ch' + i} from={c.from} durationInFrames={80} name={`chapter ${c.name}`}>
            <ChapterStamp name={c.name} n={c.name === 'VERDICT' ? 7 : i} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
