// Three candidate brand directions. Every graphic and thumbnail reads from one of these,
// so switching brand = switching one key.
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSpaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadJetBrains} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadArchivoBlack} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as loadArchivo} from '@remotion/google-fonts/Archivo';

const fraunces = loadFraunces('normal', {weights: ['600', '800'], subsets: ['latin']}).fontFamily;
const inter = loadInter('normal', {weights: ['400', '600', '800'], subsets: ['latin']}).fontFamily;
const grotesk = loadSpaceGrotesk('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;
const mono = loadJetBrains('normal', {weights: ['500', '800'], subsets: ['latin']}).fontFamily;
const archivoBlack = loadArchivoBlack('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
const archivo = loadArchivo('normal', {weights: ['400', '600', '800'], subsets: ['latin']}).fontFamily;

export type Brand = {
  key: string;
  workingName: string;
  tagline: string;
  personality: string;
  bg: string;
  panel: string;
  ink: string;
  muted: string;
  rule: string;
  accent: string; // the one loud colour
  accent2: string; // supporting
  gain: string;
  loss: string;
  headFont: string;
  headWeight: number;
  bodyFont: string;
  numFont: string;
  numWeight: number;
  headCase: 'none' | 'uppercase';
  radius: number;
  texture: 'paper' | 'grid' | 'none';
};

export const BRANDS: Record<string, Brand> = {
  ledger: {
    key: 'ledger',
    workingName: 'Behind the Receipt',
    tagline: 'The economics of the places you pay.',
    personality: 'Financial newspaper: paper and ink, serif headlines, one red pen. Credible and calm; signals "researched".',
    bg: '#F3EEE4',
    panel: '#FBF8F2',
    ink: '#16130F',
    muted: '#6E665B',
    rule: '#D8CFBF',
    accent: '#C8281E',
    accent2: '#2F4858',
    gain: '#2E6E4A',
    loss: '#C8281E',
    headFont: fraunces,
    headWeight: 800,
    bodyFont: inter,
    numFont: inter,
    numWeight: 800,
    headCase: 'none',
    radius: 2,
    texture: 'paper',
  },
  terminal: {
    key: 'terminal',
    workingName: 'Off the Books',
    tagline: 'Where the money really goes.',
    personality: 'Trading terminal: near-black, monospaced numbers, amber highlight. Investigative and data-heavy; suits power and fraud stories.',
    bg: '#0A0E13',
    panel: '#111822',
    ink: '#E8EEF4',
    muted: '#8593A3',
    rule: '#1F2A37',
    accent: '#FFB21A',
    accent2: '#4CC2FF',
    gain: '#3DDC84',
    loss: '#FF5D5D',
    headFont: grotesk,
    headWeight: 700,
    bodyFont: grotesk,
    numFont: mono,
    numWeight: 800,
    headCase: 'none',
    radius: 6,
    texture: 'grid',
  },
  poster: {
    key: 'poster',
    workingName: 'Fine Margins',
    tagline: 'Big brands. Small numbers. Huge stories.',
    personality: 'Bold explainer poster: cream, heavy grotesque, orange and blue. Friendly and high-contrast; built for thumbnail CTR.',
    bg: '#FFF4E2',
    panel: '#FFFFFF',
    ink: '#17171C',
    muted: '#6B6660',
    rule: '#EADCC6',
    accent: '#FF5A1F',
    accent2: '#2F5BFF',
    gain: '#1E9E5A',
    loss: '#E23B2E',
    headFont: archivoBlack,
    headWeight: 400,
    bodyFont: archivo,
    numFont: archivoBlack,
    numWeight: 400,
    headCase: 'uppercase',
    radius: 14,
    texture: 'none',
  },
};
