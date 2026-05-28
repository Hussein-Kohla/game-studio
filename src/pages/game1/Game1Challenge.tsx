import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGame1Store } from '../../store/game1Store';
import { useAuthStore } from '../../store/authStore';
import { SpinWheel } from '../../components/game1/SpinWheel';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { playCorrectSound, playWrongSound } from '../../utils/sounds';

export function Game1Challenge() {
  const [searchParams] = useSearchParams();
  const boxId = Number(searchParams.get('box'));
  const navigate = useNavigate();

  const { teams, currentTeamIndex, openBox, addScore, nextTurn } = useGame1Store();
  const currentTeam = teams[currentTeamIndex];

  const { user, progress: authProgress, addLocalProgress, clearLocalProgress } = useAuthStore();
  const addUserProgress = useMutation(api.users.addProgress);
  const clearUserProgress = useMutation(api.users.clearProgress);

  const popPrompt = useMutation(api.prompts.popRandomPrompt);

  const [activePrompt, setActivePrompt] = useState<{ text: string; textEn: string } | null>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [wheelResult, setWheelResult] = useState<'truth' | 'lie' | null>(null);
  const [forcedLieWord, setForcedLieWord] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadImage = (promptEn: string) => {
    setImgLoading(true);
    setImgUrl('');

    const seed = Math.floor(Math.random() * 9999999);
    const cleanPrompt = promptEn.replace(/[^a-zA-Z0-9\s,]/g, '');
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${seed}&nologo=true&width=512&height=512&model=turbo`;

    // Tier 1: allorigins proxy
    const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(pollinationsUrl)}`;
    console.log("Loading AI image (Tier 1: AllOrigins)...");
    setImgUrl(proxiedUrl);
  };

  const handleImageError = () => {
    const seed = Math.floor(Math.random() * 9999999);
    const cleanPrompt = (activePrompt?.textEn || '').replace(/[^a-zA-Z0-9\s,]/g, '');
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${seed}&nologo=true&width=512&height=512&model=turbo`;

    // Tier 2 Fallback: wsrv.nl
    if (imgUrl && imgUrl.includes('allorigins.win')) {
      console.warn("Tier 1 failed. Trying Tier 2 (WSRV)...");
      setImgLoading(true);
      setImgUrl(`https://wsrv.nl/?url=${encodeURIComponent(pollinationsUrl)}&we=1&il=1&t=${seed}`);
    }
    // Tier 3 Fallback: codetabs
    else if (imgUrl && imgUrl.includes('wsrv.nl')) {
      console.warn("Tier 2 failed. Trying Tier 3 (CodeTabs)...");
      setImgLoading(true);
      setImgUrl(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(pollinationsUrl)}`);
    }
    // Tier 4 Fallback: Convex Proxy (Our Backend)
    else if (imgUrl && imgUrl.includes('codetabs.com')) {
      console.warn("Tier 3 failed. Trying Tier 4 (Convex Backend Proxy)...");
      setImgLoading(true);
      const httpBaseUrl = (import.meta.env.VITE_CONVEX_SITE_URL as string) ||
        ((import.meta.env.VITE_CONVEX_URL as string) || '').replace('.cloud', '.site');
      setImgUrl(`${httpBaseUrl}/api/image?prompt=${encodeURIComponent(cleanPrompt)}&seed=${seed}`);
    }
    // No more fallbacks! Only AI.
    else {
      console.error("ALL AI proxies failed! ISP is blocking everything.");
      setImgLoading(false);
      toast.error('فشل تحميل الذكاء الاصطناعي من جميع السيرفرات بسبب حظر مزود الإنترنت.');
    }
  };

  const fetchPrompt = useCallback(async () => {
    const { selectedGroupId: groupId, usedPrompts, markPromptUsed } = useGame1Store.getState();

    if (groupId === null) {
      navigate('/game1/setup');
      return;
    }

    setActivePrompt(null);
    setIsEmpty(false);
    setImgUrl('');
    setIsModalOpen(false);
    setWheelResult(null);
    setForcedLieWord(null);

    try {
      const combinedExclude = Array.from(new Set([
        ...usedPrompts,
        ...(authProgress?.game1UsedPrompts || [])
      ]));

      const dbPrompt = await popPrompt({ groupId, exclude: combinedExclude });
      if (dbPrompt) {
        markPromptUsed(dbPrompt.text);
        addLocalProgress('game1', [dbPrompt.text]);
        if (user) {
          addUserProgress({ userId: user._id, game: 'game1', itemIds: [dbPrompt.text] }).catch(console.error);
        }

        setActivePrompt({ text: dbPrompt.text, textEn: dbPrompt.textEn });
        loadImage(dbPrompt.textEn);
      } else {
        if (combinedExclude.length > 0) {
          toast('نفدت الكلمات! سيتم إعادة تدوير الكلمات من جديد.', { icon: '🔄' });
          clearLocalProgress('game1');
          useGame1Store.setState({ usedPrompts: [] });
          if (user) {
            clearUserProgress({ userId: user._id, game: 'game1' }).catch(console.error);
          }
          // The user will need to click 'محتوى آخر' or we could auto fetch, but let's just let them click.
          setIsEmpty(true);
        } else {
          toast.error('المجموعة فارغة في قاعدة البيانات!', { icon: '⚠️' });
          setIsEmpty(true);
        }
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بقاعدة البيانات.', { icon: '❌' });
      setIsEmpty(true);
    }
  }, [popPrompt, navigate]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const refreshPrompt = () => {
    fetchPrompt();
  };

  const handleSpinComplete = (result: 'truth' | 'lie') => {
    setWheelResult(result);
    if (result === 'lie') {
      const lieWords = [
        "قطة", "بطيخ", "قمر", "شمس", "عنكبوت", "طائرة", "دراجة", "نار",
        "ثلج", "جبل", "بحر", "مفتاح", "ساعة", "كتاب", "فيل", "أسد", "قهوة",
        "مستشفى", "ذهب", "طبيب", "وردة", "تفاحة", "تلفاز", "مظلة", "قرد",
        "ديناصور", "بيتزا", "تمساح", "سيارة", "فضائي", "أحمر", "أزرق"
      ];
      setForcedLieWord(lieWords[Math.floor(Math.random() * lieWords.length)]);
    } else {
      setForcedLieWord(null);
    }
  };

  const handleResult = (isCorrect: boolean) => {
    if (isCorrect) {
      playCorrectSound();
      addScore(currentTeam.id, 10);
      toast.success('إجابة صحيحة! +10 نقاط', { icon: '✅' });
    } else {
      playWrongSound();
      toast.error('إجابة خاطئة!', { icon: '❌' });
    }
    openBox(boxId, currentTeam.id);
    nextTurn();
    navigate('/game1/board');
  };

  if (!currentTeam || !boxId) {
    navigate('/game1/setup');
    return null;
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold ${currentTeam.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
          تحدي الصندوق رقم {boxId} — فريق {currentTeam.name}
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Left: AI Image + Prompt */}
        <Card className="flex-1 flex flex-col gap-4 p-4 overflow-hidden" glow="blue">

          {/* Image Area */}
          <div className="relative w-full rounded-xl overflow-hidden bg-[#0B1020] min-h-[280px] flex items-center justify-center">

            {/* Loading spinner while fetching prompt or generating image */}
            {((!activePrompt && !isEmpty) || imgLoading) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-slate-900/80">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-blue-300 text-sm animate-pulse">
                  {imgLoading ? 'جاري توليد الصورة...' : 'جاري السحب من الصندوق...'}
                </p>
              </div>
            )}

            {/* AI Image using native img tag */}
            {imgUrl && (
              <img
                key={imgUrl}
                src={imgUrl}
                alt={activePrompt?.text ?? ''}
                className={`w-full h-[300px] object-cover rounded-xl transition-opacity duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImgLoading(false)}
                onError={handleImageError}
              />
            )}
          </div>

          {/* Reveal & Link Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              className="bg-blue-600 hover:bg-blue-500 w-full flex items-center justify-center gap-2 font-bold text-base py-3"
              onClick={() => setIsModalOpen(true)}
            >
              👁️ افتح الصندوق واعرض الصورة
            </Button>

            <a
              href={imgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline text-center font-semibold block py-1"
            >
              🔗 رابط مباشر لفتح الصورة في علامة تبويب جديدة
            </a>
          </div>

          {/* Arabic description */}
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-5 text-center">
            <p className="text-xs text-blue-300 uppercase tracking-widest mb-2 font-bold">محتوى الصندوق</p>
            {isEmpty ? (
              <p className="text-xl font-bold text-red-400 py-4">لا يوجد محتوى، الرجاء تعبئة قاعدة البيانات</p>
            ) : (
              <>
                <p className="text-2xl font-black text-white leading-relaxed">
                  {activePrompt?.text ?? '…'}
                </p>
                {activePrompt && (
                  <p className="text-xs text-green-400/60 mt-1">✨ مولّد بالذكاء الاصطناعي</p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="border border-white/20 w-full" onClick={refreshPrompt}>
              🎲 محتوى آخر
            </Button>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 w-full mt-1">
              <p className="text-[13px] md:text-sm font-bold text-amber-300 text-center leading-relaxed">
                ⚠️ ملحوظة: لو لم تتطابق الصورة مع الكلام اضغط "محتوى آخر" لتغييرها لأن الـ AI خرف.
              </p>
            </div>
          </div>
        </Card>

        {/* Right: Wheel & Actions */}
        <Card className="flex-1 flex flex-col items-center justify-center p-8">
          {!wheelResult ? (
            <div className="flex flex-col items-center">
              <p className="text-slate-400 text-sm mb-6 text-center">أدّر العجلة لتحديد: حقيقة أم كذبة؟</p>
              <SpinWheel onComplete={handleSpinComplete} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className={`text-5xl font-black py-4 px-8 rounded-2xl ${wheelResult === 'truth'
                  ? 'text-green-400 bg-green-900/30 border border-green-500/30'
                  : 'text-red-400 bg-red-900/30 border border-red-500/30'
                }`}>
                {wheelResult === 'truth' ? '✅ حقيقة' : '❌ كذبة'}
              </div>
              <p className="text-slate-300 text-center text-sm">
                {wheelResult === 'truth'
                  ? 'وصف الصورة بشكل صحيح!'
                  : 'اخدع فريقك بوصف خاطئ!'}
              </p>

              {wheelResult === 'lie' && forcedLieWord && (
                <div className="bg-purple-900/40 border border-purple-500/30 rounded-xl p-4 mt-2 mb-2 w-full flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <p className="text-purple-300 text-[10px] font-bold uppercase tracking-widest">تحدي إضافي إجباري</p>
                  <div className="bg-purple-950 px-6 py-2 rounded-lg border border-purple-500/50 shadow-inner">
                    <p className="text-2xl font-black text-white">{forcedLieWord}</p>
                  </div>
                  <p className="text-purple-200/70 text-[11px] text-center px-2 leading-relaxed">
                    ⚠️ يجب أن تذكر هذه الكلمة بذكاء داخل شرحك الكاذب لإضافة صعوبة ولتشتيت الفريق الآخر!
                  </p>
                </div>
              )}

              <div className="flex gap-4 w-full">
                <Button
                  variant="primary"
                  className="flex-1 bg-green-600 hover:bg-green-500"
                  onClick={() => handleResult(true)}
                >
                  ✅ صح — +10 نقاط
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 border-red-500/30 text-red-400"
                  onClick={() => handleResult(false)}
                >
                  ❌ غلط
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Immersive Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 md:p-8">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl w-[90vw] md:w-[70vw] h-[85vh] md:h-[70vh] max-w-6xl p-6 flex flex-col items-center gap-4 shadow-2xl relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            <h3 className="text-xl md:text-2xl font-bold text-white text-center">
              🖼️ الصورة السرية للمحتوى
            </h3>

            <p className="text-sm text-slate-300 text-center px-8">
              "{activePrompt?.text}"
            </p>

            {/* Modal Image Area */}
            <div className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden bg-[#0B1020] flex items-center justify-center border border-slate-700/50">
              <img
                src={imgUrl}
                alt={activePrompt?.text ?? ''}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
