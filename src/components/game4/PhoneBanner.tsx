import { PlayerAvatar } from './PlayerAvatar';

interface PhoneBannerProps {
  playerName: string;
  subtitle?: string;
  avatarUrl?: string;
}

export function PhoneBanner({ playerName, subtitle, avatarUrl }: PhoneBannerProps) {
  return (
    <div className="w-full text-center mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30">
      <p className="text-rose-300 text-sm font-bold mb-2">📱 أعطِ الهاتف إلى</p>
      {avatarUrl && (
        <div className="flex justify-center mb-2">
          <PlayerAvatar url={avatarUrl} name={playerName} size="md" className="border-rose-400/50" />
        </div>
      )}
      <p className="text-3xl font-black text-white">{playerName}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
    </div>
  );
}
