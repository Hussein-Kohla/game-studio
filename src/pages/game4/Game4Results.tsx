import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import Confetti from 'react-confetti';
import { api } from '../../../convex/_generated/api';
import { Button } from '../../components/ui/Button';
import { Game4RoundSummary } from '../../components/game4/Game4RoundSummary';
import { PlayerAvatar } from '../../components/game4/PlayerAvatar';
import { useGame4Store } from '../../store/game4Store';
import toast from 'react-hot-toast';
import { playImposterRevealSound, playWinSound } from '../../utils/sounds';

export function Game4Results() {
  const navigate = useNavigate();
  const pickPair = useMutation(api.imposter.pickRandomPair);
  const scoredRef = useRef(false);
  const revealSoundRef = useRef(false);

  const {
    players,
    imposterId,
    votes,
    civilianWord,
    impostorWord,
    categoryId,
    categoryLabel,
    getUsedPairIds,
    winScore,
    winnerId,
    applyRoundScores,
    startRound,
    resetGame,
    roundNumber,
  } = useGame4Store();

  useEffect(() => {
    if (scoredRef.current || !imposterId) return;
    scoredRef.current = true;
    applyRoundScores();
    if (useGame4Store.getState().winnerId) {
      playWinSound();
    }
  }, [imposterId, applyRoundScores]);

  useEffect(() => {
    if (!revealSoundRef.current && imposterId) {
      revealSoundRef.current = true;
      playImposterRevealSound();
    }
  }, [imposterId]);

  if (players.length === 0 || !imposterId) {
    navigate('/game4/setup');
    return null;
  }

  const imposter = players.find((p) => p.id === imposterId);
  const gameWinner = players.find((p) => p.id === winnerId);
  const correctVoters = players.filter((p) => votes[p.id] === imposterId && p.id !== imposterId);
  const imposterSelfVote = votes[imposterId] === imposterId;

  const startNextRound = async () => {
    if (!categoryId || !categoryLabel) {
      navigate('/game4/category');
      return;
    }
    try {
      const pair = await pickPair({ categoryId, exclude: getUsedPairIds(categoryId) });
      if (!pair) {
        toast.error('نفدت كلمات هذا التصنيف في الجلسة! اختر تصنيفاً آخر.', { icon: '📭' });
        navigate('/game4/category');
        return;
      }
      const imposterIndex = Math.floor(Math.random() * players.length);
      startRound({
        pairId: pair.pairId,
        word: pair.word,
        impostorWord: pair.impostorWord,
        imposterId: players[imposterIndex].id,
      });
      navigate('/game4/reveal');
    } catch {
      navigate('/game4/category');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 max-w-lg mx-auto w-full">
      {gameWinner && (
        <div className="w-full text-center mb-10 relative">
          <Confetti numberOfPieces={400} recycle={false} gravity={0.12} />
          <div className="relative z-10 py-6 px-4 rounded-2xl bg-gradient-to-b from-yellow-500/20 to-rose-500/10 border border-yellow-500/30">
            <p className="text-yellow-400 text-sm font-bold mb-2">🎉 انتهت اللعبة</p>
            <div className="flex flex-col items-center gap-3">
              <PlayerAvatar url={gameWinner.avatarUrl} name={gameWinner.name} size="lg" className="border-yellow-400" />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-rose-400">
                {gameWinner.name} فاز!
              </h1>
            </div>
            <p className="text-slate-300 mt-2">
              {gameWinner.score} نقطة (الهدف {winScore})
            </p>
            <Link to="/" onClick={() => resetGame()} className="inline-block mt-4">
              <Button size="md">الصفحة الرئيسية</Button>
            </Link>
          </div>
        </div>
      )}

      <Game4RoundSummary
        imposter={imposter}
        imposterId={imposterId}
        civilianWord={civilianWord}
        impostorWord={impostorWord}
        players={players}
        correctVoters={correctVoters}
        imposterSelfVote={imposterSelfVote}
        categoryLabel={categoryLabel}
        roundNumber={roundNumber}
        winScore={winScore}
        onNextRound={gameWinner ? undefined : startNextRound}
        onChangeCategory={gameWinner ? undefined : () => navigate('/game4/category')}
        showActions={!gameWinner}
      />
    </div>
  );
}
