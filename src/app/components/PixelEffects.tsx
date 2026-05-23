import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  life: number;
}

export function usePixelParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = (x: number, y: number, count: number = 20, colors?: string[]) => {
    const defaultColors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#32CD32'];
    const particleColors = colors || defaultColors;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `${Date.now()}-${i}`,
        x,
        y,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        size: Math.random() * 8 + 4,
        velocityX: (Math.random() - 0.5) * 10,
        velocityY: (Math.random() - 0.5) * 10 - 5,
        life: 1,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // 动画粒子
    const animate = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY,
            velocityY: p.velocityY + 0.5, // 重力
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
    };

    const interval = setInterval(animate, 16);
    setTimeout(() => clearInterval(interval), 2000);
  };

  return { particles, createParticles };
}

export function PixelParticles({ particles }: { particles: Particle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 1 }}
          animate={{
            opacity: particle.life,
          }}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '2px',
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </div>
  );
}

export function useScreenShake() {
  const [isShaking, setIsShaking] = useState(false);

  const shake = (duration: number = 300) => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), duration);
  };

  return { isShaking, shake };
}

export function CRTFilter({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* 扫描线效果 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          animation: 'scanline 8s linear infinite',
        }}
      />

      {/* 轻微的发光效果 */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: 'radial-gradient(circle, transparent 0%, rgba(0,255,255,0.3) 100%)',
        }}
      />

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}

export function PixelButton({
  children,
  onClick,
  color = 'blue',
  size = 'md',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600 border-blue-700',
    red: 'bg-red-500 hover:bg-red-600 border-red-700',
    green: 'bg-green-500 hover:bg-green-600 border-green-700',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700',
    purple: 'bg-purple-500 hover:bg-purple-600 border-purple-700',
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-lg',
    lg: 'py-4 px-8 text-xl',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorClasses[color]}
        ${sizeClasses[size]}
        text-white font-bold rounded-lg border-4
        shadow-lg transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        fontFamily: 'monospace',
        imageRendering: 'pixelated',
      }}
    >
      {children}
    </motion.button>
  );
}
