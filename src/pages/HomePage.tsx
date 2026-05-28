import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { Box, FileQuestion, Layers, Users, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { AuthModal } from '../components/AuthModal';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">

      {/* Auth Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 border border-purple-500/30 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all flex items-center gap-2"
        >
          <span className="text-xl">👤</span>
          {user ? user.name : 'تسجيل حساب'}
        </button>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 w-full max-w-5xl justify-center">

        {/* Game 1 Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full max-w-sm mx-auto">
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
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full max-w-sm mx-auto">
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
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full max-w-sm mx-auto">
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

        {/* Game 4 Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full max-w-sm mx-auto">
          <Link to="/game4/setup" className="block h-full">
            <Card glow="none" className="h-full flex flex-col items-center text-center group cursor-pointer border-rose-500/20 hover:border-rose-500/50 bg-[#0B1020]/80 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:shadow-[0_0_30px_rgba(244,63,94,0.35)] transition-all">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:from-rose-500/30 group-hover:to-orange-600/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Users className="w-12 h-12 text-rose-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-rose-400 transition-colors">الامبوستر</h2>
              <p className="text-slate-400 text-lg">
                اكتشف من بينكم الغريب! كلمات سرية، أسئلة، تصويت، وكشف الامبوستر — لعبة جماعية على هاتف واحد.
              </p>
            </Card>
          </Link>
        </Tilt>

        {/* Game 5 Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500} className="w-full max-w-sm mx-auto">
          <Link to="/game5/setup" className="block h-full">
            <Card glow="none" className="h-full flex flex-col items-center text-center group cursor-pointer border-amber-500/20 hover:border-amber-500/50 bg-[#0B1020]/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:from-amber-500/30 group-hover:to-yellow-600/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Zap className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-amber-400 transition-colors">جاوب أسرع</h2>
              <p className="text-slate-400 text-lg">
                أسئلة عامة ومنافسة على السرعة! أجب بشكل صحيح وبأسرع وقت لجمع أكبر عدد من النقاط.
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-bold">
                🆕 جديد • أونلاين
              </div>
            </Card>
          </Link>
        </Tilt>

      </div>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
