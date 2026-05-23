import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PhoneBanner } from '../../components/game4/PhoneBanner';
import { LockedSecret } from '../../components/game4/LockedSecret';
import { useGame4Store } from '../../store/game4Store';

export function Game4Reveal() {
  const navigate = useNavigate();
  const {
    players,
    imposterId,
    civilianWord,
    impostorWord,
    revealIndex,
    categoryLabel,
    roundNumber,
    advanceReveal,
  } = useGame4Store();

  if (players.length === 0 || !imposterId) {
    navigate('/game4/setup');
    return null;
  }

  if (revealIndex >= players.length) {
    navigate('/game4/questions');
    return null;
  }

  const current = players[revealIndex];
  const isImposter = current.id === imposterId;
  const secret = isImposter ? impostorWord : civilianWord;
  const [wordClosed, setWordClosed] = useState(false);

  useEffect(() => {
    setWordClosed(false);
  }, [current.id]);

  const handleNext = () => {
    advanceReveal();
    if (revealIndex + 1 >= players.length) {
      navigate('/game4/questions');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
      <p className="text-slate-500 text-sm mb-2">
        الجولة {roundNumber} — {categoryLabel}
      </p>

      <PhoneBanner
        playerName={current.name}
        avatarUrl={current.avatarUrl}
        subtitle={`لاعب ${revealIndex + 1} من ${players.length} — لا يطلع أحد على شاشتك!`}
      />

      <Card glow="none" className="w-full p-8 border-rose-500/20 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">{current.name}</h3>
        <LockedSecret
          key={current.id}
          label="كلمتك السرية"
          secret={secret}
          hint="لا تقل لأحد — الامبوستر لا يعرف أنه ايمبوستر"
          onClosed={() => setWordClosed(true)}
        />
      </Card>

      <Button
        size="lg"
        className="mt-8 w-full bg-rose-500 hover:bg-rose-600"
        onClick={handleNext}
        disabled={!wordClosed}
      >
        {revealIndex + 1 >= players.length ? 'بدء الأسئلة' : 'اللاعب التالي'}
      </Button>
      {!wordClosed && (
        <p className="text-slate-500 text-sm text-center mt-3">افتح الكلمة ثم اضغط «إغلاق» أولاً</p>
      )}
    </div>
  );
}
