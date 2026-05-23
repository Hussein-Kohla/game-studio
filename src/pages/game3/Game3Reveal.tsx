import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame3Store, CATEGORY_META } from '../../store/game3Store';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function Game3Reveal() {
  const { roomCode, myPlayerId } = useGame3Store();
  const room = useQuery(api.game3.getRoom, roomCode ? { roomCode } : 'skip');

  // @ts-ignore
  const setSecretCardMut = useMutation(api.game3.setSecretCard);
  // @ts-ignore
  const startTurnsMut    = useMutation(api.game3.startTurns);
  // @ts-ignore
  const startRevealMut   = useMutation(api.game3.startReveal);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isReady,   setIsReady]   = useState(false);

  const navigate      = useNavigate();
  const revealFired   = useRef(false);

  /* ── Navigation guards (before null check so hooks order is stable) ── */
  useEffect(() => {
    if (!roomCode) navigate('/game3/setup');
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'turns') navigate('/game3/play');
  }, [room?.phase, navigate]);

  /* ── Auto-start reveal when category is selected (host only) ── */
  useEffect(() => {
    if (revealFired.current) return;
    if (room?.phase !== 'category' || !room?.selectedCategory) return;
    const me = room?.players.find((p: any) => p.id === myPlayerId);
    if (!me?.isHost) return;
    revealFired.current = true;
    startRevealMut({ roomCode: roomCode! });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, room?.selectedCategory]);

  /* ── Loading ── */
  if (!room) return <div className="p-10 text-white text-center">جاري التحميل...</div>;

  /* ── Derived state ── */
  const me             = room.players.find((p: any) => p.id === myPlayerId);
  const isHost         = me?.isHost ?? false;
  const myTeam         = me?.team ?? 'red';
  const mySecretCardId = room.secretCards[myTeam];
  const mySecretCard   = room.cards.find((c: any) => c.id === mySecretCardId);
  const { cards, selectedCategory } = room;
  const meta = selectedCategory ? CATEGORY_META[selectedCategory as keyof typeof CATEGORY_META] : null;

  /* ── Handlers ── */
  const handleSelectCard = (cardId: string) => {
    setSecretCardMut({ roomCode: roomCode!, team: myTeam, cardId });
    setIsFlipped(false); // reset flip on new selection
  };

  const handleReady = () => {
    if (isReady) return;
    setIsReady(true);
    if (isHost) startTurnsMut({ roomCode: roomCode! });
  };

  /* ── Render ── */
  return (
    <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        {meta && (
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shrink-0`}>
            {meta.icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-black text-white">اختر كارتك السري!</h2>
          <p className="text-slate-400 text-sm">اختر كارتك من الشبكة ثم اضغط استعداد</p>
        </div>
      </div>

      {/* ── Main area: cards grid + secret card sidebar ── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* Cards grid 4×6 */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 flex-1 content-start">
          {cards.map((card: any, i: number) => {
            const isSelected = card.id === mySecretCardId;
            return (
              <motion.div
                key={card.id}
                onClick={() => handleSelectCard(card.id)}
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

        {/* ── Secret card panel — large on the right ── */}
        <div className="w-48 shrink-0 flex flex-col items-center gap-4">
          <h3 className="text-lg font-black text-white text-center">كارتك السري</h3>

          {/* 3-D flip card */}
          <div
            className="w-full"
            style={{ perspective: '1000px', aspectRatio: '3/4' }}
          >
            <motion.div
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
            >
              {/* ── Back face (face-down / locked) ── */}
              <div
                onClick={() => mySecretCard && setIsFlipped(true)}
                style={{ backfaceVisibility: 'hidden' }}
                className={`absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 p-5
                  bg-gradient-to-br from-[#111827] to-[#0c1220]
                  ${mySecretCard
                    ? 'border-orange-500/60 shadow-[0_0_35px_rgba(249,115,22,0.2)] cursor-pointer'
                    : 'border-white/10 cursor-default'
                  }`}
              >
                {/* decorative pattern */}
                <div className="grid grid-cols-3 gap-2 opacity-10">
                  {Array.from({ length: 9 }).map((_, k) => (
                    <div key={k} className="w-4 h-4 rounded-full bg-orange-400" />
                  ))}
                </div>
                <div className="text-4xl opacity-20">🎴</div>
                <div className="text-xs text-white/20 font-semibold tracking-wide">مقلوب</div>
              </div>

              {/* ── Front face (revealed) ── */}
              <div
                onClick={() => setIsFlipped(false)}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 rounded-3xl border-2 border-orange-500 flex flex-col items-center justify-center gap-4 p-5
                  bg-gradient-to-br from-[#1a2235] to-[#0f1623]
                  shadow-[0_0_40px_rgba(249,115,22,0.35)] cursor-pointer"
              >
                <div className="text-6xl">{meta?.icon}</div>
                <div className="text-xl font-black text-white text-center leading-tight px-1">
                  {mySecretCard?.label ?? '—'}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Lock button ── */}
          <motion.button
            id="btn-flip-lock"
            onClick={() => mySecretCard && setIsFlipped(f => !f)}
            whileHover={mySecretCard ? { scale: 1.12 } : {}}
            whileTap={mySecretCard ? { scale: 0.93 } : {}}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300
              ${isFlipped
                ? 'bg-green-500/20 border-2 border-green-400/70 shadow-[0_0_18px_rgba(34,197,94,0.35)]'
                : 'bg-orange-500/15 border-2 border-orange-500/50 shadow-[0_0_18px_rgba(249,115,22,0.2)]'
              }
              ${!mySecretCard ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isFlipped ? '🔓' : '🔒'}
          </motion.button>
          <p className="text-[11px] text-slate-500 text-center">
            {!mySecretCard
              ? 'اختار كارت أولاً'
              : isFlipped
                ? 'اضغط للإخفاء'
                : 'اضغط للكشف'}
          </p>
        </div>
      </div>

      {/* ── Ready button ── */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <motion.button
          id="btn-ready"
          onClick={handleReady}
          whileHover={!isReady ? { scale: 1.04 } : {}}
          whileTap={!isReady ? { scale: 0.97 } : {}}
          className={`px-12 py-4 rounded-2xl font-black text-xl transition-all duration-400 ${
            isReady
              ? 'bg-blue-500/25 border-2 border-blue-400/90 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-default'
              : 'bg-white/4 border-2 border-white/12 text-white/35 hover:border-white/25 hover:text-white/55 cursor-pointer'
          }`}
        >
          {isReady ? '✅ استعديت!' : '👆 اضغط للاستعداد'}
        </motion.button>

        {isHost && !isReady && (
          <p className="text-slate-600 text-xs">أنت المضيف — ضغطتك ستبدأ اللعبة للاثنين</p>
        )}
      </div>
    </div>
  );
}