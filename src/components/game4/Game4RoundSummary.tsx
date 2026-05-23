import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlayerAvatar } from './PlayerAvatar';
import type { Game4Player } from '../../store/game4Store';

interface Game4RoundSummaryProps {
  imposter: Game4Player | undefined;
  imposterId: string;
  civilianWord: string;
  impostorWord: string;
  players: Game4Player[];
  correctVoters: Game4Player[];
  imposterSelfVote: boolean;
  categoryLabel: string | null;
  roundNumber: number;
  winScore: number;
  onNextRound?: () => void;
  onChangeCategory?: () => void;
  showActions?: boolean;
}

export function Game4RoundSummary({
  imposter,
  imposterId,
  civilianWord,
  impostorWord,
  players,
  correctVoters,
  imposterSelfVote,
  categoryLabel,
  roundNumber,
  winScore,
  onNextRound,
  onChangeCategory,
  showActions = true,
}: Game4RoundSummaryProps) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        className="w-full text-center mb-8 relative"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"
        />
        <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-3 relative">
          🕵️ كشف الامبوستر
        </p>
        <div className="flex flex-col items-center gap-3 relative">
          {imposter && (
            <PlayerAvatar url={imposter.avatarUrl} name={imposter.name} size="lg" className="border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]" />
          )}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]"
          >
            {imposter?.name}
          </motion.h1>
        </div>
        <p className="text-slate-400 mt-3 relative">كان الامبوستر طوال الجولة!</p>
      </motion.div>

      <Card className="w-full p-6 mb-6 text-center border-white/10">
        <p className="text-slate-500 text-sm mb-2">كلمات الجولة</p>
        <p className="text-lg">
          الجماعة: <span className="text-green-400 font-bold">{civilianWord}</span>
        </p>
        <p className="text-lg mt-1">
          الامبوستر: <span className="text-red-400 font-bold">{impostorWord}</span>
        </p>
        <p className="text-xs text-slate-500 mt-3">كلمتان مختلفتان في نفس التصنيف — ليستا نفس الشيء</p>
      </Card>

      <Card className="w-full p-6 mb-6">
        <h3 className="font-bold text-white mb-4">النقاط هذه الجولة</h3>
        {correctVoters.length > 0 ? (
          <p className="text-green-400 mb-2">
            +1 لمن أصاب: {correctVoters.map((p) => p.name).join('، ')}
          </p>
        ) : (
          <p className="text-slate-500 mb-2">لا أحد أصاب بالتصويت</p>
        )}
        {imposterSelfVote && <p className="text-amber-400">+1 للامبوستر (صوّت على نفسه!)</p>}
      </Card>

      <div className="w-full space-y-2 mb-8">
        <h3 className="font-bold text-slate-400 text-sm">لوحة النقاط</h3>
        {[...players]
          .sort((a, b) => b.score - a.score)
          .map((p) => (
            <div
              key={p.id}
              className={`flex justify-between items-center gap-3 p-3 rounded-xl ${
                p.id === imposterId ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <PlayerAvatar url={p.avatarUrl} name={p.name} size="sm" />
                <span className="font-bold">{p.name}</span>
              </div>
              <span className="text-xl font-black">{p.score}</span>
            </div>
          ))}
      </div>

      {showActions && onNextRound && (
        <>
          <Button
            size="lg"
            className="w-full mb-3 bg-gradient-to-r from-rose-500 to-orange-500"
            onClick={onNextRound}
          >
            جولة جديدة ({categoryLabel})
          </Button>
          {onChangeCategory && (
            <Button variant="ghost" className="w-full" onClick={onChangeCategory}>
              تغيير التصنيف
            </Button>
          )}
          <p className="text-slate-600 text-xs mt-4 text-center">
            الجولة {roundNumber} — أول من يصل {winScore} نقطة يفوز
          </p>
        </>
      )}
    </>
  );
}
