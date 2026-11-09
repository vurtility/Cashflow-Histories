// Shared episode content for concept samples (Subway episode, sourced figures).
export const EP = {
  serial: 'CH 001',
  company: 'SUBWAY',
  chapter: 'Here’s the real issue',
  chapterNo: 5,
  reveal: {label: 'Subway net income', value: '$688M', from: '$15M', note: 'Franchise revenue −6%'},
  years: [
    {y: '2023', v: 15},
    {y: '2024', v: 397},
    {y: '2025', v: 688},
  ],
  bars: [
    {n: 'McDonald’s', v: 4.09, label: '$4.09M'},
    {n: 'Jersey Mike’s', v: 1.37, label: '$1.37M'},
    {n: 'Subway', v: 0.5, label: '~$500K', hero: true},
  ],
  quote: '…decisions that provide the greatest benefit to the entire Subway system.',
  quoteBy: 'Subway, on its $6.99 footlong · 2024',
  sources: {
    reveal: 'Subway 2026 franchise disclosure document',
    bars: 'Company filings; Subway: Circana estimate',
    quote: 'Franchise Times, Aug 2024',
  },
};

// Deterministic pseudo-random for patterns.
export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
