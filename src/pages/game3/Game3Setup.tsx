import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame3Store, generateRoomCode } from '../../store/game3Store';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function Game3Setup() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRoomCode, setMyPlayerId } = useGame3Store();
  
   // @ts-ignore
 const createRoomMut = useMutation(api.game3.createRoom);
   // @ts-ignore
 const joinRoomMut = useMutation(api.game3.joinRoom);

  const handleCreate = async () => {
    if (!name.trim()) { setError('أدخل اسمك أولاً'); return; }
    
    const newCode = generateRoomCode();
    const newPlayerId = `p-${Date.now()}`;
    
    try {
      await createRoomMut({ roomCode: newCode, playerId: newPlayerId, playerName: name.trim() });
      setRoomCode(newCode);
      setMyPlayerId(newPlayerId);
      navigate('/game3/room');
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الغرفة');
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) { setError('أدخل اسمك أولاً'); return; }
    if (!code.trim()) { setError('أدخل كود الغرفة'); return; }
    
    const newPlayerId = `p-${Date.now()}`;
    const ok = await joinRoomMut({ roomCode: code.trim(), playerId: newPlayerId, playerName: name.trim() });
    
    if (!ok) { setError('الغرفة غير موجودة أو ممتلئة'); return; }
    
    setRoomCode(code.trim());
    setMyPlayerId(newPlayerId);
    navigate('/game3/room');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-orange-500/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-red-600/20 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_40px_rgba(251,146,60,0.5)] mb-5 text-4xl">
            🃏
          </div>
          <h1 className="text-5xl font-black text-white mb-2">احزر الصورة</h1>
          <p className="text-slate-400 text-lg">لعبة الفريقين الأونلاين</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={() => setMode('create')}
                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-l from-orange-500/10 to-transparent border border-orange-500/30 hover:border-orange-400/70 transition-all duration-300 text-right"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🏠
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">إنشاء غرفة</h3>
                    <p className="text-slate-400">ابدأ لعبة جديدة وشارك الكود مع صديقك</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-l from-blue-500/10 to-transparent border border-blue-500/30 hover:border-blue-400/70 transition-all duration-300 text-right"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🔑
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">الانضمام لغرفة</h3>
                    <p className="text-slate-400">أدخل كود الغرفة وانضم للعبة</p>
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <motion.div key={mode} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <button onClick={() => { setMode('choose'); setError(''); }} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm">
                → رجوع
              </button>

              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                {mode === 'create' ? '🏠 إنشاء غرفة جديدة' : '🔑 الانضمام لغرفة'}
              </h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-2">اسمك</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="أدخل اسمك..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg outline-none focus:border-orange-500/60 focus:shadow-[0_0_15px_rgba(251,146,60,0.2)] transition-all placeholder:text-slate-600"
                  />
                </div>

                {mode === 'join' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-2">كود الغرفة</label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                      placeholder="مثال: ABC123"
                      maxLength={6}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-mono font-bold tracking-widest outline-none focus:border-blue-500/60 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all placeholder:text-slate-600 text-center"
                      dir="ltr"
                    />
                  </div>
                )}

                {error && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                    ⚠️ {error}
                  </motion.p>
                )}

                <button
                  onClick={mode === 'create' ? handleCreate : handleJoin}
                  className={`mt-2 w-full py-4 rounded-2xl font-black text-xl text-white transition-all duration-300 ${
                    mode === 'create'
                      ? 'bg-gradient-to-l from-orange-500 to-red-600 hover:shadow-[0_0_30px_rgba(251,146,60,0.5)] hover:scale-[1.02]'
                      : 'bg-gradient-to-l from-blue-500 to-blue-700 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.02]'
                  }`}
                >
                  {mode === 'create' ? 'إنشاء الغرفة 🚀' : 'انضم الآن ✅'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
