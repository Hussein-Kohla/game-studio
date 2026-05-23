import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PhoneBanner } from '../../components/game4/PhoneBanner';
import { useGame4Store } from '../../store/game4Store';
import { PlayerAvatar } from '../../components/game4/PlayerAvatar';
import { playTurnSound } from '../../utils/sounds';

export function Game4Questions() {
  const navigate = useNavigate();
  const { players, questionStep, advanceQuestion, categoryLabel, roundNumber } = useGame4Store();

  if (players.length === 0) {
    navigate('/game4/setup');
    return null;
  }

  if (questionStep >= players.length) {
    navigate('/game4/vote');
    return null;
  }

  const asker = players[questionStep];
  const target = players[(questionStep + 1) % players.length];

  const handleNext = () => {
    playTurnSound();
    advanceQuestion();
    if (questionStep + 1 >= players.length) {
      navigate('/game4/vote');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
      <p className="text-slate-500 text-sm mb-4">
        الجولة {roundNumber} — {categoryLabel} — مرحلة الأسئلة
      </p>

      <motion.div
        key={questionStep}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full"
      >
        <PhoneBanner playerName={asker.name} avatarUrl={asker.avatarUrl} subtitle="اسأل لاعباً واحداً سؤالاً قصيراً" />

        <Card className="p-8 text-center border-blue-500/30">
          <div className="flex justify-center gap-6 items-center mb-4">
            <div className="text-center">
              <PlayerAvatar url={asker.avatarUrl} name={asker.name} size="md" className="mx-auto mb-2" />
              <p className="text-2xl font-black text-blue-400">{asker.name}</p>
            </div>
            <span className="text-3xl text-slate-500">←</span>
            <div className="text-center">
              <PlayerAvatar url={target.avatarUrl} name={target.name} size="md" className="mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{target.name}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            كل لاعب يسأل مرة واحدة ويُسأل مرة واحدة ({questionStep + 1}/{players.length})
          </p>
        </Card>
      </motion.div>

      <Button size="lg" className="mt-8 w-full" variant="purple" onClick={handleNext}>
        {questionStep + 1 >= players.length ? 'بدء التصويت' : 'السؤال التالي'}
      </Button>
    </div>
  );
}
