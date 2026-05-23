import { useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playUnlockSound } from '../../utils/sounds';

interface LockedSecretProps {
  label: string;
  secret: string;
  hint?: string;
  onClosed?: () => void;
}

export function LockedSecret({ label, secret, hint, onClosed }: LockedSecretProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [closed, setClosed] = useState(false);

  if (closed) {
    return (
      <div className="text-center py-8">
        <p className="text-green-400 text-xl font-bold">✓ تم الإغلاق — مرّر الهاتف للاعب التالي</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-slate-400 text-sm uppercase tracking-widest">{label}</p>

      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.button
            key="lock"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            type="button"
            onClick={() => {
              playUnlockSound();
              setUnlocked(true);
            }}
            className="flex flex-col items-center gap-4 p-10 rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition-all w-full max-w-xs"
          >
            <Lock className="w-16 h-16 text-amber-400" />
            <span className="text-xl font-bold text-amber-300">اضغط لفتح الكلمة السرية</span>
          </motion.button>
        ) : (
          <motion.div
            key="word"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full text-center"
          >
            <LockOpen className="w-10 h-10 text-green-400 mx-auto mb-4" />
            <p className="text-5xl md:text-6xl font-black text-white mb-4">{secret}</p>
            {hint && <p className="text-slate-400 text-sm mb-6">{hint}</p>}
            <button
              type="button"
              onClick={() => {
                setClosed(true);
                onClosed?.();
              }}
              className="px-8 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
            >
              إغلاق
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
