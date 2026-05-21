/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, Trophy, MapPin, Diamond, Rocket, 
  ArrowUpCircle, Shield, Activity, PlusCircle, Play,
  Smartphone, Volume2, VolumeX, RotateCcw, Cpu, Gamepad2, Info
} from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, GEMINI_COLORS, ShopItem, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air. E.g. hover-thrusters or gaming double jump.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart slot and heals you to full.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point instantly.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock Ability: Tap the Shield to be invincible for 5 seconds.',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality, character } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        // Select random shop items
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        // Shuffle and pick up to 3
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, [hasDoubleJump, hasImmortality]);

    const activeColor = character === 'anthony' ? 'text-cyan-400' : 'text-pink-500';
    const activeBorder = character === 'anthony' ? 'hover:border-cyan-400' : 'hover:border-pink-500';
    const activeBg = character === 'anthony' ? 'from-cyan-600 to-blue-600' : 'from-pink-600 to-purple-600';

    return (
        <div className="absolute inset-0 bg-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4 font-sans">
                 <div className="flex items-center space-x-2 mb-2">
                     <Cpu className={`w-8 h-8 ${activeColor} animate-pulse`} />
                     <h2 className="text-3xl md:text-4xl font-cyber font-black tracking-widest text-center">CYBER SHOP</h2>
                 </div>
                 <div className="flex items-center text-yellow-400 mb-6 font-cyber">
                     <span className="text-xs md:text-sm mr-2">SECURE CREDITS:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()} GEMS</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                      {items.map(item => {
                          const Icon = item.icon;
                          const canAfford = score >= item.cost;
                          return (
                              <div key={item.id} className={`bg-gray-900/90 border border-gray-800 p-4 md:p-6 rounded-2xl flex flex-col items-center text-center transition-all ${activeBorder} hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                  <div className="bg-white/5 p-3 md:p-4 rounded-full mb-3 shadow-inner">
                                      <Icon className={`w-6 h-6 md:w-8 md:h-8 ${activeColor}`} />
                                  </div>
                                  <h3 className="text-base md:text-lg font-cyber font-bold mb-1 tracking-wider">{item.name}</h3>
                                  <p className="text-gray-400 text-xs mb-4 min-h-[3rem] flex items-center justify-center">{item.description}</p>
                                  <button 
                                     onClick={() => {
                                         if (buyItem(item.id as any, item.cost)) {
                                             audio.playLetterCollect();
                                         }
                                     }}
                                     disabled={!canAfford}
                                     className={`px-4 md:px-6 py-2.5 rounded-xl font-bold w-full text-sm font-cyber transition-all ${canAfford ? `${activeBg} hover:brightness-110 active:scale-95 shadow-md` : 'bg-gray-800 cursor-not-allowed opacity-40'}`}
                                  >
                                      BUY FOR {item.cost}
                                  </button>
                              </div>
                          );
                      })}
                      {items.length === 0 && (
                          <div className="col-span-3 text-center text-gray-500 py-8">
                             SHOP CURRENTLY OUT OF STOCK
                          </div>
                      )}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-10 py-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-white hover:to-white hover:text-black border border-white/10 text-white font-cyber font-bold text-base rounded-2xl transition-all shadow-lg active:scale-95"
                 >
                     RESUME DASH <Play className="ml-2 w-4 h-4" fill="currentColor" />
                 </button>
             </div>
        </div>
    );
};

const GameLogo: React.FC<{ character: string }> = ({ character }) => {
  const isAnthony = character === 'anthony';
  const primaryGlow = isAnthony ? 'shadow-[0_0_25px_rgba(6,182,212,0.5)]' : 'shadow-[0_0_25px_rgba(236,72,153,0.5)]';
  const primaryBorder = isAnthony ? 'border-cyan-400' : 'border-pink-500';
  const neonText = isAnthony ? 'text-cyan-400' : 'text-pink-500';
  const ring1Color = isAnthony ? 'border-t-cyan-400 border-b-cyan-400/40' : 'border-t-pink-500 border-b-pink-500/40';
  const ring2Color = isAnthony ? 'border-l-indigo-400 border-r-indigo-400/40' : 'border-l-purple-500 border-r-purple-500/40';

  return (
    <div className="relative w-28 h-28 md:w-32 md:h-32 mb-4 flex items-center justify-center group select-none">
      {/* 1. Backdrop Cyber Radial Glow */}
      <div className="absolute inset-[-10px] bg-gradient-to-tr from-[#00f0ff]/15 via-purple-600/5 to-[#ff0080]/15 blur-2xl rounded-full scale-100 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>

      {/* 2. outer rotating cyber ring (dashed border) */}
      <div className={`absolute inset-0 border-2 border-dashed ${primaryBorder} ${primaryGlow} rounded-full animate-[spin_15s_linear_infinite] opacity-65`}></div>

      {/* 3. Outer rotating solid energy bar ring with gaps */}
      <div className={`absolute inset-1.5 border-4 border-transparent ${ring1Color} rounded-full animate-[spin_6s_linear_infinite] opacity-80 z-10`}></div>

      {/* 4. Opposite rotating precision crosshair ring */}
      <div className={`absolute inset-4 border border-transparent ${ring2Color} rounded-full animate-spin-reverse opacity-75 z-10`}></div>

      {/* 5. Center Core Capsule / Medallion */}
      <div className="absolute inset-7 bg-gradient-to-b from-[#13072e] to-[#04000f] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-white/35 transform group-hover:scale-105 transition-all duration-300 z-20">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scan-line {
            0% { transform: translateY(-40px); opacity: 0.1; }
            50% { transform: translateY(40px); opacity: 1; }
            100% { transform: translateY(-40px); opacity: 0.1; }
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-scan-custom {
            animation: scan-line 3.5s ease-in-out infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 8s linear infinite;
          }
        `}} />
        {/* Dynamic scanning laser line */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent top-1/2 -mt-px animate-scan-custom"></div>
        <div className="absolute inset-[-4px] bg-gradient-to-tr from-[#00f0ff]/10 via-transparent to-[#ff0080]/10 opacity-70"></div>
        
        {/* The core CPU chip symbol representing AI execution logic */}
        <Cpu className={`w-8 h-8 md:w-9 md:h-9 ${neonText} animate-[pulse_2s_infinite] drop-shadow-[0_0_12px_currentColor]`} />
      </div>

      {/* 6. Satellite Particles / Orbiting Nodes */}
      <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -top-1 left-12 animate-ping shadow-[0_0_8px_#00f0ff]"></div>
      <div className="absolute w-1.5 h-1.5 rounded-full bg-pink-500 -bottom-1 right-12 animate-ping shadow-[0_0_8px_#ff0080]"></div>
    </div>
  );
};

interface HUDProps {
  isEmulator?: boolean;
  setIsEmulator?: (val: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({ isEmulator = true, setIsEmulator }) => {
  const { 
    score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, 
    gemsCollected, distance, isImmortalityActive, speed, character, setCharacter,
    vibrationEnabled, toggleVibration, hasDoubleJump, hasImmortality,
    isShieldActive, isMagnetActive, isBoostActive, setStatus
  } = useStore();
  
  const target = ['G', 'E', 'M', 'I', 'N', 'I'];
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Set initial sound gain if toggled
  useEffect(() => {
     if (audio.masterGain) {
         audio.masterGain.gain.value = soundEnabled ? 0.4 : 0.0;
     }
  }, [soundEnabled]);

  // Handler for virtual d-pad
  const dispatchControl = (actionName: 'left' | 'right' | 'jump' | 'immortal') => {
      // Small touch feedback vibration
      if (vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(30);
      }
      window.dispatchEvent(new Event(`player-move-${actionName}`));
  };

  const themeTextColor = character === 'anthony' ? 'text-cyan-400' : 'text-pink-500';
  const themeGlow = character === 'anthony' ? 'shadow-[0_0_25px_rgba(0,240,255,0.4)] border-cyan-500/40 text-cyan-400' : 'shadow-[0_0_25px_rgba(255,0,128,0.4)] border-pink-500/40 text-pink-500';
  const themeBtnStyle = character === 'anthony' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_rgba(255,0,128,0.3)]';

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex flex-col items-center justify-start z-[100] bg-gradient-to-b from-[#0b011d] via-[#050011] to-black text-white p-4 overflow-y-auto pointer-events-auto">
              
              {/* Cover Logo and Game Title */}
              <div className="w-full max-w-lg mt-4 md:mt-8 flex flex-col items-center">
                  <GameLogo character={character} />
                  <h1 className="text-3xl md:text-4xl text-center font-black font-cyber tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-purple-400 to-[#ff0080] drop-shadow-[0_2px_15px_rgba(255,255,255,0.1)]">
                     {isEmulator ? 'OS MOBILE RUNNER' : 'GEMINI DESKTOP RUNNER'}
                  </h1>
                  <p className="text-gray-400 text-xs md:text-sm font-mono mt-1 text-center font-cyber tracking-widest text-[#00ffff]/80 uppercase">
                     {isEmulator ? 'Android Studio optimized framework' : 'High-Performance 3D Arcade Widescreen'}
                  </p>
              </div>

              {/* Dynamic Sound, Haptic & Device Settings on Menu */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 my-4 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl md:rounded-full backdrop-blur-md max-w-lg">
                  <button 
                     onClick={() => setSoundEnabled(!soundEnabled)}
                     className="flex items-center space-x-1.5 focus:outline-none hover:text-cyan-400 text-xs font-mono transition-colors"
                  >
                     {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                     <span>SOUND: {soundEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                  <button 
                     onClick={toggleVibration}
                     className="flex items-center space-x-1.5 focus:outline-none hover:text-pink-500 text-xs font-mono transition-colors"
                  >
                     <Smartphone className={`w-4 h-4 ${vibrationEnabled ? 'text-pink-500 animate-bounce' : 'text-gray-500'}`} />
                     <span>HAPTICS: {vibrationEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                  {setIsEmulator && (
                      <button 
                         onClick={() => setIsEmulator(!isEmulator)}
                         className="flex items-center space-x-1.5 focus:outline-none hover:text-yellow-400 text-xs font-mono transition-colors border-l border-white/10 pl-3 md:pl-4"
                      >
                         <Gamepad2 className={`w-4 h-4 ${isEmulator ? 'text-yellow-500' : 'text-teal-400'}`} />
                         <span>DISPLAY: {isEmulator ? 'MOBILE EMULATOR' : 'WIDESCREEN'}</span>
                      </button>
                  )}
              </div>

              {/* Character Selector panel with Anthony & Ethan */}
              <div className="w-full max-w-xl flex flex-col mt-2">
                  <h3 className="text-center font-cyber font-bold tracking-widest text-xs uppercase text-gray-400 mb-3 flex items-center justify-center space-x-2">
                       <Gamepad2 className="w-4 h-4 text-purple-400" />
                       <span>Select Android Tech Host</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      
                      {/* Card: Anthony */}
                      <button 
                         onClick={() => { audio.init(); setCharacter('anthony'); }}
                         className={`relative flex flex-col text-left p-4 rounded-3xl border transition-all ${character === 'anthony' ? 'bg-cyan-950/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30' : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'}`}
                      >
                         <div className="absolute top-3 right-3 flex items-center space-x-1 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                             <span className="text-[10px] font-cyber tracking-widest text-cyan-400 font-bold">CYAN SYSTEM</span>
                         </div>

                         <div className="flex items-center space-x-2.5 mb-2 mt-1">
                             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-cyber font-black text-white text-lg">A</div>
                             <div>
                                 <h4 className="text-base font-cyber tracking-wide font-black text-white leading-tight">ANTHONY</h4>
                                 <span className="text-[10px] text-cyan-400 font-mono">Gemini Cloud Architect</span>
                             </div>
                         </div>
                         <p className="text-gray-400 text-xs leading-relaxed mb-3">
                            Equipped with high-tech coding visor and arm terminal. Harnesses the power of Gemini code to optimize runs structure.
                         </p>
                         <div className="mt-auto w-full space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                             <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                                 <span>SYNTH DISH</span>
                                 <span className="text-cyan-400">95% (Blue Pulse)</span>
                             </div>
                             <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-cyan-500 rounded-full" style={{ width: '95%' }}></div>
                             </div>
                         </div>
                      </button>

                      {/* Card: Ethan */}
                      <button 
                         onClick={() => { audio.init(); setCharacter('ethan'); }}
                         className={`relative flex flex-col text-left p-4 rounded-3xl border transition-all ${character === 'ethan' ? 'bg-pink-950/20 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/30' : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'}`}
                      >
                         <div className="absolute top-3 right-3 flex items-center space-x-1 bg-pink-950 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                             <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></div>
                             <span className="text-[10px] font-cyber tracking-widest text-pink-500 font-bold">MAGENTA SYNC</span>
                         </div>

                         <div className="flex items-center space-x-2.5 mb-2 mt-1">
                             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-500 flex items-center justify-center font-cyber font-black text-white text-lg">E</div>
                             <div>
                                 <h4 className="text-base font-cyber tracking-wide font-black text-white leading-tight">ETHAN</h4>
                                 <span className="text-[10px] text-pink-500 font-mono">Neon Champion Gamer</span>
                             </div>
                         </div>
                         <p className="text-gray-400 text-xs leading-relaxed mb-3">
                            Equipped with audio headset booster and dual-thruster angel wings. Translates extreme synth beats to dynamic physics jump heights.
                         </p>
                         <div className="mt-auto w-full space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                             <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                                 <span>REFLEX DRIFT</span>
                                 <span className="text-pink-500">92% (Pink Fire)</span>
                             </div>
                             <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-pink-500 rounded-full" style={{ width: '92%' }}></div>
                             </div>
                         </div>
                      </button>

                  </div>
              </div>

              {/* Core Execution Call To Action */}
              <div className="w-full max-w-sm mt-6 mb-8 flex flex-col items-center">
                  <button 
                      onClick={() => { audio.init(); startGame(); }}
                      className={`w-full group relative px-8 py-4 ${themeBtnStyle} text-white font-cyber font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden`}
                  >
                      <span className="relative z-10 tracking-widest flex items-center justify-center">
                          LAUNCH RUNNER <Play className="ml-2 w-5 h-5 fill-white" />
                      </span>
                  </button>
                  <p className="text-gray-500 text-[10px] font-mono mt-3 tracking-widest uppercase text-center max-w-xs leading-relaxed">
                      {isEmulator ? 'swipe or tap client panel to move' : 'Use A/D or Arrow keys to steer, Spacebar to jump'}
                  </p>
              </div>

          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-[#050011]/95 text-white pointer-events-auto backdrop-blur-md overflow-y-auto index-100 z-[100] flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-gray-900/60 border border-white/5 rounded-3xl p-6 flex flex-col items-center shadow-2xl">
                 <h1 className="text-3xl md:text-4xl font-cyber font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.4)] mb-4 tracking-widest text-center">
                    RUN FLUSHED
                 </h1>
                 
                 <div className="w-full my-2 flex justify-center space-x-2 bg-black/20 p-2.5 rounded-full border border-white/5 text-gray-400 font-mono text-xs">
                     <span>OPERATOR:</span>
                     <span className={`font-bold ${themeTextColor} capitalize`}>{character}</span>
                 </div>

                 <div className="grid grid-cols-1 gap-2.5 text-center mt-3 mb-6 w-full max-w-md">
                     <div className="bg-black/35 p-3 rounded-2xl border border-white/5 flex items-center justify-between font-mono">
                         <div className="flex items-center text-yellow-400 text-xs uppercase tracking-wider"><Trophy className="mr-1.5 w-4 h-4"/> MAX LEVEL</div>
                         <div className="text-base font-cyber font-bold">{level} / 3</div>
                     </div>
                     <div className="bg-black/35 p-3 rounded-2xl border border-white/5 flex items-center justify-between font-mono">
                         <div className="flex items-center text-cyan-400 text-xs uppercase tracking-wider"><Diamond className="mr-1.5 w-4 h-4"/> GEMS SAVED</div>
                         <div className="text-base font-cyber font-bold">{gemsCollected}</div>
                     </div>
                     <div className="bg-black/35 p-3 rounded-2xl border border-white/5 flex items-center justify-between font-mono">
                         <div className="flex items-center text-purple-400 text-xs uppercase tracking-wider"><MapPin className="mr-1.5 w-4 h-4"/> DISTANCE DIST</div>
                         <div className="text-base font-cyber font-bold">{Math.floor(distance)} LY</div>
                     </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between mt-2 font-mono">
                         <div className="text-gray-300 text-xs uppercase font-bold tracking-widest">NET SCORE</div>
                         <div className={`text-2xl font-black font-cyber ${themeTextColor}`}>{score.toLocaleString()}</div>
                     </div>
                 </div>

                 <button 
                    onClick={() => { audio.init(); restartGame(); }}
                    className={`w-full py-4 px-8 text-white font-cyber font-bold text-base rounded-2xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${themeBtnStyle}`}
                 >
                    <RotateCcw className="w-5 h-5 animate-spin-reverse" />
                    <span>LAUNCH PORTAL PORT</span>
                 </button>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b002c]/95 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900/60 border border-yellow-500/20 rounded-3xl p-6 flex flex-col items-center shadow-3xl text-center">
                <Rocket className="w-12 h-12 text-yellow-400 mb-2 animate-bounce flex drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                <h1 className="text-3xl md:text-4xl font-cyber font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 mb-1 drop-shadow-[0_0_25px_rgba(255,165,0,0.4)] tracking-widest">
                     COSMIC VICTORY
                </h1>
                <p className="text-cyan-300 text-[10px] font-mono tracking-widest uppercase mb-4">
                     THE MATRIX COMPLETED BY {character.toUpperCase()}
                </p>
                
                <div className="grid grid-cols-1 gap-3 mb-6 w-full">
                    <div className="bg-black/40 p-4 rounded-2xl border border-yellow-500/30">
                        <div className="text-[10px] text-gray-500 tracking-wider uppercase font-mono">FINAL SYSTEM SCORE</div>
                        <div className="text-3xl font-cyber font-bold text-yellow-400 mt-1">{score.toLocaleString()}</div>
                    </div>
                     <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="bg-black/40 py-2.5 px-1 rounded-xl border border-white/5">
                            <div className="text-[10px] text-gray-500">SAVED GEMS</div>
                            <div className="text-base font-cyber text-cyan-400 font-bold mt-1">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/40 py-2.5 px-1 rounded-xl border border-white/5">
                             <div className="text-[10px] text-gray-500">TRAVEL PATH</div>
                            <div className="text-base font-cyber text-purple-400 font-bold mt-1">{Math.floor(distance)} LY</div>
                        </div>
                     </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="w-full py-4 px-8 bg-white hover:bg-white/90 text-black font-cyber font-black tracking-wider text-base rounded-2xl transition-all shadow-lg active:scale-95"
                >
                    INITIALIZE AGAIN
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-50">
        
        {/* Top Info Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col bg-black/40 p-3.5 rounded-2xl border border-white/5 backdrop-blur-md">
                <span className="text-[10px] font-mono text-gray-400">CREDITS</span>
                <div className={`text-2xl md:text-3xl font-black font-cyber leading-none ${themeTextColor} tracking-wide drop-shadow-[0_0_8px_currentColor]`}>
                    {score.toLocaleString()}
                </div>
            </div>

            {/* Active Powerup HUD Badges */}
            <div className="absolute top-24 left-4 flex flex-col space-y-2 pointer-events-none">
                {isShieldActive && (
                    <div className="flex items-center space-x-1.5 bg-cyan-950/85 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-cyber font-black tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] backdrop-blur-md animate-pulse pointer-events-auto">
                        <Shield className="w-3.5 h-3.5 fill-cyan-400/20" />
                        <span>PLASMA SHIELD</span>
                    </div>
                )}
                {isMagnetActive && (
                    <div className="flex items-center space-x-1.5 bg-teal-950/85 border border-teal-500/30 text-teal-400 px-3 py-1 rounded-full text-[10px] font-cyber font-black tracking-wider shadow-[0_0_10px_rgba(20,184,166,0.3)] backdrop-blur-md animate-pulse pointer-events-auto">
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                        <span>COIN MAGNET</span>
                    </div>
                )}
                {isBoostActive && (
                    <div className="flex items-center space-x-1.5 bg-yellow-950/85 border border-yellow-500/30 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-cyber font-black tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.3)] backdrop-blur-md animate-pulse pointer-events-auto">
                        <Rocket className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />
                        <span>SPEED BOOST</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center space-x-2">
                <div className="flex bg-black/40 p-3 h-14 items-center justify-center space-x-1 border border-white/5 backdrop-blur-md rounded-2xl">
                    {[...Array(maxLives)].map((_, i) => (
                        <Heart 
                            key={i} 
                            className={`w-5 h-5 md:w-6 md:h-6 ${i < lives ? 'text-pink-500 fill-pink-500 animate-pulse' : 'text-gray-800 fill-gray-850'} drop-shadow-[0_0_4px_#ff0054]`} 
                        />
                    ))}
                </div>
                {/* Clean design pause button for native mobile views */}
                <button 
                  onPointerDown={(e) => {
                      e.preventDefault();
                      audio.playLetterCollect();
                      setStatus(GameStatus.MENU);
                  }}
                  className="flex bg-black/40 hover:bg-white/10 p-3.5 h-14 w-14 items-center justify-center border border-white/5 hover:border-white/20 backdrop-blur-md rounded-2xl pointer-events-auto transition-all active:scale-90"
                  title="Pause System Menu"
                >
                  <Cpu className={`w-5 h-5 ${themeTextColor} animate-pulse`} />
                </button>
            </div>
        </div>
        
        {/* Level Indicator Glass Pill */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className={`text-[10px] md:text-xs font-cyber font-black tracking-widest ${themeTextColor} bg-black/70 px-4 py-1.5 border border-white/5 rounded-full backdrop-blur-md shadow-md`}>
                LEVEL {level} <span className="text-gray-500">/ 3</span>
            </div>
        </div>

        {/* Dynamic Skills battery Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-yellow-400 font-cyber font-black text-xs animate-pulse flex items-center bg-yellow-950/40 border border-yellow-500/20 px-3.5 py-1 rounded-full drop-shadow-[0_0_10px_gold] backdrop-blur-sm shadow-md">
                 <Shield className="mr-1.5 w-4 h-4 fill-yellow-400" /> ACTIVE IMMORTAL PROTECTION
             </div>
        )}

        {/* Gemini Target Letter Collection Gauge */}
        <div className="absolute top-14 md:top-16 left-1/2 transform -translate-x-1/2 flex space-x-1 px-3 py-2 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-sm">
            {target.map((char, idx) => {
                const isCollected = collectedLetters.includes(idx);
                const color = GEMINI_COLORS[idx];

                return (
                    <div 
                        key={idx}
                        style={{
                            borderColor: isCollected ? color : 'rgba(75, 85, 101, 0.4)',
                            color: isCollected ? '#000000' : 'rgba(100, 116, 139, 1)',
                            boxShadow: isCollected ? `0 0 15px ${color}` : 'none',
                            backgroundColor: isCollected ? color : 'rgba(15, 15, 20, 0.85)'
                        }}
                        className="w-6 h-8 md:w-7 md:h-9 flex items-center justify-center border font-cyber font-black text-xs md:text-sm rounded-lg transform transition-all duration-300"
                    >
                        {char}
                    </div>
                );
            })}
        </div>

        {/* Left Side: Mobile Active Host Status Overlay */}
        <div className="absolute left-4 top-24 pointer-events-auto hidden sm:flex flex-col bg-black/40 border border-white/5 rounded-2xl p-2.5 text-[10px] font-mono tracking-wide backdrop-blur-sm">
            <span className="text-gray-500">DOCK HOST</span>
            <span className={`${themeTextColor} font-cyber font-bold uppercase`}>{character}</span>
            <div className="flex space-x-2 mt-1 py-1 text-gray-400">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="hover:text-white"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-500" />}
                </button>
                <button 
                  onClick={toggleVibration}
                  className="hover:text-white"
                >
                  <Smartphone className={`w-3.5 h-3.5 ${vibrationEnabled ? 'text-cyan-400' : ''}`} />
                </button>
            </div>
        </div>

        {/* KEYBOARD CONTROLS LEGEND OR CORE ANDROID VIRTUAL GAMEPAD / ON-SCREEN CONTROLS */}
        {!isEmulator ? (
             <div className="w-full pointer-events-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-3 bg-black/60 border border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-2xl">
                 <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] sm:text-xs tracking-wider text-gray-400">
                     <span className="text-gray-500 font-bold font-cyber pr-1.5 border-r border-white/10">STEER KEYS</span>
                     <div className="flex items-center space-x-1 border border-white/10 bg-black/40 px-2 py-1 rounded-lg text-white font-cyber font-black">
                         <span>A</span>
                     </div>
                     <span>/</span>
                     <div className="flex items-center space-x-1 border border-white/10 bg-black/40 px-2 py-1 rounded-lg text-white font-cyber font-black">
                         <span>◀</span>
                     </div>
                     <span className="text-gray-300">LEFT</span>

                     <div className="h-4 w-px bg-white/10 mx-1"></div>

                     <div className="flex items-center space-x-1 border border-white/10 bg-black/40 px-2 py-1 rounded-lg text-white font-cyber font-black">
                         <span>D</span>
                     </div>
                     <span>/</span>
                     <div className="flex items-center space-x-1 border border-white/10 bg-black/40 px-2 py-1 rounded-lg text-white font-cyber font-black">
                         <span>▶</span>
                     </div>
                     <span className="text-gray-300">RIGHT</span>
                 </div>

                 <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] sm:text-xs tracking-wider text-gray-400">
                     <span className="text-gray-500 font-bold font-cyber pr-1.5 border-r border-white/10">ACTION KEYS</span>
                     <div className="flex items-center space-x-1 border border-white/10 bg-black/40 px-2 py-1 rounded-lg text-white font-cyber font-black">
                         <span>W</span>
                     </div>
                     <span>/</span>
                     <div className="flex items-center space-x-1 border border-white/10 bg-black/40 px-2 py-1 rounded-lg text-white font-cyber font-black">
                         <span>▲</span>
                     </div>
                     <span>/</span>
                     <div className="flex items-center space-x-2 border border-white/10 bg-black/40 px-3 py-1 rounded-lg text-white font-cyber font-black">
                         <span>SPACEBAR</span>
                     </div>
                     <span className="text-gray-300">JUMP</span>

                     {hasImmortality && (
                         <>
                             <div className="h-4 w-px bg-white/10 mx-1"></div>
                             <div className="flex items-center space-x-2 border border-yellow-500/20 bg-yellow-950/20 text-yellow-500 px-3 py-1 rounded-lg font-cyber font-black animate-pulse">
                                 <span>SHIFT / ENTER / E / F</span>
                             </div>
                             <span className="text-yellow-400">SHIELD</span>
                         </>
                     )}
                 </div>
             </div>
        ) : (
             <div className="w-full flex items-end justify-between pointer-events-none mt-auto">
                  
                  {/* Left D-PAD group: Move lane left / right */}
                  <div className="flex space-x-3 pointer-events-auto">
                      <button 
                         onPointerDown={(e) => { e.preventDefault(); dispatchControl('left'); }}
                         className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-xl text-white transition-all capitalize border bg-black/60 backdrop-blur-md active:scale-90 ${themeGlow}`}
                      >
                          ◀
                      </button>
                      <button 
                         onPointerDown={(e) => { e.preventDefault(); dispatchControl('right'); }}
                         className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-xl text-white transition-all capitalize border bg-black/60 backdrop-blur-md active:scale-90 ${themeGlow}`}
                      >
                          ▶
                      </button>
                  </div>

                  {/* Right Action buttons group: Jump & Booster Ultimate Shield */}
                  <div className="flex space-x-3 pointer-events-auto items-end">
                      
                      {/* Immortals ultimate activation button */}
                      {hasImmortality && (
                           <button 
                              onPointerDown={(e) => { e.preventDefault(); dispatchControl('immortal'); }}
                              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center text-[10px] tracking-widest font-cyber font-black text-yellow-400 transition-all border border-yellow-500/40 bg-black/60 backdrop-blur-md active:scale-95 ${isImmortalityActive ? 'animate-ping border-yellow-400 ring-2 ring-yellow-400 bg-yellow-500/20' : 'shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:border-yellow-400'}`}
                           >
                              <Shield className="w-5 h-5 mb-0.5 fill-yellow-400/20" />
                              <span className="text-[7px]">SHIELD</span>
                           </button>
                      )}

                      {/* Jump Button */}
                      <button 
                         onPointerDown={(e) => { e.preventDefault(); dispatchControl('jump'); }}
                         className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center font-cyber font-black text-white text-xs transition-all tracking-widest border bg-black/60 backdrop-blur-md active:scale-90 shadow-2xl ${themeGlow}`}
                      >
                          <ArrowUpCircle className={`w-6 h-6 md:w-8 md:h-8 mb-1 uppercase ${themeTextColor}`} />
                          <span>JUMP</span>
                      </button>
                  </div>
             </div>
        )}

        {/* Speed indicators (Floating bottom margin HUD stats) */}
        <div className="absolute right-4 top-24 pointer-events-none flex flex-col items-end bg-black/40 border border-white/5 rounded-2xl p-2.5 max-h-16 font-mono text-[10px] tracking-wide backdrop-blur-sm sm:flex hidden text-right">
             <span className="text-gray-500">VELOCITY GAUGE</span>
             <span className="text-cyan-400 text-xs font-bold font-cyber mt-0.5">{Math.round((speed / RUN_SPEED_BASE) * 100)}% MPH</span>
        </div>
        
    </div>
  );
};
