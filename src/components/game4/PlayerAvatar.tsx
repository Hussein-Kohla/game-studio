import { defaultAvatarForIndex } from '../../data/game4Assets';

interface PlayerAvatarProps {
  url?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

export function PlayerAvatar({ url, name, size = 'md', className = '' }: PlayerAvatarProps) {
  const src = url || defaultAvatarForIndex(0);
  return (
    <img
      src={src}
      alt={name ?? 'لاعب'}
      className={`${sizes[size]} rounded-full bg-white/10 border-2 border-white/20 object-cover shrink-0 ${className}`}
    />
  );
}
