import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame3Store, CATEGORY_META } from '../../store/game3Store';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function Game3Reveal() {
  const { roomCode, myPlayerId } = useGame3Store();
  const room = useQuery(api.game3.getRoom, roomCode ? { roomCode } : "skip");
  // @ts-ignore
  const setSecretCardMut = useMutation(api.game3.setSecretCard);
  // @ts-ignore
  const startTurnsMut = useMutation(api.game3.startTurns);
  // @ts-ignore
  const startRevealMut = useMutation(api.game3.startReveal);
  
  const [revealCountdown, setRevealCountdown] = useState(30);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomCode) { navigate('/game3/setup'); return; }
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'turns') { navigate('/game3/play'); return; }
  }, [room?.phase, navigate]);

  if (!room) return <div className="p-10 text-white text-center">جاري التحميل...</div>;

  const me = room.players.find((p: any) => p.id === myPlayerId);
  const isHost = me?.isHost ?? false;
  const myTeam = me?.team ?? 'red';
  const mySecretCardId = room.secretCards[myTeam];
  const mySecretCard = room.cards.find((c: any) => c.id === mySecretCardId);
  const { cards, selectedCategory } = room;
  const meta = selectedCategory ? CATEGORY_META[selectedCategory as keyof typeof CATEGORY_META] : null;

  // Auto-start reveal when category is selected
  useEffect(() => {
    if (room?.phase === 'category' && selectedCategory && isHost) {
      startRevealMut({ roomCode: roomCode! });
    }
  }, [room?.phase, selectedCategory, isHost, roomCode]);

  // Update countdown
  useEffect(() => {
    if (room?.revealStartTime) {
      const elapsed = Math.floor((Date.now() - room.revealStartTime) / 1000);
      setRevealCountdown(Math.max(0, 30 - elapsed));
      
      const interval = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - room.revealStartTime!) / 1000);
        setRevealCountdown(Math.max(0, 30 - currentElapsed));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [room?.revealStartTime]);

  useEffect(() => {
    if (revealCountdown <= 0 && isHost && room?.phase === 'reveal') {
      startTurnsMut({ roomCode: roomCode! });
    }
  }, [revealCountdown, isHost, room?.phase, roomCode]);

  const progress = revealCountdown / 30;
  const isLow = revealCountdown <= 10;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {meta && (
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl`}>
              {meta.icon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-black text-white">اختر كارتك السري!</h2>
            <p className="text-slate-400 text-sm">سيتم اختيار كارت عشوائي إذا انتهى الوقت</p>
          </div>
        </div>

        {/* Countdown */}
        <div className={`flex flex-col items-center px-6 py-3 rounded-2xl border transition-all ${
          isLow ? 'border-red-500/60 bg-red-500/10 animate-pulse' : 'border-white/10 bg-white/5'
        }`}>
          <span className="text-slate-400 text-xs mb-1">الوقت المتبقي</span>
          <span className={`text-4xl font-black tabular-nums ${isLow ? 'text-red-400' : 'text-white'}`}>
            {String(revealCountdown).padStart(2, '0')}
          </span>
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-orange-400'}`}
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Selected Card Panel */}
        <div className="w-full md:w-64 shrink-0 flex flex-col items-center justify-center bg-black/20 rounded-3xl border border-white/5 p-6">
          <h3 className="text-xl font-bold text-white mb-6">كارتك السري</h3>
          <AnimatePresence mode="wait">
            {mySecretCard ? (
              <motion.div
                key={mySecretCard.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="w-full aspect-[3/4] max-w-[200px] rounded-2xl bg-gradient-to-br from-[#1a2235] to-[#0f1623] border-2 border-orange-500 flex flex-col items-center justify-center p-4 shadow-[0_0_30px_rgba(249,115,22,0.3)] mx-auto"
              >
                <div className="text-6xl mb-4">{meta?.icon}</div>
                <span className="text-white font-black text-2xl text-center leading-tight">{mySecretCard.label}</span>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full aspect-[3/4] max-w-[200px] rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500 text-center p-4 mx-auto"
              >
                اضغط على كارت لاختياره
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cards Grid: 4 rows × 6 cols */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 flex-1 content-start">
          {cards.map((card: any, i: number) => {
            const isSelected = card.id === mySecretCardId;
            return (
              <motion.div
                key={card.id}
                onClick={() => setSecretCardMut({ roomCode: roomCode!, team: myTeam, cardId: card.id })}
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-2 shadow-lg transition-all cursor-pointer hover:scale-105 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-orange-500/40 to-red-600/40 border-2 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                    : 'bg-gradient-to-br from-[#1a2235] to-[#0f1623] border border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-1">{meta?.icon}</div>
                <span className="text-white font-bold text-xs text-center leading-tight">{card.label}</span>
                <div className="mt-1 text-[10px] text-slate-500">#{i + 1}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center text-slate-400 text-sm">
        {cards.length} كارت — {isLow ? '⚠️ الوقت ينتهي!' : 'اختر كارتك السري 🧠'}
      </div>
    </div>
  );
}