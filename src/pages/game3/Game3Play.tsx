
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame3Store, CATEGORY_META } from '../../store/game3Store';
import { useCardImages } from '../../hooks/useCardImages';

type TurnMode = null | 'question' | 'guess';

export function Game3Play() {
  const { roomCode, myPlayerId } = useGame3Store();

  const room = useQuery(api.game3.getRoom, roomCode ? { roomCode } : 'skip');

  // @ts-ignore
  const flipCardMut  = useMutation(api.game3.flipCard);
  const guessCardMut = useMutation(api.game3.guessCard);
  const endTurnMut   = useMutation(api.game3.endTurn);
  const resetGameMut = useMutation(api.game3.resetGame);

  const navigate = useNavigate();

  const [turnMode, setTurnMode]         = useState<TurnMode>(null);
  const [guessConfirm, setGuessConfirm] = useState<string | null>(null);
  const [isFlipped, setIsFlipped]       = useState(false);

  useEffect(() => {
    if (!roomCode) navigate('/game3/setup');
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'reveal') navigate('/game3/reveal');
    if (room?.phase === 'category' || room?.phase === 'lobby') navigate('/game3/room');
  }, [room?.phase, navigate]);

  // Reset local turn state whenever the active turn changes
  useEffect(() => {
    setTurnMode(null);
    setGuessConfirm(null);
  }, [room?.currentTurn]);

  if (!room) return <div className="p-10 text-white text-center">جاري التحميل...</div>;

  const { cards, scores, currentTurn, players, selectedCategory, phase, secretCards, eliminatedCards, winner } = room;

  // @ts-ignore
  const me = players.find(p => p.id === myPlayerId);
  const myTeam   = me?.team ?? 'red';
  const isMyTurn = myTeam === currentTurn;

  const meta = selectedCategory ? CATEGORY_META[selectedCategory as keyof typeof CATEGORY_META] : null;

  // @ts-ignore
  const redTeam   = players.find(p => p.team === 'red');
  // @ts-ignore
  const greenTeam = players.find(p => p.team === 'green');

  // @ts-ignore
  const mySecretCardId = secretCards[myTeam];
  // @ts-ignore
  const mySecretCard   = cards.find(c => c.id === mySecretCardId);

  /* ── Wikipedia images for all cards ── */
  const cardLabels = (cards as { label: string }[]).map(c => c.label);
  const cardImages = useCardImages(cardLabels);
  const secretImgUrl = mySecretCard ? cardImages[mySecretCard.label] : undefined;

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;
    if (turnMode === 'guess') {
      setGuessConfirm(prev => (prev === cardId ? null : cardId));
    } else if (turnMode === 'question') {
      flipCardMut({ roomCode: roomCode!, team: myTeam, cardId });
    }
  };

  const confirmGuess = () => {
    if (!guessConfirm) return;
    guessCardMut({ roomCode: roomCode!, guessingTeam: myTeam, cardId: guessConfirm });
    setGuessConfirm(null);
    setTurnMode(null);
  };

  const handleEndTurn = () => {
    endTurnMut({ roomCode: roomCode! });
    setTurnMode(null);
    setGuessConfirm(null);
  };

  /* ── Game-over screen ─────────────────────────────────────────────────── */

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

  /* ── Turn indicator text ─────────────────────────────────────────────── */

  const turnIndicatorText = () => {
    if (!isMyTurn) return `⏳ دور فريق ${currentTurn === 'red' ? redTeam?.name : greenTeam?.name}`;
    if (turnMode === null)       return '🎮 اختار نوع دورك';
    if (turnMode === 'question') return '❓ اقلب الكروت اللي تعرفها — ثم إنهي دورك';
    if (turnMode === 'guess')    return '🎯 اختار الكارت اللي هتتوقعه';
    return '';
  };

  /* ── Main render ──────────────────────────────────────────────────────── */

  return (
    <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">

      {/* ── Scoreboard ── */}
      <div className="flex gap-3 mb-3">
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

      {/* ── Turn indicator ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentTurn}-${turnMode}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={`text-center py-2 mb-3 rounded-xl font-bold text-base ${
            currentTurn === 'red' ? 'text-red-300' : 'text-green-300'
          }`}
        >
          {turnIndicatorText()}
        </motion.div>
      </AnimatePresence>

      {/* ── Cards grid + Secret card sidebar ── */}
      <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">

        {/* Cards Grid — responsive columns */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 md:gap-2 flex-1 content-start">
          {cards.map((card: { id: string; label: string }, i: number) => {
            // @ts-ignore
            const isEliminated = eliminatedCards[myTeam].includes(card.id);
            const isSelected   = guessConfirm === card.id;
            const isGuessMode  = turnMode === 'guess';
            const imgUrl       = cardImages[card.label];

            return (
              <div key={card.id} className="flex flex-col">
                <motion.div
                  layout
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    aspect-[3/4] rounded-xl relative overflow-hidden transition-all duration-300
                    ${isEliminated
                      ? 'opacity-25 grayscale cursor-pointer'
                      : isSelected
                        ? 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105 cursor-pointer'
                        : isGuessMode && isMyTurn
                          ? 'ring-1 ring-yellow-500/50 hover:ring-yellow-400 hover:scale-105 cursor-pointer'
                          : turnMode === 'question' && isMyTurn
                            ? 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 cursor-pointer'
                            : 'ring-1 ring-white/10'
                    }
                  `}
                >
                  {/* Photo or fallback bg */}
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={card.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2235] to-[#0f1623] flex items-center justify-center text-2xl">
                      {meta?.icon}
                    </div>
                  )}

                  {/* Number tag */}
                  <div className="absolute top-1 left-1 text-[7px] text-white/40 font-mono">#{i + 1}</div>

                  {/* Guess selection indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-yellow-500/20 flex items-start justify-end p-1">
                      <div className="text-yellow-400 text-sm animate-bounce">؟</div>
                    </div>
                  )}

                  {/* Eliminated X */}
                  {isEliminated && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500/60 text-4xl font-black bg-black/40">
                      ✕
                    </div>
                  )}
                </motion.div>

                {/* Label BELOW the image */}
                <span className="text-white/90 font-bold text-[9px] md:text-[10px] text-center mt-1 leading-tight block truncate px-0.5">
                  {card.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Secret card sidebar ── */}
        <div className="md:w-44 shrink-0 flex flex-row md:flex-col items-center gap-3 justify-center md:justify-start">
          <h3 className="hidden md:block text-base font-black text-white">كارتك السري</h3>

          {/* 3-D flip card */}
          <div className="w-28 md:w-full shrink-0" style={{ perspective: '1000px', aspectRatio: '3/4' }}>
            <motion.div
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
            >
              {/* Back face */}
              <div
                onClick={() => mySecretCard && setIsFlipped(true)}
                style={{ backfaceVisibility: 'hidden' }}
                className={`absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 p-3
                  bg-gradient-to-br from-[#111827] to-[#0c1220]
                  ${mySecretCard
                    ? 'border-orange-500/60 shadow-[0_0_35px_rgba(249,115,22,0.2)] cursor-pointer'
                    : 'border-white/10 cursor-default'
                  }`}
              >
                <div className="grid grid-cols-3 gap-1.5 opacity-10">
                  {Array.from({ length: 9 }).map((_, k) => (
                    <div key={k} className="w-3 h-3 rounded-full bg-orange-400" />
                  ))}
                </div>
                <div className="text-3xl opacity-20">🎴</div>
                <div className="text-xs text-white/20 font-semibold tracking-wide">مقلوب</div>
              </div>

              {/* Front face — shows Wikipedia image */}
              <div
                onClick={() => setIsFlipped(false)}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 rounded-3xl border-2 border-orange-500 overflow-hidden
                  shadow-[0_0_40px_rgba(249,115,22,0.35)] cursor-pointer"
              >
                {secretImgUrl ? (
                  <>
                    <img
                      src={secretImgUrl}
                      alt={mySecretCard?.label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                      <span className="text-white font-black text-sm leading-tight drop-shadow-lg">
                        {mySecretCard?.label}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a2235] to-[#0f1623] flex flex-col items-center justify-center gap-3 p-4">
                    <div className="text-5xl">{meta?.icon}</div>
                    <div className="text-base font-black text-white text-center leading-tight px-1">
                      {mySecretCard?.label ?? '—'}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Lock button + legend */}
          <div className="flex md:flex-col items-center gap-2">
            <motion.button
              onClick={() => mySecretCard && setIsFlipped(f => !f)}
              whileHover={mySecretCard ? { scale: 1.12 } : {}}
              whileTap={mySecretCard ? { scale: 0.93 } : {}}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl transition-all duration-300
                ${isFlipped
                  ? 'bg-green-500/20 border-2 border-green-400/70 shadow-[0_0_18px_rgba(34,197,94,0.35)]'
                  : 'bg-orange-500/15 border-2 border-orange-500/50 shadow-[0_0_18px_rgba(249,115,22,0.2)]'
                }
                ${!mySecretCard ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isFlipped ? '🔓' : '🔒'}
            </motion.button>
            <p className="text-[10px] text-slate-500 text-center">
              {isFlipped ? 'إخفاء' : 'كشف'}
            </p>
          </div>

          {/* Mini legend — desktop only */}
          <div className="hidden md:flex mt-auto flex-col gap-1 text-[10px] text-slate-500 w-full">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-white/30 inline-block shrink-0" /> متاح</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-black/50 border border-white/10 inline-block shrink-0" /> مستبعد</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400 inline-block shrink-0" /> توقع</span>
          </div>
        </div>
      </div>

      {/* ── Action zone ── */}
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-3 justify-center flex-wrap"
        >
          {/* Step 1 — pick a mode */}
          {turnMode === null && (
            <>
              <button
                id="btn-mode-question"
                onClick={() => setTurnMode('question')}
                className="px-7 py-3 rounded-xl font-bold text-white bg-blue-500/20 border border-blue-500/40
                           hover:bg-blue-500/30 hover:border-blue-400/70 transition-all text-lg"
              >
                ❓ اسأل وإقصي
              </button>
              <button
                id="btn-mode-guess"
                onClick={() => setTurnMode('guess')}
                className="px-7 py-3 rounded-xl font-bold text-white bg-yellow-500/20 border border-yellow-500/40
                           hover:bg-yellow-500/30 hover:border-yellow-400/70 transition-all text-lg"
              >
                🎯 توقع
              </button>
            </>
          )}

          {/* Step 2a — question mode: flip cards → end turn */}
          {turnMode === 'question' && (
            <>
              <button
                id="btn-end-turn"
                onClick={handleEndTurn}
                className="px-7 py-3 rounded-xl font-bold text-white bg-green-500/20 border border-green-500/40
                           hover:bg-green-500/30 hover:border-green-400/70 transition-all text-lg"
              >
                ✅ إنهاء الدور
              </button>
              <button
                id="btn-back-question"
                onClick={() => setTurnMode(null)}
                className="px-5 py-3 rounded-xl font-bold text-white bg-white/5 border border-white/15
                           hover:bg-white/10 transition-all text-sm"
              >
                ↩ رجوع
              </button>
            </>
          )}

          {/* Step 2b — guess mode: pick a card → confirm */}
          {turnMode === 'guess' && (
            <>
              {guessConfirm ? (
                <>
                  <button
                    id="btn-confirm-guess"
                    onClick={confirmGuess}
                    className="px-7 py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-400
                               transition-all text-lg shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  >
                    ✅ تأكيد التوقع
                  </button>
                  <button
                    id="btn-cancel-guess"
                    onClick={() => setGuessConfirm(null)}
                    className="px-5 py-3 rounded-xl font-bold text-white bg-white/5 border border-white/15
                               hover:bg-white/10 transition-all text-sm"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <button
                  id="btn-back-guess"
                  onClick={() => setTurnMode(null)}
                  className="px-5 py-3 rounded-xl font-bold text-white bg-white/5 border border-white/15
                             hover:bg-white/10 transition-all text-sm"
                >
                  ↩ رجوع
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ── Confirm guess modal ── */}
      <AnimatePresence>
        {guessConfirm && turnMode === 'guess' && (
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
