import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame5Store, generatePlayerId } from '../../store/game5Store';
import { ArrowRight, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Game5Setup() {
  const navigate = useNavigate();
  const { setRoomCode, setMyPlayerId, setMyName, setIsHost } = useGame5Store();
  const createRoom = useMutation(api.game5.createRoom);
  const joinRoom = useMutation(api.game5.joinRoom);

  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error('أدخل اسمك أولاً');
      return;
    }
    const playerId = generatePlayerId();
    try {
      const code = await createRoom({ playerId, playerName });
      setRoomCode(code);
      setMyPlayerId(playerId);
      setMyName(playerName);
      setIsHost(true);
      navigate('/game5/room');
    } catch (e) {
      toast.error('حدث خطأ أثناء إنشاء الغرفة');
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      toast.error('أدخل اسمك أولاً');
      return;
    }
    if (!joinCode.trim() || joinCode.length !== 4) {
      toast.error('رمز الغرفة يجب أن يكون 4 أرقام');
      return;
    }
    const playerId = generatePlayerId();
    try {
      await joinRoom({ roomCode: joinCode, playerId, playerName });
      setRoomCode(joinCode);
      setMyPlayerId(playerId);
      setMyName(playerName);
      setIsHost(false);
      navigate('/game5/room');
    } catch (e: any) {
      if (e.message.includes('Room not found')) {
        toast.error('رمز الغرفة غير صحيح');
      } else if (e.message.includes('Game already started')) {
        toast.error('اللعبة بدأت بالفعل');
      } else {
        toast.error(e.message || 'حدث خطأ أثناء الانضمام');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-8 text-amber-400">جاوب أسرع ⚡</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">اسم اللاعب</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="اكتب اسمك هنا..."
            />
          </div>

          <div className="pt-4 border-t border-slate-700 flex gap-4">
            <button
              onClick={() => setIsJoining(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${!isJoining ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              إنشاء غرفة
            </button>
            <button
              onClick={() => setIsJoining(true)}
              className={`flex-1 py-2 rounded-lg transition-colors ${isJoining ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              انضمام لغرفة
            </button>
          </div>

          {isJoining ? (
            <div className="animate-fade-in space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">رمز الغرفة</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  maxLength={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1234"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                دخول الغرفة
              </button>
            </div>
          ) : (
            <div className="animate-fade-in pt-4">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                بدء غرفة جديدة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
