import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import { useGame1Store } from '../../store/game1Store';
import { Card } from '../../components/ui/Card';
import Confetti from 'react-confetti';
import { playWinSound } from '../../utils/sounds';
import { useEffect } from 'react';

export function Game1Board() {
  const { teams, boxes, currentTeamIndex, selectedGroupId } = useGame1Store();
  const navigate = useNavigate();

  const isGameOver = boxes.every(b => b.isUsed);

  useEffect(() => {
    if (isGameOver) {
      playWinSound();
    }
  }, [isGameOver]);

  if (teams.length === 0 || selectedGroupId === null) {
    navigate('/game1/setup');
    return null;
  }

  const currentTeam = teams[currentTeamIndex];

  const handleBoxClick = (boxId: number, isUsed: boolean) => {
    if (isUsed) return;
    navigate(`/game1/challenge?box=${boxId}`);
  };

  if (isGameOver) {
    const winner = [...teams].sort((a, b) => b.score - a.score)[0];
    const isTie = teams[0].score === teams[1].score;
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
        <Confetti numberOfPieces={400} recycle={false} gravity={0.15} />
        <h1 className="text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-lg z-10">
          {isTie ? 'تعادل!' : `الفائز هو ${winner.name}!`}
        </h1>
        <p className="text-2xl text-slate-300 mb-12 z-10">
          النتيجة النهائية: {teams[0].score} مقابل {teams[1].score}
        </p>
        <button
          onClick={() => {
            useGame1Store.getState().resetGame();
            navigate('/');
          }}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-xl backdrop-blur-md border border-white/20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] z-10"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
      {/* Scoreboard */}
      <div className="flex justify-between items-center mb-10 gap-4">
        {teams.map((team, index) => {
          const isCurrent = index === currentTeamIndex;
          const isGreen = team.color === 'green';
          return (
            <Card 
              key={team.id} 
              glow={isCurrent ? (isGreen ? 'green' : 'red') : 'none'}
              className={`flex-1 flex flex-col items-center justify-center p-4 transition-all duration-500 ${
                isCurrent ? 'scale-105 border-white/30' : 'opacity-70 scale-95'
              }`}
            >
              <h3 className={`text-2xl font-bold ${isGreen ? 'text-green-400' : 'text-red-400'}`}>
                {team.name}
              </h3>
              <div className="text-4xl font-black text-white mt-2">{team.score}</div>
            </Card>
          );
        })}
      </div>

      {/* Current Turn Indicator */}
      <motion.div 
        key={currentTeam.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center mb-8 text-2xl font-bold ${
          currentTeam.color === 'green' ? 'text-green-400' : 'text-red-400'
        }`}
      >
        دور {currentTeam.name}
      </motion.div>

      {/* Board Grid */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 flex-1 place-content-center">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            whileHover={!box.isUsed ? { scale: 1.05 } : {}}
            whileTap={!box.isUsed ? { scale: 0.95 } : {}}
            onClick={() => handleBoxClick(box.id, box.isUsed)}
            className={`
              relative flex flex-col items-center justify-center aspect-square rounded-2xl cursor-pointer transition-all duration-300
              ${box.isUsed 
                ? 'bg-[#111827]/50 border border-white/5 opacity-50 cursor-not-allowed' 
                : 'glass-panel hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }
            `}
          >
            <div className="text-5xl md:text-7xl font-black opacity-20 absolute">{box.id}</div>
            {box.isUsed ? (
              <Unlock className="w-12 h-12 text-slate-500 z-10" />
            ) : (
              <Lock className="w-12 h-12 text-white z-10 drop-shadow-lg" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
