import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame5Store } from '../../store/game5Store';
import Confetti from 'react-confetti';
import { Trophy, Crown, ArrowRight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { playWinSound } from '../../utils/sounds';

export default function Game5End() {
  const navigate = useNavigate();
  const { roomCode, isHost, myPlayerId } = useGame5Store();
  
  const room = useQuery(api.game5.getRoom, roomCode ? { roomCode } : "skip");
  const restartToLobby = useMutation(api.game5.restartToLobby);

  useEffect(() => {
    if (!roomCode) {
      navigate('/game5/setup');
    } else {
      playWinSound();
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'lobby') {
      navigate('/game5/room');
    }
  }, [room?.phase, navigate]);

  const handleRestart = async () => {
    if (!roomCode) return;
    try {
      await restartToLobby({ roomCode });
    } catch (e) {
      toast.error('حدث خطأ أثناء إعادة اللعبة');
    }
  };

  const handleLeave = () => {
    navigate('/game5/setup');
  };

  if (!room) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">جاري التحميل...</div>;
  }

  const sortedPlayers = [...room.players].sort((a: any, b: any) => b.score - a.score);
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative" dir="rtl">
      <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
      
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen relative z-10">
        
        <div className="text-center mb-16 animate-fade-in-down">
          <Trophy className="w-24 h-24 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-lg">
            نهاية الجولة
          </h1>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 md:gap-6 w-full max-w-4xl mx-auto mb-16 h-80">
          
          {/* Second Place */}
          {second && (
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-slate-800 p-3 md:p-4 rounded-xl border-2 border-slate-300 text-center mb-4 shadow-xl min-w-[100px] md:min-w-[140px] relative">
                <span className="text-3xl mb-2 block">🥈</span>
                <p className="font-bold truncate w-full text-slate-200">{second.name}</p>
                <p className="text-slate-300 font-black">{second.score}</p>
                {second.id === myPlayerId && <span className="absolute -top-3 -right-3 bg-indigo-600 text-xs px-2 py-1 rounded-full text-white">أنت</span>}
              </div>
              <div className="w-24 md:w-32 bg-gradient-to-t from-slate-800 to-slate-400/20 h-32 rounded-t-lg border-t-4 border-slate-300 flex items-center justify-center">
                <span className="text-4xl font-black text-slate-400/50">2</span>
              </div>
            </div>
          )}

          {/* First Place */}
          {first && (
            <div className="flex flex-col items-center animate-slide-up z-10" style={{ animationDelay: '0.8s' }}>
              <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border-2 border-amber-400 text-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.3)] min-w-[120px] md:min-w-[180px] relative transform -translate-y-4">
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
                <span className="text-4xl mb-2 block">🥇</span>
                <p className="font-black text-xl truncate w-full text-amber-400">{first.name}</p>
                <p className="text-amber-200 font-black text-2xl">{first.score}</p>
                {first.id === myPlayerId && <span className="absolute -top-3 -right-3 bg-indigo-600 text-xs px-2 py-1 rounded-full text-white">أنت</span>}
              </div>
              <div className="w-28 md:w-40 bg-gradient-to-t from-slate-800 to-amber-500/20 h-48 rounded-t-lg border-t-4 border-amber-400 flex items-center justify-center">
                <span className="text-6xl font-black text-amber-500/50">1</span>
              </div>
            </div>
          )}

          {/* Third Place */}
          {third && (
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-slate-800 p-3 md:p-4 rounded-xl border-2 border-amber-700 text-center mb-4 shadow-xl min-w-[100px] md:min-w-[140px] relative">
                <span className="text-3xl mb-2 block">🥉</span>
                <p className="font-bold truncate w-full text-amber-600">{third.name}</p>
                <p className="text-amber-700 font-black">{third.score}</p>
                {third.id === myPlayerId && <span className="absolute -top-3 -right-3 bg-indigo-600 text-xs px-2 py-1 rounded-full text-white">أنت</span>}
              </div>
              <div className="w-24 md:w-32 bg-gradient-to-t from-slate-800 to-amber-700/20 h-20 rounded-t-lg border-t-4 border-amber-700 flex items-center justify-center">
                <span className="text-3xl font-black text-amber-700/50">3</span>
              </div>
            </div>
          )}
          
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in" style={{ animationDelay: '1.5s' }}>
          {isHost && (
            <button
              onClick={handleRestart}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xl rounded-2xl flex justify-center items-center gap-3 transition-transform hover:scale-105 shadow-xl"
            >
              <RotateCcw className="w-6 h-6" />
              لعب جولة أخرى
            </button>
          )}
          <button
            onClick={handleLeave}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-2xl flex justify-center items-center gap-3 transition-colors border border-slate-700"
          >
            <ArrowRight className="w-5 h-5" />
            خروج من الغرفة
          </button>
        </div>

        {!isHost && (
          <p className="mt-8 text-slate-400 animate-pulse">
            في انتظار المضيف لقرار الجولة القادمة...
          </p>
        )}

      </div>
    </div>
  );
}
