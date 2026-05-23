import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, UserX } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlayerAvatar } from '../../components/game4/PlayerAvatar';
import { useGame4Store, type Game4Player } from '../../store/game4Store';
import { PLAYER_AVATARS, defaultAvatarForIndex } from '../../data/game4Assets';

function newPlayer(index: number): Game4Player {
  return {
    id: crypto.randomUUID(),
    name: `لاعب ${index}`,
    score: 0,
    avatarUrl: defaultAvatarForIndex(index - 1),
  };
}

export function Game4Setup() {
  const navigate = useNavigate();
  const setConfig = useGame4Store((s) => s.setConfig);
  const [players, setPlayers] = useState<Game4Player[]>([newPlayer(1), newPlayer(2), newPlayer(3)]);
  const [winScore, setWinScore] = useState(5);
  const [pickingAvatarFor, setPickingAvatarFor] = useState<string | null>(null);

  const addPlayer = () => {
    if (players.length >= 12) return;
    setPlayers([...players, newPlayer(players.length + 1)]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 3) return;
    setPlayers(players.filter((p) => p.id !== id));
  };

  const updateName = (id: string, name: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const setAvatar = (id: string, avatarUrl: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, avatarUrl } : p)));
    setPickingAvatarFor(null);
  };

  const handleStart = () => {
    const valid = players.every((p) => p.name.trim());
    if (!valid || players.length < 3) return;
    setConfig(
      players.map((p) => ({ ...p, name: p.name.trim(), score: 0 })),
      Math.max(1, winScore)
    );
    navigate('/game4/category');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card glow="none" className="p-8 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <h2 className="text-4xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
            الامبوستر
          </h2>
          <p className="text-slate-400 text-center mb-8">أضف اللاعبين واختر صورة مضحكة لكل واحد</p>

          <div className="mb-6">
            <label className="block text-rose-400 font-bold mb-2">نقاط الفوز</label>
            <input
              type="number"
              min={1}
              max={50}
              value={winScore}
              onChange={(e) => setWinScore(Number(e.target.value))}
              className="w-full bg-black/40 border border-rose-500/30 rounded-xl p-4 text-white text-center text-2xl font-black outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-3 mb-4 max-h-[36vh] overflow-y-auto">
            {players.map((player) => (
              <div key={player.id} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setPickingAvatarFor(pickingAvatarFor === player.id ? null : player.id)}
                  className="shrink-0 rounded-full ring-2 ring-rose-500/30 hover:ring-rose-500"
                >
                  <PlayerAvatar url={player.avatarUrl} name={player.name} size="sm" />
                </button>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updateName(player.id, e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500"
                  placeholder="اسم اللاعب"
                />
                <button
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  disabled={players.length <= 3}
                  className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {pickingAvatarFor && (
            <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/10">
              <p className="text-sm text-slate-400 mb-3 text-center">اختر صورة اللاعب</p>
              <div className="grid grid-cols-4 gap-2">
                {PLAYER_AVATARS.map((url) => (
                  <button key={url} type="button" onClick={() => setAvatar(pickingAvatarFor, url)}>
                    <PlayerAvatar
                      url={url}
                      size="sm"
                      className={
                        players.find((p) => p.id === pickingAvatarFor)?.avatarUrl === url
                          ? 'border-rose-500 ring-2 ring-rose-400'
                          : ''
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mb-6 border border-dashed border-white/20"
            onClick={addPlayer}
            disabled={players.length >= 12}
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة لاعب
          </Button>

          {players.length < 3 && (
            <p className="text-red-400 text-sm text-center mb-4 flex items-center justify-center gap-2">
              <UserX size={16} /> الحد الأدنى 3 لاعبين
            </p>
          )}

          <Button
            size="xl"
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
            onClick={handleStart}
            disabled={players.length < 3}
          >
            التالي — اختيار التصنيف
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
