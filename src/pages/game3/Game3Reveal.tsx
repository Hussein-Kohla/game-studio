import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame3Store, CATEGORY_META } from '../../store/game3Store';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCardImages } from '../../hooks/useCardImages';
import { playUnlockSound } from '../../utils/sounds';

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

  useEffect(() => {
    if (!roomCode) navigate('/game3/setup');
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'turns') navigate('/game3/play');
  }, [room?.phase, navigate]);

  useEffect(() => {
    if (revealFired.current) return;
    if (room?.phase !== 'category' || !room?.selectedCategory) return;
    const me = room?.players.find((p: any) => p.id === myPlayerId);
    if (!me?.isHost) return;
    revealFired.current = true;
    startRevealMut({ roomCode: roomCode! });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, room?.selectedCategory]);

  if (!room) return <div className="p-10 text-white text-center">جاري التحميل...</div>;

  const me             = room.players.find((p: any) => p.id === myPlayerId);
  const isHost         = me?.isHost ?? false;
  const myTeam         = me?.team ?? 'red';
  const mySecretCardId = room.secretCards[myTeam];
  const mySecretCard   = room.cards.find((c: any) => c.id === mySecretCardId);
  const { cards, selectedCategory } = room;
  const meta = selectedCategory ? CATEGORY_META[selectedCategory as keyof typeof CATEGORY_META] : null;

  const cardLabels  = cards.map((c: any) => c.label as string);
  const cardImages  = useCardImages(cardLabels);
  const secretImgUrl = mySecretCard ? cardImages[mySecretCard.label] : undefined;

  const handleSelectCard = (cardId: string) => {
    setSecretCardMut({ roomCode: roomCode!, team: myTeam, cardId });
    setIsFlipped(false);
  };

  const handleReady = () => {
    if (isReady) return;
    setIsReady(true);
    if (isHost) startTurnsMut({ roomCode: roomCode! });
  };

  return (
    <div className="flex-1 flex flex-col p-3 md:p-4 max-w-6xl mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        {meta && (
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shrink-0`}>
            {meta.icon}
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">اختر كارتك السري!</h2>
          <p className="text-slate-400 text-xs">اختر كارتك من الشبكة ثم اضغط استعداد</p>
        </div>
      </div>

      {/* ── Main area: responsive flex ── */}
      <div className="flex flex-col-reverse md:flex-row gap-4 flex-1 min-h-0">

        {/* Cards grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 md:gap-2 flex-1 content-start">
          {cards.map((card: any, i: number) => {
            const isSelected = card.id === mySecretCardId;
            const imgUrl     = cardImages[card.label];
            return (
              <div key={card.id} className="flex flex-col">
                <motion.div
                  onClick={() => handleSelectCard(card.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.025 }}
                  className={`aspect-[3/4] rounded-xl relative overflow-hidden shadow-lg transition-all cursor-pointer hover:scale-105 ${
                    isSelected
                      ? 'border-2 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                      : 'border border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Photo or category icon */}
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={card.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2235] to-[#0f1623] flex items-center justify-center text-3xl">
                      {meta?.icon}
                    </div>
                  )}

                  {/* Number tag */}
                  <div className="absolute top-1 left-1 text-[7px] text-white/40 font-mono">#{i + 1}</div>

                  {/* Selected checkmark overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-orange-500/25 flex items-center justify-center">
                      <div className="text-xl">✅</div>
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

        {/* ── Secret card panel ── */}
        <div className="md:w-44 shrink-0 flex flex-row md:flex-col items-center gap-4 justify-center md:justify-start">
          <h3 className="hidden md:block text-lg font-black text-white text-center">كارتك السري</h3>

          {/* 3-D flip card */}
          <div
            className="w-32 md:w-full shrink-0"
            style={{ perspective: '1000px', aspectRatio: '3/4' }}
          >
            <motion.div
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
            >
              {/* Back face */}
              <div
                onClick={() => {
                  if (mySecretCard) {
                    playUnlockSound();
                    setIsFlipped(true);
                  }
                }}
                style={{ backfaceVisibility: 'hidden' }}
                className={`absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 p-4
                  bg-gradient-to-br from-[#111827] to-[#0c1220]
                  ${mySecretCard
                    ? 'border-orange-500/60 shadow-[0_0_35px_rgba(249,115,22,0.2)] cursor-pointer'
                    : 'border-white/10 cursor-default'
                  }`}
              >
                <div className="grid grid-cols-3 gap-2 opacity-10">
                  {Array.from({ length: 9 }).map((_, k) => (
                    <div key={k} className="w-3 h-3 rounded-full bg-orange-400" />
                  ))}
                </div>
                <div className="text-4xl opacity-20">🎴</div>
                <div className="text-xs text-white/20 font-semibold tracking-wide">مقلوب</div>
              </div>

              {/* Front face — shows image */}
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
                      <span className="text-white font-black text-sm md:text-base leading-tight drop-shadow-lg">
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

          {/* Lock button */}
          <div className="flex md:flex-col items-center gap-2">
            <motion.button
              id="btn-flip-lock"
              onClick={() => mySecretCard && setIsFlipped(f => !f)}
              whileHover={mySecretCard ? { scale: 1.12 } : {}}
              whileTap={mySecretCard ? { scale: 0.93 } : {}}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300
                ${isFlipped
                  ? 'bg-green-500/20 border-2 border-green-400/70 shadow-[0_0_18px_rgba(34,197,94,0.35)]'
                  : 'bg-orange-500/15 border-2 border-orange-500/50 shadow-[0_0_18px_rgba(249,115,22,0.2)]'
                }
                ${!mySecretCard ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isFlipped ? '🔓' : '🔒'}
            </motion.button>
            <p className="text-[10px] text-slate-500 text-center">
              {!mySecretCard
                ? 'اختار كارت أولاً'
                : isFlipped
                  ? 'اضغط للإخفاء'
                  : 'اضغط للكشف'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Ready button ── */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <motion.button
          id="btn-ready"
          onClick={handleReady}
          whileHover={!isReady ? { scale: 1.04 } : {}}
          whileTap={!isReady ? { scale: 0.97 } : {}}
          className={`px-10 py-3.5 rounded-2xl font-black text-lg transition-all duration-400 ${
            isReady
              ? 'bg-blue-500/25 border-2 border-blue-400/90 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-default'
              : mySecretCard
                ? 'bg-orange-500/20 border-2 border-orange-500/60 text-white hover:bg-orange-500/30 cursor-pointer'
                : 'bg-white/4 border-2 border-white/12 text-white/35 cursor-not-allowed'
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