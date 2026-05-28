import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../../convex/_generated/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGame4Store } from '../../store/game4Store';
import { useAuthStore } from '../../store/authStore';
import { CATEGORY_ASSETS } from '../../data/game4Assets';
import { playTurnSound } from '../../utils/sounds';

export function Game4Category() {
  const navigate = useNavigate();
  const { players, setCategory, startRound, getUsedPairIds, clearCategoryProgress } = useGame4Store();
  const categories = useQuery(api.imposter.getCategories);
  const pickPair = useMutation(api.imposter.pickRandomPair);

  const { user, progress: authProgress, addLocalProgress, clearLocalProgress } = useAuthStore();
  const addUserProgress = useMutation(api.users.addProgress);
  const clearUserProgress = useMutation(api.users.clearProgress);

  if (players.length < 3) {
    navigate('/game4/setup');
    return null;
  }

  const handleSelect = async (categoryId: string, categoryLabel: string) => {
    try {
      playTurnSound();
      setCategory(categoryId, categoryLabel);
      const localExclude = getUsedPairIds(categoryId);
      const combinedExclude = Array.from(new Set([
        ...localExclude,
        ...(authProgress?.game4UsedPairs || [])
      ]));

      let pair = await pickPair({ categoryId, exclude: combinedExclude });

      if (!pair && combinedExclude.length > 0) {
        toast('نفدت الكلمات! سيتم إعادة تدوير الكلمات من جديد.', { icon: '🔄' });
        clearLocalProgress('game4');
        clearCategoryProgress(categoryId);
        if (user) {
          await clearUserProgress({ userId: user._id, game: 'game4' });
        }
        pair = await pickPair({ categoryId, exclude: [] });
      }

      if (!pair) {
        toast.error('التصنيف فارغ! شغّل seedImposterWords في Convex.', { icon: '⚠️' });
        return;
      }

      addLocalProgress('game4', [pair.pairId]);
      if (user) {
        addUserProgress({ userId: user._id, game: 'game4', itemIds: [pair.pairId] }).catch(console.error);
      }

      const imposterIndex = Math.floor(Math.random() * players.length);
      startRound({
        pairId: pair.pairId,
        word: pair.word,
        impostorWord: pair.impostorWord,
        imposterId: players[imposterIndex].id,
      });

      navigate('/game4/reveal');
    } catch {
      toast.error('تأكد من تشغيل seedImposterWords في Convex', { icon: '❌' });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 max-w-3xl mx-auto w-full">
      <h2 className="text-3xl font-black text-center mb-2 text-white">اختر التصنيف</h2>
      <p className="text-slate-400 text-center mb-8">كل لاعب سيحصل على كلمة — واحد منكم الامبوستر!</p>

      {categories === undefined ? (
        <div className="py-16">
          <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {categories.map((cat, i) => {
            const assets = CATEGORY_ASSETS[cat.id];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  type="button"
                  disabled={cat.count === 0}
                  onClick={() => handleSelect(cat.id, cat.label)}
                  className="w-full text-right disabled:opacity-40"
                >
                  <Card
                    className={`p-5 transition-all cursor-pointer flex gap-4 items-center hover:border-rose-500/50 border-rose-500/20 bg-[#0B1020]/80`}
                  >
                    {assets && (
                      <img
                        src={assets.image}
                        alt=""
                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-1"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {assets?.emoji} {cat.label}
                      </h3>
                    </div>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <Button variant="ghost" className="mt-8" onClick={() => navigate('/game4/setup')}>
        رجوع
      </Button>
    </div>
  );
}
