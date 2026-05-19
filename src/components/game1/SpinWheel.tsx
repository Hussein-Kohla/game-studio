import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface SpinWheelProps {
  onComplete: (result: 'truth' | 'lie') => void;
}

export function SpinWheel({ onComplete }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Randomize the result (60% truth, 40% lie)
    const result = Math.random() < 0.6 ? 'truth' : 'lie';
    
    // Truth is green (0-180deg), Lie is red (180-360deg)
    const extraSpins = 360 * 5; // 5 full spins
    
    // Truth is top half (rotation 270-360 or 0-90)
    // Lie is bottom half (rotation 90-270)
    let targetAngle = 0;
    if (result === 'truth') {
      targetAngle = Math.floor(Math.random() * 120) - 60; // -60 to +60
      if (targetAngle < 0) targetAngle += 360;
    } else {
      targetAngle = Math.floor(Math.random() * 120) + 120; // 120 to 240
    }

    const finalRotation = rotation + extraSpins + targetAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onComplete(result);
    }, 3500);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-8">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-white z-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        
        {/* Wheel */}
        <motion.div 
          className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative"
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* Half Green (Truth) */}
          <div className="absolute w-full h-1/2 bg-green-500 top-0 left-0 flex items-center justify-center origin-bottom">
            <span className="text-2xl font-bold text-white mb-8 -rotate-180">حقيقة</span>
          </div>
          {/* Half Red (Lie) */}
          <div className="absolute w-full h-1/2 bg-red-500 bottom-0 left-0 flex items-center justify-center origin-top">
            <span className="text-2xl font-bold text-white mt-8">كذب</span>
          </div>
        </motion.div>
      </div>

      <Button size="lg" onClick={spin} disabled={isSpinning} className="w-full max-w-[200px]">
        {isSpinning ? 'جاري التدوير...' : 'دَوّر العجلة'}
      </Button>
    </div>
  );
}
