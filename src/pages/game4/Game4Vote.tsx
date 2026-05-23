import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PhoneBanner } from '../../components/game4/PhoneBanner';
import { useGame4Store } from '../../store/game4Store';
import { PlayerAvatar } from '../../components/game4/PlayerAvatar';
import { playVoteSound } from '../../utils/sounds';

export function Game4Vote() {
  const navigate = useNavigate();
  const {
    players,
    votingIndex,
    setVote,
    advanceVoting,
    categoryLabel,
    roundNumber,
  } = useGame4Store();

  const [picked, setPicked] = useState<string | null>(null);

  if (players.length === 0) {
    navigate('/game4/setup');
    return null;
  }

  if (votingIndex >= players.length) {
    navigate('/game4/results');
    return null;
  }

  const voter = players[votingIndex];

  const submitVote = () => {
    if (!picked) return;
    playVoteSound();
    setVote(voter.id, picked);
    setPicked(null);
    advanceVoting();
    if (votingIndex + 1 >= players.length) {
      navigate('/game4/results');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 max-w-lg mx-auto w-full">
      <p className="text-slate-500 text-sm mb-4">
        الجولة {roundNumber} — {categoryLabel} — التصويت ({votingIndex + 1}/{players.length})
      </p>

      <PhoneBanner playerName={voter.name} avatarUrl={voter.avatarUrl} subtitle="من تعتقد أنه الامبوستر؟" />

      <Card className="w-full p-6 border-red-500/30">
        <div className="grid grid-cols-1 gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPicked(p.id)}
              className={`p-4 rounded-xl font-bold text-lg transition-all border-2 ${
                picked === p.id
                  ? 'border-red-500 bg-red-500/20 text-white'
                  : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/30'
              }`}
            >
              <span className="flex items-center gap-3">
                <PlayerAvatar url={p.avatarUrl} name={p.name} size="sm" />
                <span>
                  {p.name}
                  {p.id === voter.id && (
                    <span className="text-xs text-slate-500 mr-1">(أنت)</span>
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Button
        size="lg"
        variant="danger"
        className="mt-8 w-full"
        disabled={!picked}
        onClick={submitVote}
      >
        تأكيد التصويت
      </Button>
    </div>
  );
}
