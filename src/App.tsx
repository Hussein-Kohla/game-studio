import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './pages/HomePage';
import { Game1Setup } from './pages/game1/Game1Setup';
import { Game1Board } from './pages/game1/Game1Board';
import { Game1Challenge } from './pages/game1/Game1Challenge';
import { Game2Setup } from './pages/game2/Game2Setup';
import { Game2Play } from './pages/game2/Game2Play';
import { Game3Setup } from './pages/game3/Game3Setup';
import { Game3Room } from './pages/game3/Game3Room';
import { Game3Reveal } from './pages/game3/Game3Reveal';
import { Game3Play } from './pages/game3/Game3Play';
import { Game4Setup } from './pages/game4/Game4Setup';
import { Game4Category } from './pages/game4/Game4Category';
import { Game4Reveal } from './pages/game4/Game4Reveal';
import { Game4Questions } from './pages/game4/Game4Questions';
import { Game4Vote } from './pages/game4/Game4Vote';
import { Game4Results } from './pages/game4/Game4Results';

// Game 5 Imports
import Game5Setup from './pages/game5/Game5Setup';
import Game5Room from './pages/game5/Game5Room';
import Game5Play from './pages/game5/Game5Play';
import Game5End from './pages/game5/Game5End';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-50 font-cairo" dir="rtl">
        <Navbar />
        <main className="flex-grow flex flex-col relative overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Game 1 Routes */}
            <Route path="/game1/setup" element={<Game1Setup />} />
            <Route path="/game1/board" element={<Game1Board />} />
            <Route path="/game1/challenge" element={<Game1Challenge />} />

            {/* Game 2 Routes */}
            <Route path="/game2/setup" element={<Game2Setup />} />
            <Route path="/game2/play" element={<Game2Play />} />

            {/* Game 3 Routes */}
            <Route path="/game3/setup" element={<Game3Setup />} />
            <Route path="/game3/room" element={<Game3Room />} />
            <Route path="/game3/reveal" element={<Game3Reveal />} />
            <Route path="/game3/play" element={<Game3Play />} />

            {/* Game 4 — Imposter */}
            <Route path="/game4/setup" element={<Game4Setup />} />
            <Route path="/game4/category" element={<Game4Category />} />
            <Route path="/game4/reveal" element={<Game4Reveal />} />
            <Route path="/game4/questions" element={<Game4Questions />} />
            <Route path="/game4/vote" element={<Game4Vote />} />
            <Route path="/game4/results" element={<Game4Results />} />

            {/* Game 5 Routes */}
            <Route path="/game5/setup" element={<Game5Setup />} />
            <Route path="/game5/room" element={<Game5Room />} />
            <Route path="/game5/play" element={<Game5Play />} />
            <Route path="/game5/end" element={<Game5End />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }} />
    </BrowserRouter>
  );
}

export default App;
