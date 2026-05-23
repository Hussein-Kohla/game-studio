import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// @ts-ignore
import { useGame3Store, CATEGORY_META, type CardCategory, buildCards, type CardItem, type Player } from '../../store/game3Store';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function Game3Room() {
  const { roomCode, myPlayerId } = useGame3Store();
  const room = useQuery(api.game3.getRoom, roomCode ? { roomCode } : "skip");
  // @ts-ignore
  const joinRoomMut = useMutation(api.game3.joinRoom);
  // @ts-ignore
  const flipCardMut = useMutation(api.game3.flipCard);
  // @ts-ignore
  const selectCategoryMut = useMutation(api.game3.selectCategory);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomCode) navigate('/game3/setup');
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'reveal') navigate('/game3/reveal');
  }, [room?.phase, navigate]);

  // Auto-navigate to reveal when category is selected (phase becomes 'category' then 'reveal')
  useEffect(() => {
    if (room?.phase === 'category' || room?.phase === 'reveal') {
      navigate('/game3/reveal');
    }
  }, [room?.phase, navigate]);

  if (!room) return <div className="p-10 text-white text-center">جاري التحميل...</div>;

  const { players, selectedCategory } = room;
  const me = players.find((p: Player) => p.id === myPlayerId);
  const isHost = me?.isHost ?? false;

  const categories = Object.entries(CATEGORY_META) as [CardCategory, typeof CATEGORY_META[CardCategory]][];

  return (
    <div className="flex-1 flex flex-col items-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Room code banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-8 z-10"
      >
        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">كود الغرفة — شاركه مع صديقك</p>
            <div className="text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-mono" dir="ltr">
              {roomCode}
            </div>
          </div>
          <div className="flex gap-3">
            {players.map((p: Player) => (
              <div key={p.id} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl border ${
                p.team === 'red' ? 'border-red-500/40 bg-red-500/10' : 'border-green-500/40 bg-green-500/10'
              }`}>
                <div className={`w-3 h-3 rounded-full ${p.team === 'red' ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="text-white font-bold text-sm">{p.name}</span>
                <span className={`text-xs ${p.team === 'red' ? 'text-red-400' : 'text-green-400'}`}>
                  {p.team === 'red' ? 'الأحمر' : 'الأخضر'}
                </span>
                {p.isHost && <span className="text-yellow-400 text-xs">👑 مضيف</span>}
              </div>
            ))}
            {players.length < 2 && (
              <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-dashed border-white/20">
                <div className="w-3 h-3 rounded-full bg-white/20 animate-pulse" />
                <span className="text-slate-500 text-sm">ينتظر...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Category selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl z-10"
      >
        <h2 className="text-3xl font-black text-white text-center mb-2">
          {isHost ? '🎯 اختر تصنيف الكروت' : '⏳ المضيف يختار التصنيف...'}
        </h2>
        <p className="text-slate-400 text-center mb-8">
          {isHost ? 'اختار التصنيف وسيبدأ العرض تلقائياً' : 'انتظر حتى يختار المضيف'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(([key, meta], i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              disabled={!isHost}
              onClick={() => isHost && selectCategoryMut({ roomCode: roomCode!, category: key, cards: buildCards(key) })}
              className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 text-right
                ${selectedCategory === key
                  ? 'border-orange-400 shadow-[0_0_25px_rgba(251,146,60,0.4)] scale-[1.02]'
                  : isHost
                    ? 'border-white/10 hover:border-white/30 hover:scale-[1.02] cursor-pointer'
                    : 'border-white/5 opacity-50 cursor-not-allowed'
                }
                bg-[#111827]/70 backdrop-blur-sm
              `}
            >
              {/* gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-0 group-hover:opacity-10 transition-opacity ${selectedCategory === key ? '!opacity-15' : ''}`} />

              <div className="relative flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {meta.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{meta.label}</h3>
                  <p className="text-slate-400 text-sm mt-1">24 كارت للتخمين</p>
                </div>
                {selectedCategory === key && (
                  <div className="mr-auto text-2xl">✅</div>
                )}
              </div>
            </motion.button>
          ))}

          {/* 5th category spans full width on odd grid */}
          {categories.length % 2 !== 0 && <div className="hidden sm:block" />}
        </div>
      </motion.div>
    </div>
  );
}
