/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';
import { audio } from '../System/Audio';

// Physics Constants
const GRAVITY = 50;
const JUMP_FORCE = 16; // Results in ~2.56 height (v^2 / 2g)

// Static Geometries
const TORSO_GEO = new THREE.CylinderGeometry(0.25, 0.15, 0.6, 4);
const JETPACK_GEO = new THREE.BoxGeometry(0.3, 0.4, 0.15);
const GLOW_STRIP_GEO = new THREE.PlaneGeometry(0.05, 0.2);
const HEAD_GEO = new THREE.BoxGeometry(0.25, 0.3, 0.3);
const ARM_GEO = new THREE.BoxGeometry(0.12, 0.6, 0.12);
const JOINT_SPHERE_GEO = new THREE.SphereGeometry(0.07);
const HIPS_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.2);
const LEG_GEO = new THREE.BoxGeometry(0.15, 0.7, 0.15);
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 32);

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  
  // Limb Refs for Animation
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const { 
    status, 
    laneCount, 
    takeDamage, 
    hasDoubleJump, 
    activateImmortality, 
    isImmortalityActive, 
    character,
    isShieldActive,
    isMagnetActive,
    isBoostActive
  } = useStore();
  
  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);
  
  // Physics State (using Refs for immediate logic updates)
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const spinRotation = useRef(0); // For double jump flip
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  // Memoized Materials - Custom defined for Anthony and Ethan
  const { armorMaterial, jointMaterial, glowMaterial, shadowMaterial, accessoryMaterial, wingMaterial } = useMemo(() => {
      let armorColor = '#00aaff';
      let glowColor = '#00ffff';
      let accColor = '#00ffaa';
      let wingColor = '#55ffff';
      
      if (isImmortalityActive) {
          armorColor = '#ffd700'; // Golden
          glowColor = '#ffffff';
          accColor = '#ffffaa';
          wingColor = '#ffffaa';
      } else if (character === 'anthony') {
          armorColor = '#0055ff'; // Android Cyan/Blue Base
          glowColor = '#00f5ff';   // Cyan Matrix Glow
          accColor = '#00ffcc';    // Coding Goggles
          wingColor = '#00ffff';   // Jetpack booster fire
      } else {
          // Ethan
          armorColor = '#f50057'; // High intensity gaming pink/magenta
          glowColor = '#ff3d00';   // Hot Orange-Red gaming accents
          accColor = '#e040fb';    // Purple-magenta gaming headset
          wingColor = '#ff00ff';   // Neon purple wings
      }
      
      return {
          armorMaterial: new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.15, metalness: 0.85 }),
          jointMaterial: new THREE.MeshStandardMaterial({ color: '#16161c', roughness: 0.7, metalness: 0.4 }),
          glowMaterial: new THREE.MeshBasicMaterial({ color: glowColor }),
          shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.35, transparent: true }),
          accessoryMaterial: new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.1, metalness: 0.95, emissive: accColor, emissiveIntensity: 0.5 }),
          wingMaterial: new THREE.MeshStandardMaterial({ color: wingColor, roughness: 0.2, metalness: 0.9, transparent: true, opacity: 0.85, shadowSide: THREE.DoubleSide })
      };
  }, [isImmortalityActive, character]); // Recreate if immortality or character changes (perfect for hot swapping)

  // --- Reset State on Game Start ---
  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          isJumping.current = false;
          jumpsPerformed.current = 0;
          velocityY.current = 0;
          spinRotation.current = 0;
          if (groupRef.current) groupRef.current.position.y = 0;
          if (bodyRef.current) bodyRef.current.rotation.x = 0;
      }
  }, [status]);
  
  // Safety: Clamp lane if laneCount changes (e.g. restart)
  useEffect(() => {
      const maxLane = Math.floor(laneCount / 2);
      if (Math.abs(lane) > maxLane) {
          setLane(l => Math.max(Math.min(l, maxLane), -maxLane));
      }
  }, [laneCount, lane]);

  // --- Controls (Keyboard & Touch) ---
  const triggerJump = () => {
    const maxJumps = hasDoubleJump ? 2 : 1;

    if (!isJumping.current) {
        // First Jump
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = JUMP_FORCE;
    } else if (jumpsPerformed.current < maxJumps) {
        // Double Jump (Mid-air)
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = JUMP_FORCE; // Reset velocity upwards
        spinRotation.current = 0; // Start flip
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const maxLane = Math.floor(laneCount / 2);
      const key = e.key;
      const lowerKey = key.toLowerCase();

      if (key === 'ArrowLeft' || lowerKey === 'a') {
          setLane(l => Math.max(l - 1, -maxLane));
      } else if (key === 'ArrowRight' || lowerKey === 'd') {
          setLane(l => Math.min(l + 1, maxLane));
      } else if (key === 'ArrowUp' || lowerKey === 'w' || key === ' ') {
          triggerJump();
      } else if (key === 'Enter' || key === 'Shift' || lowerKey === 'f' || lowerKey === 'e') {
          activateImmortality();
      }
    };

    const handleLeftMove = () => {
      if (status !== GameStatus.PLAYING) return;
      const maxLane = Math.floor(laneCount / 2);
      setLane(l => Math.max(l - 1, -maxLane));
    };

    const handleRightMove = () => {
      if (status !== GameStatus.PLAYING) return;
      const maxLane = Math.floor(laneCount / 2);
      setLane(l => Math.min(l + 1, maxLane));
    };

    const handleJumpMove = () => {
      if (status !== GameStatus.PLAYING) return;
      triggerJump();
    };

    const handleImmortalityMove = () => {
      if (status !== GameStatus.PLAYING) return;
      activateImmortality();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('player-move-left', handleLeftMove);
    window.addEventListener('player-move-right', handleRightMove);
    window.addEventListener('player-move-jump', handleJumpMove);
    window.addEventListener('player-move-immortal', handleImmortalityMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('player-move-left', handleLeftMove);
      window.removeEventListener('player-move-right', handleRightMove);
      window.removeEventListener('player-move-jump', handleJumpMove);
      window.removeEventListener('player-move-immortal', handleImmortalityMove);
    };
  }, [status, laneCount, hasDoubleJump, activateImmortality]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (status !== GameStatus.PLAYING) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        const maxLane = Math.floor(laneCount / 2);

        // Swipe Detection
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
             if (deltaX > 0) setLane(l => Math.min(l + 1, maxLane));
             else setLane(l => Math.max(l - 1, -maxLane));
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -30) {
            triggerJump();
        }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, laneCount, hasDoubleJump, activateImmortality]);

  // --- Animation Loop ---
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) return;

    // 1. Horizontal Position
    targetX.current = lane * LANE_WIDTH;
    groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x, 
        targetX.current, 
        delta * 15 
    );

    // 2. Physics (Jump)
    if (isJumping.current) {
        // Apply Velocity
        groupRef.current.position.y += velocityY.current * delta;
        // Apply Gravity
        velocityY.current -= GRAVITY * delta;

        // Floor Collision
        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0;
            isJumping.current = false;
            jumpsPerformed.current = 0;
            velocityY.current = 0;
            // Reset flip
            if (bodyRef.current) bodyRef.current.rotation.x = 0;
        }

        // Double Jump Flip
        if (jumpsPerformed.current === 2 && bodyRef.current) {
             // Rotate 360 degrees quickly
             spinRotation.current -= delta * 15;
             if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
             bodyRef.current.rotation.x = spinRotation.current;
        }
    }

    // Banking Rotation
    const xDiff = targetX.current - groupRef.current.position.x;
    groupRef.current.rotation.z = -xDiff * 0.2; 
    groupRef.current.rotation.x = isJumping.current ? 0.1 : 0.05; 

    // 3. Skeletal Animation
    const time = state.clock.elapsedTime * 25; 
    
    if (!isJumping.current) {
        // Running Cycle
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 1.0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 1.0;
        
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time)) * 0.1;
    } else {
        // Jumping Pose
        const jumpPoseSpeed = delta * 10;
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.5, jumpPoseSpeed);
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.5, jumpPoseSpeed);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.5, jumpPoseSpeed);
        
        // Only reset Y if not flipping (handled by flip logic mostly, but safe here)
        if (bodyRef.current && jumpsPerformed.current !== 2) bodyRef.current.position.y = 1.1; 
    }

    // 4. Dynamic Shadow
    if (shadowRef.current) {
        const height = groupRef.current.position.y;
        const scale = Math.max(0.2, 1 - (height / 2.5) * 0.5); // 2.5 is max jump height approx
        const runStretch = isJumping.current ? 1 : 1 + Math.abs(Math.sin(time)) * 0.3;

        shadowRef.current.scale.set(scale, scale, scale * runStretch);
        const material = shadowRef.current.material as THREE.MeshBasicMaterial;
        if (material && !Array.isArray(material)) {
            material.opacity = Math.max(0.1, 0.3 - (height / 2.5) * 0.2);
        }
    }

    // Invincibility / Immortality Effect
    const showFlicker = isInvincible.current || isImmortalityActive;
    if (showFlicker) {
        if (isInvincible.current) {
             if (Date.now() - lastDamageTime.current > 1500) {
                isInvincible.current = false;
                groupRef.current.visible = true;
             } else {
                groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
             }
        } 
        if (isImmortalityActive) {
            groupRef.current.visible = true; 
        }
    } else {
        groupRef.current.visible = true;
    }
  });

  // Damage Handler
  useEffect(() => {
     const checkHit = (e: any) => {
        if (isInvincible.current || isImmortalityActive) return;
        audio.playDamage(); // Play damage sound
        takeDamage();
        isInvincible.current = true;
        lastDamageTime.current = Date.now();
     };
     window.addEventListener('player-hit', checkHit);
     return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Active Powerup: Energy Shield Bubble */}
      {isShieldActive && (
        <mesh position={[0, 1.1, 0]}>
           <sphereGeometry args={[1.08, 16, 16]} />
           <meshStandardMaterial color="#00e5ff" transparent opacity={0.2} wireframe emissive="#00e5ff" emissiveIntensity={1} />
        </mesh>
      )}

      {/* Active Powerup: Coin Magnet Field */}
      {isMagnetActive && (
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, Math.floor(Date.now() / 40) * 0.1]}>
           <torusGeometry args={[0.75, 0.03, 8, 20]} />
           <meshStandardMaterial color="#00ffd2" transparent opacity={0.4} emissive="#00ffd2" emissiveIntensity={1.5} />
        </mesh>
      )}

      {/* Active Powerup: Jet Boost Thruster Fire */}
      {isBoostActive && (
        <group position={[0, 1.1, -0.3]}>
           {/* Boost trail cones */}
           <mesh position={[-0.15, -0.3, 0]} rotation={[-Math.PI / 6, 0, 0]}>
              <coneGeometry args={[0.12, 0.7, 4]} />
              <meshBasicMaterial color="#ffeb3b" />
           </mesh>
           <mesh position={[0.15, -0.3, 0]} rotation={[-Math.PI / 6, 0, 0]}>
              <coneGeometry args={[0.12, 0.7, 4]} />
              <meshBasicMaterial color="#ffeb3b" />
           </mesh>
        </group>
      )}
      <group ref={bodyRef} position={[0, 1.1, 0]}> 
        
        {/* Torso */}
        <mesh castShadow position={[0, 0.2, 0]} geometry={TORSO_GEO} material={armorMaterial} />

        {/* Jetpack & Accessories */}
        <mesh position={[0, 0.2, -0.2]} geometry={JETPACK_GEO} material={jointMaterial} />
        <mesh position={[-0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
        <mesh position={[0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
        
        {/* Ethan's Energy Gaming Wings */}
        {character === 'ethan' && (
          <group position={[0, 0.2, -0.25]}>
             {/* Left Wing */}
             <mesh position={[-0.4, 0.1, -0.1]} rotation={[0.4, -0.5, -0.4]} material={wingMaterial}>
                <boxGeometry args={[0.7, 0.15, 0.03]} />
             </mesh>
             {/* Right Wing */}
             <mesh position={[0.4, 0.1, -0.1]} rotation={[0.4, 0.5, 0.4]} material={wingMaterial}>
                <boxGeometry args={[0.7, 0.15, 0.03]} />
             </mesh>
          </group>
        )}
        
        {/* Anthony's Tech Jetpack Flames */}
        {character === 'anthony' && (
          <group position={[0, -0.05, -0.25]}>
             <mesh position={[-0.08, 0, 0]} material={glowMaterial}>
                <coneGeometry args={[0.04, 0.2, 4]} />
             </mesh>
             <mesh position={[0.08, 0, 0]} material={glowMaterial}>
                <coneGeometry args={[0.04, 0.2, 4]} />
             </mesh>
          </group>
        )}

        {/* Head with dynamic character attachments */}
        <group ref={headRef} position={[0, 0.6, 0]}>
            <mesh castShadow geometry={HEAD_GEO} material={armorMaterial} />
            
            {/* Anthony's Cyber Coding Goggles */}
            {character === 'anthony' && (
              <group position={[0, 0.04, 0.1]}>
                {/* Visor shield */}
                <mesh material={accessoryMaterial}>
                   <boxGeometry args={[0.27, 0.07, 0.12]} />
                </mesh>
                {/* Connector slot */}
                <mesh position={[0.14, 0, -0.08]} material={jointMaterial}>
                   <cylinderGeometry args={[0.03, 0.03, 0.08, 6]} />
                </mesh>
                {/* Beacon node */}
                <mesh position={[0.15, 0, -0.08]} material={glowMaterial}>
                   <sphereGeometry args={[0.015]} />
                </mesh>
              </group>
            )}

            {/* Ethan's Pro Gaming Headset */}
            {character === 'ethan' && (
              <group>
                {/* Arch band */}
                <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} material={accessoryMaterial}>
                   <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
                </mesh>
                {/* Left Ear Pad */}
                <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={accessoryMaterial}>
                   <cylinderGeometry args={[0.08, 0.08, 0.04, 8]} />
                </mesh>
                <mesh position={[-0.165, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={glowMaterial}>
                   <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
                </mesh>
                {/* Right Ear Pad */}
                <mesh position={[0.14, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={accessoryMaterial}>
                   <cylinderGeometry args={[0.08, 0.08, 0.04, 8]} />
                </mesh>
                <mesh position={[0.165, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={glowMaterial}>
                   <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
                </mesh>
                {/* Mic boom */}
                <mesh position={[-0.1, -0.06, 0.12]} rotation={[0.5, -0.5, 0]} material={jointMaterial}>
                   <cylinderGeometry args={[0.01, 0.01, 0.14, 4]} />
                </mesh>
                <mesh position={[-0.05, -0.1, 0.17]} material={glowMaterial}>
                   <sphereGeometry args={[0.018]} />
                </mesh>
              </group>
            )}
        </group>

        {/* Arms */}
        <group position={[0.32, 0.4, 0]}>
            <group ref={rightArmRef}>
                <mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} />
                <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
            </group>
        </group>
        <group position={[-0.32, 0.4, 0]}>
            <group ref={leftArmRef}>
                 <mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} />
                 <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
                 
                 {/* Anthony's Wrist Cyber Terminal */}
                 {character === 'anthony' && (
                   <group position={[-0.08, -0.18, 0.06]} rotation={[0.2, 0.3, -0.15]}>
                      <mesh material={jointMaterial}>
                         <boxGeometry args={[0.15, 0.1, 0.04]} />
                      </mesh>
                      <mesh position={[0, 0, 0.025]} material={accessoryMaterial}>
                         <boxGeometry args={[0.12, 0.08, 0.01]} />
                      </mesh>
                   </group>
                 )}
            </group>
        </group>

        {/* Hips */}
        <mesh position={[0, -0.15, 0]} geometry={HIPS_GEO} material={jointMaterial} />

        {/* Legs */}
        <group position={[0.12, -0.25, 0]}>
            <group ref={rightLegRef}>
                 <mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} />
            </group>
        </group>
        <group position={[-0.12, -0.25, 0]}>
            <group ref={leftLegRef}>
                 <mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} />
            </group>
        </group>
      </group>
      
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={SHADOW_GEO} material={shadowMaterial} />
    </group>
  );
};