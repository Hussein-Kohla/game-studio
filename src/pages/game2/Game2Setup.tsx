import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGame2Store } from '../../store/game2Store';

export function Game2Setup() {
  const [team1Name, setTeam1Name] = useState('الفريق الأزرق');
  const [team2Name, setTeam2Name] = useState('الفريق البنفسجي');
  const navigate = useNavigate();
  const setTeams = useGame2Store((state) => state.setTeams);

  const handleStart = () => {
    if (!team1Name.trim() || !team2Name.trim()) return;
    
    setTeams([
      { id: '1', name: team1Name, color: 'blue', score: 0 },
      { id: '2', name: team2Name, color: 'purple', score: 0 },
    ]);
    
    navigate('/game2/play');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card glow="purple" className="p-8 border-purple-500/20">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">إعداد الفرق</h2>
          
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="flex-1">
              <label className="block text-blue-400 font-bold mb-2">اسم الفريق الأول</label>
              <input 
                type="text" 
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-4 text-white outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                placeholder="أدخل اسم الفريق..."
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-purple-400 font-bold mb-2">اسم الفريق الثاني</label>
              <input 
                type="text" 
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-xl p-4 text-white outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                placeholder="أدخل اسم الفريق..."
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button size="xl" variant="purple" onClick={handleStart} className="w-full md:w-auto">
              ابدأ التحدي
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
