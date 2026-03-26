import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/hooks/use-game-store";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { formatRp, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, Play, Zap, SquareSquare, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

const TILES = ["🀄","🀅","🀆","🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🎯","💎","🔥","⭐"];

export default function GamePage() {
  const [, setLocation] = useLocation();
  const { session, currentUserData, config, updateCurrentUserData, logout, resetUserGame } = useGameStore();
  
  const [taruhan, setTaruhan] = useState(1000);
  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [tiles, setTiles] = useState<string[]>(Array(12).fill(""));
  const [spinKey, setSpinKey] = useState(0); // Forces remount of tiles for animation
  
  const [hasilText, setHasilText] = useState("TEKAN MAIN");
  const [hasilType, setHasilType] = useState<""|"spin"|"win"|"jackpot"|"lose"|"near">("");
  
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop auto mode on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, []);

  if (!currentUserData) return null;

  const mainGame = () => {
    if (running) return;
    if (currentUserData.saldo <= 0) {
      setHasilText("SALDO HABIS!");
      setHasilType("lose");
      stopAuto();
      return;
    }

    setRunning(true);
    setHasilText("SPINNING...");
    setHasilType("spin");
    setSpinKey(prev => prev + 1);

    // Generate random tiles
    const newTiles = Array.from({ length: 12 }, () => TILES[Math.floor(Math.random() * TILES.length)]);
    setTiles(newTiles);

    // Wait for animations to finish before calculating result (12 * 55ms + 600ms = ~1200ms)
    setTimeout(() => {
      const r = Math.random() * 100;
      const jp = config.pctJackpot;
      const win = jp + config.pctMenang;
      
      let newSaldo = currentUserData.saldo;
      let newKalahCount = currentUserData.kalahCount;
      let newMenang = currentUserData.menang;
      const newRiwayat = [...(currentUserData.riwayat || [])];
      let newType = "";
      let newText = "";

      if (r < jp) {
        newSaldo += taruhan * config.multiJackpot;
        newKalahCount = 0;
        newMenang++;
        newText = "💰 JACKPOT!!!";
        newType = "jackpot";
        newRiwayat.push("J");
      } else if (r < win) {
        newSaldo += taruhan;
        newKalahCount = 0;
        newMenang++;
        newText = "✅ MENANG";
        newType = "win";
        newRiwayat.push("W");
      } else {
        newSaldo -= taruhan;
        newKalahCount++;
        const near = Math.random() * 100 < config.pctHampir;
        newText = near ? "😬 HAMPIR MENANG..." : "❌ KALAH";
        newType = near ? "near" : "lose";
        newRiwayat.push("L");
      }

      if (newRiwayat.length > 50) newRiwayat.shift();

      updateCurrentUserData({
        saldo: newSaldo,
        total: currentUserData.total + 1,
        menang: newMenang,
        kalahCount: newKalahCount,
        riwayat: newRiwayat
      });

      setHasilText(newText);
      setHasilType(newType as any);
      setRunning(false);

      if (autoMode && (newKalahCount >= config.targetKalah || newSaldo <= 0)) {
        stopAuto();
        setHasilText("⛔ AUTO STOP");
        setHasilType("lose");
      }

    }, 1200);
  };

  const startAuto = () => {
    if (autoMode) return;
    setAutoMode(true);
    if (!running) mainGame();
    autoTimerRef.current = setInterval(() => {
      // Need a way to ensure we don't double call if running is true
      // Relying on the state inside the interval can be tricky due to closures.
      // So we just simulate a click on the mainGame which handles `running` check.
      document.getElementById('btn-main-hidden')?.click();
    }, 1400);
  };

  const stopAuto = () => {
    setAutoMode(false);
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  const handleReset = () => {
    stopAuto();
    resetUserGame();
    setTiles(Array(12).fill(""));
    setHasilText("TEKAN MAIN");
    setHasilType("");
  };

  const handleLogout = () => {
    stopAuto();
    logout();
  };

  const winRate = currentUserData.total > 0 
    ? Math.round((currentUserData.menang / currentUserData.total) * 100) 
    : 0;

  return (
    <MobileContainer className="bg-[#0b090a] overflow-y-auto overflow-x-hidden pb-16">
      
      {/* Hidden button for interval trigger */}
      <button id="btn-main-hidden" className="hidden" onClick={mainGame}></button>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#1a0b0b] to-[#0b090a] border-b border-white/5 px-4 py-3 flex justify-between items-center shadow-lg">
        <h1 className="font-display font-bold text-xl text-gradient-gold">🎰 RAJA MERAK</h1>
        <div className="flex items-center gap-3">
          {session?.isAdmin && (
            <button 
              onClick={() => setLocation("/admin")}
              className="bg-blue-600/20 text-blue-400 p-1.5 rounded-md hover:bg-blue-600/40 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-white/80 transition-colors"
          >
            👤 {session?.username === '__admin__' ? 'Admin' : session?.username} 
            <LogOut className="w-3.5 h-3.5 ml-1 text-red-400" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center">
        
        {/* Hero Banner */}
        <div className="w-full relative overflow-hidden bg-[url('/images/hero-bg.png')] bg-cover bg-center h-48 border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b090a] via-transparent to-transparent z-0"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-2">
            <motion.img 
              src={`${import.meta.env.BASE_URL}images/dragon-emblem.png`}
              alt="Dragon Scatter"
              className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
              animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <h2 className="font-display font-black text-2xl tracking-widest text-gradient-gold mt-1 animate-jackpot">
              SCATTER HITAM
            </h2>
          </div>
        </div>

        <div className="w-full px-4 -mt-4 z-20 flex flex-col items-center">
          
          {/* Result Box */}
          <div className={cn(
            "w-full text-center py-2.5 rounded-t-xl font-bold text-lg border-x border-t transition-all duration-300 shadow-lg",
            hasilType === "jackpot" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 animate-jackpot" :
            hasilType === "win" ? "bg-green-500/20 border-green-500 text-green-400" :
            hasilType === "lose" ? "bg-red-500/20 border-red-500 text-red-400" :
            hasilType === "near" ? "bg-orange-500/20 border-orange-500 text-orange-400" :
            hasilType === "spin" ? "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse" :
            "bg-card border-white/10 text-white/50"
          )}>
            {hasilText}
          </div>

          {/* Saldo Box */}
          <div className="w-full bg-card/90 backdrop-blur border border-white/10 p-4 rounded-b-xl shadow-2xl flex flex-col items-center">
            <p className="text-xs text-muted-foreground font-bold tracking-widest mb-1">SALDO VIRTUAL</p>
            <p className="text-4xl font-black text-gradient-gold tracking-tight drop-shadow-md">
              {formatRp(currentUserData.saldo)}
            </p>
            <p className="text-xs text-white/40 mt-2">
              Taruhan: {formatRp(taruhan)} <span className="mx-2">•</span> Kalah beruntun: {currentUserData.kalahCount}
            </p>
          </div>

          {/* Stats Row */}
          <div className="w-full grid grid-cols-3 gap-2 mt-3">
            <div className="bg-card border border-white/5 rounded-lg p-2 text-center shadow-md">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Main</p>
              <p className="text-lg font-bold text-white">{currentUserData.total}</p>
            </div>
            <div className="bg-card border border-white/5 rounded-lg p-2 text-center shadow-md">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Menang</p>
              <p className="text-lg font-bold text-green-400">{currentUserData.menang}</p>
            </div>
            <div className="bg-card border border-white/5 rounded-lg p-2 text-center shadow-md">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Win Rate</p>
              <p className="text-lg font-bold text-blue-400">{winRate}%</p>
            </div>
          </div>

          {/* Slot Grid */}
          <div className="w-full bg-[#120c0c] border-2 border-primary/30 rounded-xl p-3 mt-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-xl blur-md pointer-events-none"></div>
            
            <div className="grid grid-cols-4 gap-2 relative z-10">
              <AnimatePresence mode="wait">
                {tiles.map((tile, i) => (
                  <div key={`${spinKey}-${i}`} className="aspect-square bg-gradient-to-b from-[#2a1c1c] to-[#1a0b0b] rounded-lg border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                    {tile && (
                      <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20,
                          delay: i === 11 ? i * 0.05 + 0.3 : i * 0.05 
                        }}
                        className="text-4xl filter drop-shadow-md"
                      >
                        {tile}
                      </motion.div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full mt-5 bg-card/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-4 bg-black/40 rounded-lg p-2 border border-white/5">
              <label className="text-sm font-bold text-white/70 ml-2">Taruhan (Rp)</label>
              <input 
                type="number" 
                value={taruhan}
                onChange={(e) => setTaruhan(Math.max(100, parseInt(e.target.value) || 0))}
                className="w-32 bg-card border border-white/10 rounded-md py-1.5 px-3 text-right text-white font-bold focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={mainGame}
                disabled={running}
                className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-lg bg-gradient-to-b from-green-500 to-green-700 text-white shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Play className="fill-current w-5 h-5" /> MAIN
              </button>
              
              {!autoMode ? (
                <button 
                  onClick={startAuto}
                  disabled={running}
                  className="flex items-center justify-center gap-1 py-4 rounded-xl font-bold text-sm bg-gradient-to-b from-orange-400 to-orange-600 text-white shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Zap className="fill-current w-4 h-4" /> AUTO
                </button>
              ) : (
                <button 
                  onClick={stopAuto}
                  className="flex items-center justify-center gap-1 py-4 rounded-xl font-bold text-sm bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_4px_0_rgb(185,28,28)] active:translate-y-1 active:shadow-none transition-all animate-pulse"
                >
                  <SquareSquare className="fill-current w-4 h-4" /> STOP
                </button>
              )}

              <button 
                onClick={handleReset}
                disabled={running}
                className="flex items-center justify-center gap-1 py-4 rounded-xl font-bold text-sm bg-gradient-to-b from-slate-600 to-slate-800 text-white shadow-[0_4px_0_rgb(51,65,85)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* History */}
          <div className="w-full mt-4 mb-6">
            <h4 className="text-xs font-bold text-white/40 tracking-widest mb-2 px-1">RIWAYAT (50 TERAKHIR)</h4>
            <div className="bg-card/30 border border-white/5 rounded-xl p-3 flex flex-wrap gap-1.5 min-h-[60px] content-start shadow-inner">
              {currentUserData.riwayat?.length === 0 && (
                <span className="text-xs text-white/20 italic">Belum ada permainan</span>
              )}
              {currentUserData.riwayat?.map((r, i) => (
                <span 
                  key={i} 
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded text-[10px] font-black shadow-sm",
                    r === 'J' ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-[0_0_5px_rgba(255,215,0,0.5)]" :
                    r === 'W' ? "bg-green-600/80 text-white border border-green-500/50" :
                    "bg-red-900/60 text-white/70 border border-red-800/50"
                  )}
                >
                  {r === 'J' ? 'JP' : r}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
