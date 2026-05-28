import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame5Store } from '../../store/game5Store';
import { useAuthStore } from '../../store/authStore';
import { game5Packages } from '../../data/game5Questions';
import { Users, Crown, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Game5Room() {
  const navigate = useNavigate();
  const { roomCode, isHost, myPlayerId } = useGame5Store();
  
  const room = useQuery(api.game5.getRoom, roomCode ? { roomCode } : "skip");
  const startGame = useMutation(api.game5.startGame);

  const { user, progress: authProgress, addLocalProgress, clearLocalProgress } = useAuthStore();
  const addUserProgress = useMutation(api.users.addProgress);
  const clearUserProgress = useMutation(api.users.clearProgress);

  const [questionCount, setQuestionCount] = useState<number>(15);

  useEffect(() => {
    if (!roomCode) {
      navigate('/game5/setup');
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room?.phase === 'playing') {
      navigate('/game5/play');
    }
  }, [room?.phase, navigate]);

  const handleStart = async (packageId: string) => {
    if (!roomCode) return;
    
    const pkg = game5Packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    const combinedExclude = new Set(authProgress?.game5UsedQuestions || []);
    let availableQuestions = pkg.questions.filter(q => !combinedExclude.has(q.id));
    
    if (availableQuestions.length < questionCount) {
      toast('لا توجد أسئلة كافية في هذا البكج! سيتم إعادة تدوير الأسئلة من جديد.', { icon: '🔄' });
      clearLocalProgress('game5');
      if (user) {
        await clearUserProgress({ userId: user._id, game: 'game5' }).catch(console.error);
      }
      availableQuestions = [...pkg.questions];
    }
    
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);
    const questionIds = selected.map(q => q.id);

    try {
      addLocalProgress('game5', questionIds);
      if (user) {
        addUserProgress({ userId: user._id, game: 'game5', itemIds: questionIds }).catch(console.error);
      }
      await startGame({ roomCode, packageId, questionIds });
    } catch (e) {
      toast.error('حدث خطأ أثناء بدء اللعبة');
    }
  };

  if (!room) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl text-slate-400 mb-2">رمز الغرفة</h1>
          <div className="text-6xl font-black tracking-widest text-amber-400 drop-shadow-lg">
            {room.roomCode}
          </div>
          <p className="mt-4 text-emerald-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {room.players.length} لاعبين في الغرفة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              اللاعبين
            </h2>
            <div className="space-y-2">
              {room.players.map((p: any) => (
                <div key={p.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{p.name} {p.id === myPlayerId && "(أنت)"}</span>
                    {p.id === room.previousWinnerId && (
                      <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                    )}
                  </div>
                  {p.isHost && <span className="text-xs bg-indigo-600 px-2 py-1 rounded">المضيف</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Packages Selection (Host Only) */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4">اختر البكج للبدء</h2>
            {isHost ? (
              <>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex flex-col gap-3">
                  <label className="text-slate-300 font-bold">عدد الأسئلة في الجولة:</label>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 15, 20, 25, 30, 50].map(num => (
                      <button
                        key={num}
                        onClick={() => setQuestionCount(num)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${questionCount === num ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {`${num} سؤال`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {game5Packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleStart(pkg.id)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-transform hover:scale-105 relative overflow-hidden"
                    >
                      <span className="text-xl font-bold">{pkg.name}</span>
                      <span className="text-sm text-slate-400">{pkg.questions.length} أسئلة</span>
                      <div className="bg-amber-500 text-slate-900 rounded-full p-2 mt-2">
                        <Play className="w-6 h-6" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center text-slate-400">
                في انتظار الهوست لاختيار البكج وبدء اللعبة...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
