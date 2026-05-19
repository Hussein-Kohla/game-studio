import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGame2Store } from '../../store/game2Store';
import { playCorrectSound, playWrongSound } from '../../utils/sounds';



// Alarm bell sound
function playAlarmSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch { /* silent fallback */ }
}

export function Game2Play() {
  const { teams, currentTeamIndex, addScore, nextTurn } = useGame2Store();
  const navigate = useNavigate();
  const currentTeam = teams[currentTeamIndex];

  // Fetch and delete random word from Convex DB
  const popWord = useMutation(api.words.popRandomWord);

  // Active word — prefer DB, fallback to local
  const [wordData, setWordData] = useState<{ word: string; forbiddenWords: string[] } | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [fromDB, setFromDB] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchWord = async () => {
    setWordData(null);
    setIsEmpty(false);
    try {
      const dbWord = await popWord({ lang: 'ar' });
      if (dbWord) {
        setWordData({ word: dbWord.word, forbiddenWords: dbWord.forbiddenWords });
        setFromDB(true);
      } else {
        toast.error("نفدت الكلمات من قاعدة البيانات! قم بتشغيل سكريبت التوليد.", { icon: '⚠️' });
        setIsEmpty(true);
      }
    } catch (e) {
      toast.error("حدث خطأ في الاتصال بقاعدة البيانات.", { icon: '❌' });
      setIsEmpty(true);
    }
    setAnimKey(k => k + 1);
  };

  // Set initial word
  useEffect(() => {
    if (!wordData) fetchWord();
  }, []);

  // Timer state
  const [timerMins, setTimerMins] = useState(1);
  const [timerSecs, setTimerSecs] = useState(30);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = { current: null as ReturnType<typeof setInterval> | null };

  const totalSeconds = timerMins * 60 + timerSecs;

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) return 0;
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          playAlarmSound();
          toast('انتهى الوقت!', { icon: '⏰', duration: 4000 });
          return 0;
        }
        if (prev <= 6) playWrongSound();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const resetTimer = () => { stopTimer(); setTimeLeft(null); };
  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
    } else {
      setTimeLeft(prev => prev !== null ? prev : totalSeconds);
      setIsRunning(true);
    }
  };

  const displayTime = timeLeft !== null ? timeLeft : totalSeconds;
  const displayMins = Math.floor(displayTime / 60);
  const displaySecs = displayTime % 60;
  const isLow = timeLeft !== null && timeLeft <= 10 && timeLeft > 0;
  const isDone = timeLeft === 0;

  if (teams.length === 0) {
    navigate('/game2/setup');
    return null;
  }

  const loadNextWord = () => {
    fetchWord();
  };

  const handleCorrect = () => {
    playCorrectSound();
    addScore(currentTeam.id, 1);
    toast.success('إجابة صحيحة!', { icon: '👏' });
    loadNextWord();
  };

  const handleNewWord = () => {
    playWrongSound();
    loadNextWord();
  };

  const handleEndTurn = () => {
    stopTimer();
    resetTimer();
    nextTurn();
    loadNextWord();
    toast('انتهى الدور!', { icon: '🔄' });
  };

  const isBlue = currentTeam.color === 'blue';

  return (
    <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">

      {/* Scoreboard */}
      <div className="flex justify-between items-center mb-6 gap-4">
        {teams.map((team, index) => {
          const isCurrent = index === currentTeamIndex;
          const teamIsBlue = team.color === 'blue';
          return (
            <div
              key={team.id}
              className={`flex-1 p-4 rounded-xl text-center transition-all ${
                isCurrent
                  ? `bg-white/10 border-2 ${teamIsBlue ? 'border-blue-500' : 'border-purple-500'}`
                  : 'bg-white/5 border border-white/10 opacity-60'
              }`}
            >
              <h3 className={`text-xl font-bold ${teamIsBlue ? 'text-blue-400' : 'text-purple-400'}`}>{team.name}</h3>
              <p className="text-3xl font-black">{team.score}</p>
            </div>
          );
        })}
      </div>

      {/* Timer Widget */}
      <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className={`text-4xl ${isDone ? 'animate-bounce' : isLow ? 'animate-pulse' : ''}`}>⏰</span>
          <div className={`text-5xl font-black tabular-nums transition-colors ${
            isDone ? 'text-red-400' : isLow ? 'text-orange-400 animate-pulse' : 'text-white'
          }`}>
            {String(displayMins).padStart(2, '0')}:{String(displaySecs).padStart(2, '0')}
          </div>
        </div>

        {!isRunning && timeLeft === null && (
          <div className="flex items-center gap-2 text-slate-300">
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">دقائق</span>
              <input type="number" min={0} max={9} value={timerMins}
                onChange={e => setTimerMins(Math.max(0, Math.min(9, Number(e.target.value))))}
                className="w-14 text-center bg-black/40 border border-white/20 rounded-lg p-2 text-xl font-bold text-white outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-2xl font-black mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">ثواني</span>
              <input type="number" min={0} max={59} value={timerSecs}
                onChange={e => setTimerSecs(Math.max(0, Math.min(59, Number(e.target.value))))}
                className="w-14 text-center bg-black/40 border border-white/20 rounded-lg p-2 text-xl font-bold text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={toggleTimer} disabled={isDone}
            className={`px-5 py-2 rounded-xl font-bold text-white transition-all ${
              isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
            } disabled:opacity-40`}>
            {isRunning ? '⏸ إيقاف' : '▶ بدء'}
          </button>
          {(isRunning || timeLeft !== null) && (
            <button onClick={resetTimer}
              className="px-4 py-2 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-all">
              ↺
            </button>
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-300">
          دور فريق:{' '}
          <span className={isBlue ? 'text-blue-400' : 'text-purple-400'}>{currentTeam.name}</span>
        </h2>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <Card glow={currentTeam.color as 'blue' | 'purple'} className="flex flex-col items-center p-8 bg-[#111827]">
              {!wordData && !isEmpty ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400">جاري تحميل الكلمة...</p>
                </div>
              ) : isEmpty ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center">
                  <span className="text-6xl mb-2">⚠️</span>
                  <h2 className="text-2xl font-bold text-red-400">نفدت الكلمات!</h2>
                  <p className="text-slate-400">قاعدة البيانات فارغة. الرجاء تشغيل سكريبت التوليد لإضافة كلمات جديدة.</p>
                </div>
              ) : wordData ? (
                <>
                  <div className="mb-8 text-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      الكلمة المطلوب شرحها
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-md">
                      {wordData.word}
                    </h1>
                    {fromDB && (
                      <p className="text-xs text-green-400/60 mt-2">✨ مولّدة بالذكاء الاصطناعي</p>
                    )}
                  </div>
                  <div className="w-full border-t border-white/10 pt-6">
                    <span className="text-sm font-bold text-red-400 block mb-4 text-center">
                      الكلمات الممنوعة (لا تستخدمها!)
                    </span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {wordData.forbiddenWords.map((fw, i) => (
                        <span key={i} className="bg-red-500/20 text-red-200 px-4 py-2 rounded-full font-bold border border-red-500/30">
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center gap-4">
        <Button variant="danger" size="lg" onClick={handleEndTurn}>إنهاء الدور</Button>
        <Button variant="ghost" size="lg"
          className="border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
          onClick={handleNewWord}>
          🔄 كلمة جديدة
        </Button>
        <Button variant="primary" size="lg" onClick={handleCorrect}>إجابة صحيحة</Button>
      </div>
    </div>
  );
}
