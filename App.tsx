/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';
import { Smartphone, RefreshCw, Moon, Eye, Gamepad2, Volume2, ShieldAlert, Cpu } from 'lucide-react';

// Dynamic Camera Controller (keeps focus during lane expansions)
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; 

    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    // Base (3 lanes): y=5.5, z=8
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Look further down the track
    camera.lookAt(0, 0, -30); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

function App() {
  const { character, setStatus, status } = useStore();
  const [isEmulator, setIsEmulator] = useState(true);
  const [deviceTime, setDeviceTime] = useState('15:00');
  const [batteryFill, setBatteryFill] = useState(98);
  const [isSnoozed, setIsSnoozed] = useState(false); // Android Sleep mode triggered by locking
  const [notificationMsg, setNotificationMsg] = useState('Welcome Carl, Anthony and Ethan to Gemini Android OS!');
  const [showNotification, setShowNotification] = useState(true);

  // Auto-close toast notification after 4.5 seconds
  useEffect(() => {
     const timer = setTimeout(() => {
        setShowNotification(false);
     }, 4500);
     return () => clearTimeout(timer);
  }, []);

  // Sync initial emulator aspect layout (Default to borderless widescreen of desktops & tablets)
  useEffect(() => {
     if (window.innerWidth < 640 || window.innerWidth >= 1024) {
        setIsEmulator(false);
     }
  }, []);

  // Update dynamic devices clock (HH:MM AM/PM standard Android layout)
  useEffect(() => {
     const handleTime = () => {
         const date = new Date();
         let hours = date.getHours();
         const minutes = date.getMinutes().toString().padStart(2, '0');
         const ampm = hours >= 12 ? 'PM' : 'AM';
         hours = hours % 12;
         hours = hours ? hours : 12;
         setDeviceTime(`${hours}:${minutes} ${ampm}`);
     };
     handleTime();
     const intervalId = setInterval(handleTime, 1000);
     return () => clearInterval(intervalId);
  }, []);

  // Randomize battery decay slightly to look realistic!
  useEffect(() => {
     const batteryTimer = setInterval(() => {
         setBatteryFill(prev => Math.max(10, prev - (Math.random() > 0.8 ? 1 : 0)));
     }, 60000);
     return () => clearInterval(batteryTimer);
  }, []);

  // Dynamic colors for the notch/frame highlights based on Anthony / Ethan selections
  const primaryThemeColor = character === 'anthony' ? '#00f5ff' : '#ff00aa';
  const systemAccentClass = character === 'anthony' ? 'text-cyan-400' : 'text-pink-500';
  const borderAccentClass = character === 'anthony' ? 'border-cyan-400/30' : 'border-pink-500/30';
  const shadowAccentClass = character === 'anthony' ? 'shadow-[0_0_50px_rgba(6,182,212,0.15)]' : 'shadow-[0_0_50px_rgba(236,72,153,0.15)]';

  const triggerPowerKey = () => {
       setIsSnoozed(prev => !prev);
  };

  return (
    <div className="relative w-full h-screen bg-[#04010a] text-white flex flex-col items-center justify-center font-sans overflow-hidden select-none p-0 md:p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-black to-black">
      
      {/* Top Floating Settings Bar (Desktop only) */}
      <div className="absolute top-3 z-50 hidden sm:flex items-center space-x-4 bg-gray-900/80 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="flex items-center space-x-2">
              <Smartphone className={`w-4 h-4 ${systemAccentClass} animate-pulse`} />
              <span className="text-xs font-mono font-bold tracking-wider">{isEmulator ? 'GEMINI MOBILE EMULATOR' : 'GEMINI DESKTOP ACTIVE'}</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <button 
             onClick={() => setIsEmulator(prev => !prev)}
             className="flex items-center space-x-1.5 focus:outline-none hover:text-cyan-400 transition-colors text-xs font-mono font-bold"
             title="Toggle Emulator smartphone bezel versus full width"
          >
             <Eye className="w-3.5 h-3.5 text-gray-400" />
             <span>VIEW: {isEmulator ? 'EMULATOR PHONE' : 'BORDERLESS DESKTOP'}</span>
          </button>
      </div>

      {/* RENDER MODE A: Bezel Smartphone Emulator Mockup */}
      <div className={`relative transition-all duration-500 flex flex-col items-center justify-center ${isEmulator ? `w-full max-w-[395px] h-full max-h-[820px] aspect-[9/18.5] border-[12px] border-zinc-900 rounded-[50px] bg-black ${shadowAccentClass} ring-4 ring-neutral-800/10` : 'w-full h-screen p-0 border-0 rounded-none bg-black shadow-none ring-0'}`}>
          
          {/* Physical Phone Buttons on Emulator frames */}
          {isEmulator && (
             <>
                {/* Volume Upper Button */}
                <div 
                  onClick={() => window.dispatchEvent(new Event('player-move-left'))}
                  className="absolute left-[-16px] top-[140px] w-1 h-12 bg-zinc-800 border-l border-zinc-700/50 rounded-l-md cursor-pointer active:translate-x-0.5 transition-transform"
                  title="Android Volume Track Left"
                ></div>
                {/* Volume Lower Button */}
                <div 
                  onClick={() => window.dispatchEvent(new Event('player-move-right'))}
                  className="absolute left-[-16px] top-[198px] w-1 h-12 bg-zinc-800 border-l border-neutral-700/50 rounded-l-md cursor-pointer active:translate-x-0.5 transition-transform"
                  title="Android Volume Track Right"
                ></div>
                {/* Right Lock / Power Button: Triggers Sleep / Pause state */}
                <button 
                  onClick={triggerPowerKey}
                  className="absolute right-[-16px] top-[160px] w-1 h-16 bg-zinc-800 border-r border-neutral-700/50 rounded-r-md cursor-pointer active:-translate-x-0.5 transition-transform focus:outline-none z-50"
                  title="Android Power Key Lock screen Pause Toggle"
                ></button>

                {/* Smart Camera Sensor Notch */}
                <div className="absolute top-[8px] left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-[#08080a] border border-white/5 rounded-full z-50 flex items-center justify-center shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111116] flex items-center justify-center relative">
                        <div className="w-1 h-1 rounded-full bg-blue-700"></div>
                    </div>
                </div>
             </>
          )}

          {/* Device Display Screen Area */}
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#050011] select-none rounded-[36px] md:rounded-[36px]">
              
              {/* Android Top Status Bar */}
              {isEmulator && (
                  <div className="absolute top-0 inset-x-0 h-8 flex items-end justify-between px-6 z-50 bg-gradient-to-b from-black/40 to-transparent text-white font-mono text-[10px] select-none md:h-10 pointer-events-none">
                      {/* Left corner: Digital clock */}
                      <span className="font-bold tracking-tight">{deviceTime}</span>
                      
                      {/* Center punch-bezel alignment spacing */}
                      <div className="w-24 h-4"></div>

                      {/* Right corner icons: LTE/5G network, WiFi waves, battery grid */}
                      <div className="flex items-center space-x-1.5 pb-0.5">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{character === 'anthony' ? '5G_OS' : 'M_NET'}</span>
                          {/* Connection signal steps */}
                          <svg className="w-3 h-2.5 fill-current" viewBox="0 0 24 24">
                              <polygon points="1,24 23,24 23,2" />
                          </svg>
                          {/* Battery outline filler */}
                          <span className="text-[9px] scale-90 opacity-80">{batteryFill}%</span>
                          <div className="w-5 h-2.5 border border-white/40 rounded-sm p-[1px] flex items-center">
                              <div className={`h-full rounded-2xs ${batteryFill < 20 ? 'bg-red-500' : 'bg-green-400'}`} style={{ width: `${batteryFill}%` }}></div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Dynamic OS Toast Notifications Banner */}
              {showNotification && !isSnoozed && (
                  <div className="absolute top-10 inset-x-4 bg-gray-900/90 border border-white/10 p-3 rounded-2xl flex items-center space-x-2.5 z-50 animate-in slide-in-from-top-12 duration-350 shadow-2xl backdrop-blur-md">
                      <div className="w-7 h-7 bg-indigo-600/30 border border-indigo-400/20 text-indigo-400 rounded-lg flex items-center justify-center animate-pulse">
                          <Cpu className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono tracking-wider">
                              <span>SYSTEM NOTIFICATION</span>
                              <span>NOW</span>
                          </div>
                          <p className="text-[10px] text-gray-200 truncate font-mono">{notificationMsg}</p>
                      </div>
                  </div>
              )}

              {/* STAGE LOBBY LOCKSCREEN MODE (When phone is locked / Paused) */}
              {isSnoozed ? (
                  <div className="absolute inset-0 bg-black/95 z-[150] flex flex-col items-center justify-between p-8 font-mono animate-in fade-in duration-300 pointer-events-auto">
                      <div className="w-full flex justify-between items-center text-[10px] text-gray-500 mt-6 border-b border-white/5 pb-2">
                          <span>SYSTEM PAUSED</span>
                          <span>LOCK SCREEN LOCK</span>
                      </div>

                      <div className="flex flex-col items-center justify-center h-full my-auto text-center">
                          <Moon className={`w-12 h-12 text-yellow-400 animate-pulse mb-3`} style={{ filter: `drop-shadow(0 0 10px ${primaryThemeColor})` }} />
                          <h2 className="text-4xl font-extrabold font-cyber tracking-tight mb-2 text-white">
                              {deviceTime.split(' ')[0]}
                          </h2>
                          <p className="text-xs text-yellow-400 font-cyber font-black tracking-widest uppercase mb-1">
                               {character.toUpperCase()}'S RUN PAUSED
                          </p>
                          <p className="text-gray-500 text-[10px] max-w-xs mt-3 leading-relaxed">
                               The device has entered low-frequency sandboxed memory. Current game score **{useStore.getState().score} GEMS** and level details are encrypted safely in workspace RAM.
                          </p>
                      </div>

                      <button 
                         onClick={() => setIsSnoozed(false)}
                         className="w-full py-4 text-center border-t border-white/10 hover:border-white hover:text-[#00ffff] font-cyber font-bold tracking-widest text-xs uppercase cursor-pointer active:scale-95 transition-all"
                      >
                         [ TAP HERE TO UNLOCK HOST ]
                      </button>
                  </div>
              ) : null}

              {/* Native App Core HUD & Canvas Context mounts */}
              <HUD isEmulator={isEmulator} setIsEmulator={setIsEmulator} />

              <Canvas
                shadows
                dpr={[1, 1.2]} // Core mobile throttled dpr to run 60FPS seamlessly
                gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
                camera={{ position: [0, 5.5, 8], fov: 60 }}
              >
                <CameraController />
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
              </Canvas>

              {/* Android Software Navigation bottom bar */}
              {isEmulator && (
                  <div className="absolute bottom-0 inset-x-0 h-7 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent z-[90] pointer-events-none select-none">
                      {/* Android 3-Button Navigation (Left: triangle back, Middle: Home, Right: Recents) */}
                      <div className="flex items-center space-x-20 pointer-events-auto">
                          {/* TRIANGLE BACK softkey. Toggles selection menu on demand */}
                          <button 
                             onClick={() => {
                                 audio.init();
                                 if (status === GameStatus.PLAYING) {
                                     setStatus(GameStatus.MENU);
                                 } else if (status === GameStatus.MENU) {
                                     setIsSnoozed(true); // Locks device if already on menu
                                 }
                             }}
                             className="w-8 h-6 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity focus:outline-none"
                             title="Android Back button to Menu"
                          >
                             <svg className="w-3.5 h-3.5 transform -rotate-90 fill-white" viewBox="0 0 24 24">
                                  <polygon points="12,2 22,22 2,22" />
                             </svg>
                          </button>

                          {/* HOME CIRCLE softkey: Hard restarts to main menu */}
                          <button 
                             onClick={() => {
                                 audio.init();
                                 setStatus(GameStatus.MENU);
                             }}
                             className="w-4 h-4 rounded-full border border-white opacity-40 hover:opacity-100 transition-opacity focus:outline-none flex items-center justify-center bg-transparent"
                             title="Android Home softkey to Menu"
                          ></button>

                          {/* RECENTS SQUARE softkey: Open Shop portal if playing */}
                          <button 
                             onClick={() => {
                                 audio.init();
                                 if (status === GameStatus.PLAYING) {
                                     setStatus(GameStatus.SHOP);
                                 }
                             }}
                             className="w-3.5 h-3.5 border border-white opacity-40 hover:opacity-100 transition-opacity focus:outline-none rounded-none"
                             title="Android App Switcher / Portal shop"
                          ></button>
                      </div>
                  </div>
              )}

          </div>
      </div>

    </div>
  );
}

export default App;
