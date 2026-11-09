import React from 'react';
import {Composition} from 'remotion';
import {BrandFrame, Thumbnail} from './Frames';
import {BanknoteFrame, BanknoteThumb} from './concepts/Banknote';
import {PriceTagFrame, PriceTagThumb} from './concepts/PriceTag';
import {MisprintFrame, MisprintThumb} from './concepts/Misprint';
import {FeedMock} from './concepts/Feed';
import {EPISODES, Episode} from './episode/Episode';

const ConceptFrame: React.FC<{concept: string; frame: string}> = ({concept, frame}) => {
  if (concept === 'banknote') return <BanknoteFrame frame={frame} />;
  if (concept === 'pricetag') return <PriceTagFrame frame={frame} />;
  return <MisprintFrame frame={frame} />;
};
const ConceptThumb: React.FC<{concept: string}> = ({concept}) =>
  concept === 'banknote' ? <BanknoteThumb /> : concept === 'pricetag' ? <PriceTagThumb /> : <MisprintThumb />;

export const Root: React.FC = () => (
  <>
    <Composition id="BrandFrame" component={BrandFrame as any} durationInFrames={1} fps={30} width={1920} height={1080}
      defaultProps={{brand: 'ledger', frame: 'title'}} />
    <Composition id="Thumbnail" component={Thumbnail as any} durationInFrames={1} fps={30} width={1280} height={720}
      defaultProps={{brand: 'ledger'}} />
    <Composition id="Concept" component={ConceptFrame as any} durationInFrames={1} fps={30} width={1920} height={1080}
      defaultProps={{concept: 'banknote', frame: 'logo'}} />
    <Composition id="ConceptThumb" component={ConceptThumb as any} durationInFrames={1} fps={30} width={1280} height={720}
      defaultProps={{concept: 'banknote'}} />
    <Composition id="Feed" component={FeedMock as any} durationInFrames={1} fps={30} width={1920} height={1080}
      defaultProps={{which: 'banknote'}} />
    {Object.entries(EPISODES).map(([ep, d]) => (
      <Composition key={ep} id={`Episode-${ep}`} component={Episode as any} durationInFrames={d.durationInFrames} fps={d.fps}
        width={1920} height={1080} defaultProps={{ep}} />
    ))}
  </>
);
