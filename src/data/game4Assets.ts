/** صور ثابتة من DiceBear (مجاني، بدون رفع ملفات) */

export const PLAYER_AVATARS = [
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-cat-party',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-dog-cool',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-bear-happy',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-fox-ninja',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-panda-joy',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-lion-king',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-monkey-banana',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-rabbit-carrot',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-robot-dance',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-alien-ufo',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-ghost-boo',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-dragon-fire',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-unicorn-magic',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-frog-prince',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-owl-wise',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=player-penguin-ice',
] as const;

export const CATEGORY_ASSETS: Record<
  string,
  { label: string; emoji: string; image: string }
> = {
  animals: {
    label: 'حيوانات',
    emoji: '🦁',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=cat-lion-zoo',
  },
  countries: {
    label: 'دول مشهورة',
    emoji: '🌍',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=globe-travel-map',
  },
  football: {
    label: 'لاعيبة كورة مشهورة',
    emoji: '⚽',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=soccer-ball-goal',
  },
  clothing: {
    label: 'لبس واضح',
    emoji: '👕',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=shirt-fashion-closet',
  },
  egyptian_food: {
    label: 'أكل مصري',
    emoji: '🍲',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=koshari-pot-food',
  },
  egyptian_sweets: {
    label: 'حلويات مصرية',
    emoji: '🍰',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=cake-sweet-bakery',
  },
  egyptian_celebrities: {
    label: 'مشاهير مصريين',
    emoji: '🎬',
    image: 'https://api.dicebear.com/7.x/thumbs/svg?seed=star-camera-movie',
  },
};

export function defaultAvatarForIndex(index: number): string {
  return PLAYER_AVATARS[index % PLAYER_AVATARS.length];
}
