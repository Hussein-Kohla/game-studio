import { create } from 'zustand';
import { CARD_WIKI_TITLES } from './cardWikiTitles';

export type CardCategory = 'animals' | 'people' | 'egyptian_celebs' | 'football_stars' | 'food';

export interface CardItem {
  id: string;
  categoryId: CardCategory;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
  flippedBy?: 'red' | 'green';
}

export type GamePhase =
  | 'lobby'        // waiting for players
  | 'category'     // host picks category
  | 'reveal'       // 24 cards shown, countdown
  | 'turns'        // teams take turns
  | 'gameover';

export interface Player {
  id: string;
  name: string;
  team: 'red' | 'green';
  isHost: boolean;
}

export interface Game3State {
  // Room
  roomCode: string | null;
  myPlayerId: string | null;
  players: Player[];
  phase: GamePhase;

  // Category selection
  selectedCategory: CardCategory | null;

  // Cards grid (4 rows × 6 cols = 24)
  cards: CardItem[];

  // Scores
  scores: { red: number; green: number };

  // Guess Who specific
  secretCards: { red: string | null; green: string | null };
  eliminatedCards: { red: string[]; green: string[] };
  winner: 'red' | 'green' | null;

  // Turn
  currentTurn: 'red' | 'green';

  // Reveal phase countdown
  revealCountdown: number;

  // guess phase: which card is selected for guess
  guessCardId: string | null;
  isGuessingMode: boolean;

  // Actions
  createRoom: (playerName: string) => void;
  joinRoom: (code: string, playerName: string) => boolean;
  selectCategory: (cat: CardCategory) => void;
  startReveal: () => void;
  startTurns: () => void;
  flipCard: (cardId: string) => void;
  toggleGuessMode: () => void;
  guessCard: (cardId: string) => void;
  endTurn: () => void;
  setSecretCard: (cardId: string) => void;
  resetGame: () => void;
  setRevealCountdown: (n: number) => void;
}

// ─── Hardcoded card data per category ───────────────────────────────────────
export const CATEGORY_META: Record<CardCategory, { label: string; icon: string; color: string }> = {
  animals:          { label: 'حيوانات',            icon: '🐾', color: 'from-emerald-500 to-green-700' },
  people:           { label: 'أشخاص',              icon: '👥', color: 'from-sky-500 to-blue-700' },
  egyptian_celebs:  { label: 'مشاهير مصريين',      icon: '🌟', color: 'from-yellow-400 to-amber-600' },
  football_stars:   { label: 'لاعبي كرة مشاهير',   icon: '⚽', color: 'from-rose-500 to-red-700' },
  food:             { label: 'أكلات',               icon: '🍽️', color: 'from-orange-400 to-orange-700' },
};

export const CARD_DATA: Record<CardCategory, string[]> = {
  animals: [
    'أسد', 'نمر', 'فيل', 'زرافة', 'حصان', 'ديك',
    'قط', 'كلب', 'أرنب', 'ضفدع', 'بومة', 'دلفين',
    'تمساح', 'ثعبان', 'طاووس', 'فراشة', 'دب', 'ذئب',
    'قرد', 'حمار', 'جمل', 'بقرة', 'خروف', 'دجاجة',
  ],
  people: [
    'طبيب', 'مدرس', 'طيار', 'شيف', 'مهندس', 'محامي',
    'رسام', 'موسيقار', 'رياضي', 'صياد', 'فلاح', 'بناء',
    'ممرضة', 'شرطي', 'مطفئ', 'صحفي', 'عالم', 'نجار',
    'خياط', 'حلاق', 'ساحر', 'باعة', 'قاضي', 'دبلوماسي',
  ],
  egyptian_celebs: [
    'عمرو دياب', 'أم كلثوم', 'نجيب محفوظ', 'عادل إمام', 'رشدي أباظة', 'سعاد حسني',
    'طه حسين', 'محمد منير', 'سمير غانم', 'إسماعيل يس', 'منى زكي', 'أحمد السقا',
    'هند صبري', 'كريم عبد العزيز', 'منى الشاذلي', 'إلهام شاهين', 'أحمد حلمي', 'محمد هنيدي',
    'أحمد عز', 'منة شلبي', 'مي عز الدين', 'محمد رمضان', 'تامر حسني', 'مصطفى شعبان',
    'رامز جلال', 'دنيا سمير غانم', 'يسرا', 'نور الشريف', 'حسين فهمي', 'مصطفى قمر',
    'شيرين عبد الوهاب',
  ],
  football_stars: [
    'رونالدو', 'ميسي', 'نيمار', 'مبابي', 'هالاند', 'بنزيمة',
    'لوكاكو', 'ساكا', 'فينيسيوس', 'ديبالا', 'زيدان', 'محمد صلاح',
    'فيرمينو', 'ماني', 'موراتا', 'غريزمان', 'كانسيلو', 'برونو',
    'ثياغو', 'محمد أبو تريكه', 'لامين', 'بيدري', 'غافي', 'بيلينغهام',
  ],
  food: [
    'كشري', 'فول', 'لحمة مشوية', 'كباب', 'فتة', 'كنافة',
    'بقلاوة', 'أم علي', 'ملوخية', 'مكرونة', 'بيتزا', 'برجر',
    'سوشي', 'شاورما', 'فلافل', 'محشي', 'حواوشي', 'مسقعة',
    'كفتة', 'سمك', 'جمبري', 'بطاطس مقلية', 'سلطة', 'آيس كريم',
  ],
};



function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useGame3Store = create<{
  roomCode: string | null;
  myPlayerId: string | null;
  isGuessingMode: boolean;
  guessCardId: string | null;
  setRoomCode: (code: string | null) => void;
  setMyPlayerId: (id: string | null) => void;
  toggleGuessMode: () => void;
  setGuessCardId: (id: string | null) => void;
}>((set) => ({
  roomCode: null,
  myPlayerId: null,
  isGuessingMode: false,
  guessCardId: null,
  setRoomCode: (code) => set({ roomCode: code }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  toggleGuessMode: () => set(s => ({ isGuessingMode: !s.isGuessingMode, guessCardId: null })),
  setGuessCardId: (id) => set({ guessCardId: id }),
}));

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function buildCards(cat: CardCategory): CardItem[] {
  const shuffled = shuffle(CARD_DATA[cat]);
  const filtered = shuffled.filter((label) => !!CARD_WIKI_TITLES[label]);
  const needed = 24;
  const labels =
    filtered.length >= needed
      ? filtered.slice(0, needed)
      : [
          ...filtered,
          ...shuffled.filter((l) => !filtered.includes(l)).slice(0, needed - filtered.length),
        ];
  return labels.map((label, i) => ({
    id: `card-${i}`,
    categoryId: cat,
    label,
    isFlipped: false,
    isMatched: false,
  }));
}

