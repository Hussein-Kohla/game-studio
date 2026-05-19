import { Link } from 'react-router-dom';
import { Gamepad2, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

export function Navbar() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <nav className="w-full p-4 flex justify-between items-center glass-panel sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-lg">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          ألعاب المنزل
        </h1>
      </Link>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>
      </div>
    </nav>
  );
}
