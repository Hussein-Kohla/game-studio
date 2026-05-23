import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '../../../convex/_generated/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GroupSelector } from '../../components/GroupSelector';
import { useGame1Store } from '../../store/game1Store';

export function Game1Setup() {
  const [team1Name, setTeam1Name] = useState('الفريق الأخضر');
  const [team2Name, setTeam2Name] = useState('الفريق الأحمر');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const navigate = useNavigate();
  const setTeams = useGame1Store((state) => state.setTeams);
  const groups = useQuery(api.prompts.getPromptGroups);

  const handleStart = () => {
    if (!team1Name.trim() || !team2Name.trim() || selectedGroupId === null) return;

    setTeams(
      [
        { id: '1', name: team1Name, color: 'green', score: 0 },
        { id: '2', name: team2Name, color: 'red', score: 0 },
      ],
      selectedGroupId
    );

    navigate('/game1/board');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card glow="green" className="p-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">إعداد اللعبة</h2>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-green-400 mb-4 text-center">اختر مجموعة المحتوى</h3>
            <GroupSelector
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelect={setSelectedGroupId}
              accentClass="border-green-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="flex-1">
              <label className="block text-green-400 font-bold mb-2">اسم الفريق الأول</label>
              <input
                type="text"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="w-full bg-black/40 border border-green-500/30 rounded-xl p-4 text-white outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                placeholder="أدخل اسم الفريق..."
              />
            </div>

            <div className="flex-1">
              <label className="block text-red-400 font-bold mb-2">اسم الفريق الثاني</label>
              <input
                type="text"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="w-full bg-black/40 border border-red-500/30 rounded-xl p-4 text-white outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                placeholder="أدخل اسم الفريق..."
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="xl"
              onClick={handleStart}
              className="w-full md:w-auto"
              disabled={selectedGroupId === null}
            >
              ابدأ اللعبة
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
