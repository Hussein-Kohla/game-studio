import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { Box, FileQuestion, Layers, Settings, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import toast from 'react-hot-toast';

export function HomePage() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const resetAllPrompts = useMutation(api.seed.resetAllPrompts);
  const resetAllWords = useMutation(api.seed.resetAllWords);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'HusseinAdmin@1') {
      setIsAuthenticated(true);
      toast.success('تم تسجيل الدخول بنجاح');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const handleRestorePrompts = async () => {
    try {
      const toastId = toast.loading('جاري استعادة صور اللعبة الأولى...');
      await resetAllPrompts();
      toast.success('تم استعادة جميع صور اللعبة الأولى بنجاح!', { id: toastId });
    } catch {
      toast.error('حدث خطأ أثناء الاستعادة');
    }
  };

  const handleRestoreWords = async () => {
    try {
      const toastId = toast.loading('جاري استعادة كلمات اللعبة الثانية...');
      await resetAllWords();
      toast.success('تم استعادة جميع كلمات اللعبة الثانية بنجاح!', { id: toastId });
    } catch {
      toast.error('حدث خطأ أثناء الاستعادة');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 mb-16"
      >
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="ألعاب المنزل" className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-3xl shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:scale-105 transition-transform duration-500" />
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
          ألعاب المنزل
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 font-semibold max-w-2xl mx-auto leading-relaxed">
          اجمع عائلتك وأصدقاءك واستمتع بأفضل الألعاب التفاعلية المصممة خصيصاً لجعل أوقاتكم في المنزل مليئة بالضحك والتحدي!
        </p>
      </motion.div>

      {/* Games Grid */}
      <div className="flex flex-col md:flex-row gap-8 z-10 w-full max-w-6xl justify-center flex-wrap">

        {/* Game 1 Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full md:w-1/3 max-w-sm">
          <Link to="/game1/setup" className="block h-full">
            <Card glow="green" className="h-full flex flex-col items-center text-center group cursor-pointer border-green-500/20 hover:border-green-500/50 bg-[#0B1020]/80">
              <div className="w-24 h-24 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <Box className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">ماذا في الصندوق؟</h2>
              <p className="text-slate-400 text-lg">
                لعبة الغموض والتحدي! هل تستطيع التمييز بين الحقيقة والكذب بناءً على صور غريبة مولدة بالذكاء الاصطناعي؟
              </p>
            </Card>
          </Link>
        </Tilt>

        {/* Game 2 Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full md:w-1/3 max-w-sm">
          <Link to="/game2/setup" className="block h-full">
            <Card glow="purple" className="h-full flex flex-col items-center text-center group cursor-pointer border-purple-500/20 hover:border-purple-500/50 bg-[#0B1020]/80">
              <div className="w-24 h-24 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <FileQuestion className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">الكلمات الممنوعة</h2>
              <p className="text-slate-400 text-lg">
                اشرح الكلمة لفريقك بدون استخدام أي من الكلمات الممنوعة! تحدى ذكاءك وسرعة بديهتك.
              </p>
            </Card>
          </Link>
        </Tilt>

        {/* Game 3 Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full md:w-1/3 max-w-sm">
          <Link to="/game3/setup" className="block h-full">
            <Card glow="none" className="h-full flex flex-col items-center text-center group cursor-pointer border-orange-500/20 hover:border-orange-500/50 bg-[#0B1020]/80 shadow-[0_0_20px_rgba(251,146,60,0.15)] hover:shadow-[0_0_30px_rgba(251,146,60,0.35)] transition-all">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:from-orange-500/30 group-hover:to-red-600/30 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                <Layers className="w-12 h-12 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-orange-400 transition-colors">احزر الصورة</h2>
              <p className="text-slate-400 text-lg">
                لعبة أونلاين بين فريقين! احفظ الكروت خلال 30 ثانية، ثم تنافس على قلبها وتخمينها قبل خصمك!
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-bold">
                🆕 جديد • أونلاين
              </div>
            </Card>
          </Link>
        </Tilt>

      </div>

      {/* Hidden Admin Gear */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="absolute bottom-4 left-4 text-slate-500 opacity-5 hover:opacity-20 transition-opacity z-50 p-2"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Admin Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1020] border border-slate-700 rounded-2xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={() => { setIsAdminOpen(false); setIsAuthenticated(false); setPassword(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">لوحة التحكم</h2>

            {!isAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-400 mb-2 text-sm">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1A2235] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left"
                    dir="ltr"
                    placeholder="Enter password..."
                    autoFocus
                  />
                </div>
                <Button type="submit" variant="purple" className="w-full mt-2">دخول</Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 mt-8">
                <Button onClick={handleRestorePrompts} variant="glass" className="w-full flex-col py-4 gap-2 border border-green-500/30 hover:bg-green-500/10">
                  <span className="text-lg font-bold text-green-400">إعادة صور اللعبة الأولى</span>
                  <span className="text-sm text-slate-400 font-normal">استعادة جميع البرومبتات للاستخدام مجدداً</span>
                </Button>
                <Button onClick={handleRestoreWords} variant="glass" className="w-full flex-col py-4 gap-2 border border-purple-500/30 hover:bg-purple-500/10">
                  <span className="text-lg font-bold text-purple-400">إعادة كلمات اللعبة الثانية</span>
                  <span className="text-sm text-slate-400 font-normal">استعادة جميع الكلمات للاستخدام مجدداً</span>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
