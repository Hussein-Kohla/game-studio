import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame5Store } from '../../store/game5Store';
import { game5Packages } from '../../data/game5Questions';
import { Timer, ArrowLeft, Check, X, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const TIME_LIMIT_MS = 20000; // 20 seconds

let audioCtx: AudioContext | null = null;
const playTickSound = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
};

export default function Game5Play() {
  const navigate = useNavigate();
  const { roomCode, myPlayerId, isHost } = useGame5Store();
  
  const room = useQuery(api.game5.getRoom, roomCode ? { roomCode } : "skip");
  const submitAnswer = useMutation(api.game5.submitAnswer);
  const revealAnswers = useMutation(api.game5.revealAnswers);
  const nextQuestionMutation = useMutation(api.game5.nextQuestion);

  const [timeLeft, setTimeLeft] = useState(20);
  const [localAnswer, setLocalAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (!roomCode) navigate('/game5/setup');
    if (room?.phase === 'gameover') navigate('/game5/end');
  }, [roomCode, room?.phase, navigate]);

  const currentPackage = game5Packages.find(p => p.id === room?.selectedPackageId);
  const questionId = room?.selectedQuestionIds?.[room.currentQuestionIndex || 0];
  const question = currentPackage?.questions.find(q => q.id === questionId);

  useEffect(() => {
    // Reset local answer when question changes
    setLocalAnswer(null);
  }, [room?.currentQuestionIndex]);

  useEffect(() => {
    if (!room?.questionStartTime || room.answersRevealed) {
      if (room?.answersRevealed) setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - room.questionStartTime!;
      const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);
      const newTimeLeft = Math.ceil(remaining / 1000);
      setTimeLeft((prev) => {
        if (prev !== newTimeLeft && newTimeLeft <= 5 && newTimeLeft > 0) {
          playTickSound();
        }
        return newTimeLeft;
      });

      if (remaining <= 0) {
        clearInterval(interval);
        if (isHost && !room.answersRevealed && question) {
          revealAnswers({ roomCode: room.roomCode, correctIndex: question.correctIndex });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [room?.questionStartTime, room?.answersRevealed, isHost, question, room?.roomCode, revealAnswers]);

  const handleAnswer = async (index: number) => {
    if (localAnswer !== null || room?.answersRevealed || timeLeft <= 0 || !myPlayerId || !roomCode) return;
    
    setLocalAnswer(index);
    try {
      await submitAnswer({ roomCode, playerId: myPlayerId, answerIndex: index });
    } catch (e) {
      toast.error('حدث خطأ أثناء الإجابة');
      setLocalAnswer(null);
    }
  };

  const handleNextQuestion = () => {
    if (!isHost || !roomCode || !currentPackage || !room) return;
    const isGameOver = room.currentQuestionIndex >= (room.selectedQuestionIds?.length || 0) - 1;
    nextQuestionMutation({ roomCode, isGameOver });
  };

  if (!room || !question || !currentPackage) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col md:flex-row gap-8" dir="rtl">
      
      {/* Right Sidebar: Room Code & Players */}
      <div className="w-full md:w-1/4 flex flex-col gap-6 shrink-0">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 text-center shadow-lg">
          <h3 className="text-slate-400 text-sm font-bold mb-2">كود الغرفة</h3>
          <div className="text-5xl font-black tracking-widest text-amber-400">
            {room.roomCode}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex-1 shadow-lg overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-4">الترتيب</h3>
          <div className="flex flex-col gap-3">
            {room.players.sort((a: any, b: any) => b.score - a.score).map((p: any, index: number) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${p.id === myPlayerId ? 'border-amber-400 bg-slate-700' : 'border-slate-600 bg-slate-700/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm shadow-sm ${index === 0 && p.score > 0 ? 'bg-amber-400 text-slate-900' : index === 1 && p.score > 0 ? 'bg-slate-300 text-slate-900' : index === 2 && p.score > 0 ? 'bg-amber-700 text-white' : 'bg-slate-600 text-slate-300'}`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold truncate max-w-[120px]">{p.name}</span>
                    {p.id === room.previousWinnerId && (
                      <Crown className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                </div>
                <span className="text-amber-400 font-black text-lg">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto">
        
        {/* Category & Question Number */}
        <div className="text-center mb-8 flex flex-col items-center w-full">
          <div className="inline-block bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-6 shadow-md">
            {question.category} - سؤال {room.currentQuestionIndex + 1} / {room.selectedQuestionIds?.length || 0}
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-center md:text-right flex-1">
              {question.text}
            </h2>
            
            {/* Timer next to question */}
            <div className={`shrink-0 flex flex-col items-center justify-center border-4 rounded-[2rem] w-32 h-32 shadow-2xl transition-all duration-300 ${timeLeft <= 5 ? 'bg-red-500/20 border-red-500 animate-pulse scale-110' : 'bg-slate-800 border-emerald-500'}`}>
               <Timer className={`w-8 h-8 mb-1 ${timeLeft <= 5 ? 'text-red-400' : 'text-emerald-400'}`} />
               <span className={`text-5xl font-black tabular-nums drop-shadow-md ${timeLeft <= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                 {timeLeft}
               </span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-auto mb-12">
          {question.options.map((opt, idx) => {
            
            let bgClass = "bg-slate-800 hover:bg-slate-700 border-slate-600";
            let icon = null;

            if (room.answersRevealed) {
              if (idx === question.correctIndex) {
                bgClass = "bg-emerald-600 border-emerald-400";
                icon = <Check className="w-6 h-6" />;
              } else if (room.players.some((p: any) => p.currentAnswer === idx)) {
                bgClass = "bg-red-600 border-red-400 opacity-50";
                icon = <X className="w-6 h-6" />;
              } else {
                bgClass = "bg-slate-800 border-slate-700 opacity-30";
              }
            } else {
              if (localAnswer === idx) {
                bgClass = "bg-indigo-600 border-indigo-400 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900";
              } else if (localAnswer !== null) {
                bgClass = "bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed";
              }
            }

            // Who answered this?
            const answeringPlayers = room.answersRevealed 
              ? room.players.filter((p: any) => p.currentAnswer === idx).sort((a: any, b: any) => (a.answerTime || 0) - (b.answerTime || 0))
              : [];

            return (
              <button
                key={idx}
                disabled={localAnswer !== null || room.answersRevealed || timeLeft <= 0}
                onClick={() => handleAnswer(idx)}
                className={`relative p-6 rounded-2xl border-2 text-xl md:text-2xl font-bold transition-all duration-200 flex justify-between items-center ${bgClass}`}
              >
                <span>{opt}</span>
                {icon}

                {/* Player tags */}
                {room.answersRevealed && answeringPlayers.length > 0 && (
                  <div className="absolute -top-3 -right-2 flex flex-wrap gap-1">
                    {answeringPlayers.map((p: any, pIdx: number) => {
                      let pointsEarned = 0;
                      if (idx === question.correctIndex) {
                        if (pIdx === 0) pointsEarned = 6;
                        else if (pIdx === 1) pointsEarned = 3;
                        else if (pIdx === 2) pointsEarned = 1;
                      }
                      
                      return (
                        <div key={p.id} className={`text-xs px-2 py-1 rounded-full border shadow-sm flex items-center gap-1 ${pointsEarned > 0 ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-slate-700 text-white border-slate-500'}`}>
                          {p.name}
                          {pointsEarned > 0 && <span className="font-black">+{pointsEarned}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Host Controls */}
        {isHost && room.answersRevealed && (
          <button
            onClick={handleNextQuestion}
            className="w-full md:w-auto px-12 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xl rounded-2xl flex justify-center items-center gap-2 transition-transform hover:scale-105 shadow-xl"
          >
            {room.currentQuestionIndex >= (room.selectedQuestionIds?.length || 0) - 1 ? 'إنهاء اللعبة' : 'السؤال التالي'}
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {/* Non-host waiting text */}
        {!isHost && room.answersRevealed && (
          <div className="text-slate-400 animate-pulse text-lg">
            في انتظار الهوست للسؤال التالي...
          </div>
        )}

      </div>
    </div>
  );
}
