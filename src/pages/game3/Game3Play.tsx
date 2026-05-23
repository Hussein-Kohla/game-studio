
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame3Store, CATEGORY_META } from '../../store/game3Store';
import type { CardItem } from '../../store/game3Store';
export function Game3Play() {
  const {
    roomCode, myPlayerId,
    isGuessingMode, toggleGuessMode,
    guessCardId: guessConfirm,
    setGuessCardId: setGuessConfirm
  } = useGame3Store();
  
  const room = useQuery(api.game3.getRoom, roomCode ? { roomCode } : "skip");
  
  // @ts-ignore
  const flipCardMut = useMutation(api.game3.flipCard);
  const guessCardMut = useMutation(api.game3.guessCard);
  const endTurnMut = useMutation(api.game3.endTurn);
  const resetGameMut = useMutation(api.game3.resetGame);

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomCode) navigate('/game3/setup');
  }, [roomCode, navigate]);

  // Navigate to appropriate phase if room phase changed
  useEffect(() => {
    if (room?.phase === 'reveal') navigate('/game3/reveal');
    if (room?.phase === 'category' || room?.phase === 'lobby') navigate('/game3/room');
  }, [room?.phase, navigate]);

  if (!room) return <div className="p-10 text-white text-center">جاري التحميل...</div>;

  const { cards, scores, currentTurn, players, selectedCategory, phase, secretCards, eliminatedCards, winner } = room;

  // @ts-ignore
  const me = players.find(p => p.id === myPlayerId);
  const myTeam = me?.team ?? 'red';
  const isMyTurn = myTeam === currentTurn;

  const meta = selectedCategory ? CATEGORY_META[selectedCategory as keyof typeof CATEGORY_META] : null;

  // @ts-ignore
  const redTeam = players.find(p => p.team === 'red');
  // @ts-ignore
  const greenTeam = players.find(p => p.team === 'green');

  // @ts-ignore
  const mySecretCardId = secretCards[myTeam];
  // @ts-ignore
  const mySecretCard = cards.find(c => c.id === mySecretCardId);

  const handleCardClick = (cardId: string) => {
    if (isGuessingMode) {
      if (!isMyTurn) return;
      setGuessConfirm(cardId);
    } else {
      // Toggle eliminated state (local to team)
      flipCardMut({ roomCode: roomCode!, team: myTeam, cardId });
    }
  };

  const confirmGuess = () => {
    if (!guessConfirm) return;
    guessCardMut({ roomCode: roomCode!, guessingTeam: myTeam, cardId: guessConfirm });
    setGuessConfirm(null);
  };

  if (phase === 'gameover') {
    const winnerName = winner === 'red' ? redTeam?.name : winner === 'green' ? greenTeam?.name : null;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Confetti numberOfPieces={350} recycle={false} gravity={0.12} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            {winner ? `${winnerName} فاز!` : 'تعادل!'}
          </h1>
          <div className="flex gap-8 justify-center mb-10">
            <div className="text-center">
              <div className="text-red-400 font-bold text-lg mb-1">{redTeam?.name ?? 'الأحمر'}</div>
              <div className="text-5xl font-black text-white">{scores.red}</div>
            </div>
            <div className="text-slate-500 text-4xl font-black self-center">—</div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg mb-1">{greenTeam?.name ?? 'الأخضر'}</div>
              <div className="text-5xl font-black text-white">{scores.green}</div>
            </div>
          </div>
          <button
            onClick={() => { resetGameMut({ roomCode: roomCode! }); navigate('/'); }}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xl px-10 py-4 rounded-2xl transition-all"
          >
            العودة للرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">

      {/* Scoreboard */}
      <div className="flex gap-3 mb-4">
        {/* Red team */}
        <div className={`flex-1 flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-500 ${
          currentTurn === 'red'
            ? 'border-red-500/60 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.25)] scale-[1.02]'
            : 'border-white/10 bg-white/5 opacity-60'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <div>
              <div className="text-red-300 font-bold text-lg">{redTeam?.name ?? 'الأحمر'}</div>
              {currentTurn === 'red' && <div className="text-red-400/70 text-xs animate-pulse">● الدور</div>}
            </div>
          </div>
          <div className="text-4xl font-black text-white">{scores.red}</div>
        </div>

        {/* center info */}
        <div className="flex flex-col items-center justify-center px-4">
          <div className="text-xs text-slate-400 mb-1">كارتك السري</div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a2235] to-[#0f1623] border border-orange-500/50 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <div className="text-lg leading-none">{meta?.icon}</div>
            <div className="text-[9px] font-bold text-white mt-1">{mySecretCard?.label}</div>
          </div>
        </div>

        {/* Green team */}
        <div className={`flex-1 flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-500 ${
          currentTurn === 'green'
            ? 'border-green-500/60 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.25)] scale-[1.02]'
            : 'border-white/10 bg-white/5 opacity-60'
        }`}>
          <div className="text-4xl font-black text-white">{scores.green}</div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-green-300 font-bold text-lg text-right">{greenTeam?.name ?? 'الأخضر'}</div>
              {currentTurn === 'green' && <div className="text-green-400/70 text-xs animate-pulse text-right">● الدور</div>}
            </div>
            <div className="w-4 h-4 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTurn}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`text-center py-2 mb-3 rounded-xl font-bold text-lg ${
            currentTurn === 'red' ? 'text-red-300' : 'text-green-300'
          }`}
        >
          {isMyTurn ? (
            isGuessingMode
              ? '🎯 اختار الكارت اللي هتخمنه'
              : '👆 اقلب الكروت اللي تعرفها — أو اضغط توقع'
          ) : (
            `⏳ دور فريق ${currentTurn === 'red' ? redTeam?.name : greenTeam?.name}`
          )}
        </motion.div>
      </AnimatePresence>

      {/* Cards Grid 4×6 */}
      <div className="grid grid-cols-6 gap-2 flex-1">
        {cards.map((card: CardItem, i: number) => {
          const isEliminated = eliminatedCards[myTeam].includes(card.id);
          const isSelected = guessConfirm === card.id;

          return (
            <motion.div
              key={card.id}
              layout
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-1.5 relative overflow-hidden transition-all duration-300
                ${isEliminated
                  ? 'bg-black/50 border border-white/5 opacity-30 grayscale cursor-pointer'
                  : isSelected
                    ? 'border-2 border-yellow-400 bg-yellow-500/15 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105 cursor-pointer'
                    : isGuessingMode && isMyTurn
                      ? 'border border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-400/70 hover:scale-105 cursor-pointer'
                      : 'border border-white/10 bg-gradient-to-br from-[#1a2235] to-[#0f1623] hover:border-white/30 hover:bg-[#1e2a40] cursor-pointer hover:scale-105'
                }
              `}
            >
              {/* number tag */}
              <div className="absolute top-1 left-1 text-[9px] text-slate-600 font-mono">
                {i + 1}
              </div>

              <div className="text-xl mb-1">{meta?.icon}</div>
              <span className="text-white font-bold text-[11px] text-center leading-tight">{card.label}</span>
              {isSelected && <div className="text-yellow-400 text-xs mt-1 animate-bounce">؟</div>}
              {isEliminated && <div className="absolute inset-0 flex items-center justify-center text-red-500/50 text-4xl font-black">X</div>}
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-3 justify-center flex-wrap"
        >
          {!isGuessingMode ? (
            <>
              <button
                onClick={toggleGuessMode}
                className="px-6 py-3 rounded-xl font-bold text-white bg-yellow-500/20 border border-yellow-500/40 hover:bg-yellow-500/30 hover:border-yellow-400/70 transition-all text-lg"
              >
                🎯 توقع
              </button>
              <button
                onClick={() => endTurnMut({ roomCode: roomCode! })}
                className="px-6 py-3 rounded-xl font-bold text-white bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 hover:border-red-400/70 transition-all text-lg"
              >
                ✅ إنهاء الدور
              </button>
            </>
          ) : (
            <>
              {guessConfirm ? (
                <>
                  <button
                    onClick={confirmGuess}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 transition-all text-lg"
                  >
                    ✅ تأكيد التوقع
                  </button>
                  <button
                    onClick={() => setGuessConfirm(null)}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 transition-all text-lg"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleGuessMode}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 transition-all text-lg"
                >
                  ✕ إلغاء التوقع
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-3 flex gap-4 justify-center text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-white/30 inline-block" /> متاح</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-black/50 border border-white/10 inline-block" /> مستبعد</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400 inline-block" /> وضع التوقع</span>
      </div>

      {/* Confirm guess modal overlay */}
      <AnimatePresence>
        {guessConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#111827] border border-yellow-500/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]"
            >
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-black text-white mb-2">تأكيد التوقع</h3>
              <p className="text-slate-400 mb-2">اخترت كارت:</p>
              <div className="text-3xl font-black text-yellow-300 mb-2">
                {cards.find((c: { id: string }) => c.id === guessConfirm)?.label}
              </div>
              <p className="text-slate-500 text-sm mb-6">لو صح ✅ بتفوز. لو غلط ❌ بينتهي دورك.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setGuessConfirm(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-white/5 border border-white/15 hover:bg-white/10 transition-all"
                >
                  تراجع
                </button>
                <button
                  onClick={confirmGuess}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  توقع! 🎯
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
