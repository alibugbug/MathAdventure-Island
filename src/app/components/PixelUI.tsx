import { motion } from 'motion/react';
import { ReactNode } from 'react';

/**
 * 像素风格按钮组件
 * 增强版 - 使用新的像素样式系统
 */
interface PixelButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: PixelButtonProps) {
  const variants = {
    primary: {
      outer: 'bg-blue-600',
      inner: 'bg-blue-500',
      top: 'bg-blue-400',
      shadow: 'bg-blue-800',
      text: 'text-white',
      glow: 'rgba(59, 130, 246, 0.5)',
    },
    secondary: {
      outer: 'bg-purple-600',
      inner: 'bg-purple-500',
      top: 'bg-purple-400',
      shadow: 'bg-purple-800',
      text: 'text-white',
      glow: 'rgba(147, 51, 234, 0.5)',
    },
    success: {
      outer: 'bg-green-600',
      inner: 'bg-green-500',
      top: 'bg-green-400',
      shadow: 'bg-green-800',
      text: 'text-white',
      glow: 'rgba(34, 197, 94, 0.5)',
    },
    danger: {
      outer: 'bg-red-600',
      inner: 'bg-red-500',
      top: 'bg-red-400',
      shadow: 'bg-red-800',
      text: 'text-white',
      glow: 'rgba(239, 68, 68, 0.5)',
    },
    warning: {
      outer: 'bg-yellow-600',
      inner: 'bg-yellow-500',
      top: 'bg-yellow-400',
      shadow: 'bg-yellow-800',
      text: 'text-gray-900',
      glow: 'rgba(234, 179, 8, 0.5)',
    },
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-12 py-5 text-2xl',
  };

  const colors = variants[variant];

  return (
    <motion.button
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2,
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        y: disabled ? 0 : 2,
      }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative 
        ${sizes[size]} 
        ${className} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer pixel-btn-hover'}
        pixel-btn-press
      `}
      style={{ 
        fontFamily: 'monospace', 
        imageRendering: 'pixelated',
        boxShadow: disabled ? 'none' : `0 4px 0 ${colors.shadow}, 0 6px 10px rgba(0,0,0,0.3)`,
      }}
    >
      {/* 外层边框 */}
      <div 
        className={`relative ${colors.outer} p-1 pixel-border`}
        style={{ clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))' }}
      >
        {/* 内层高光 */}
        <div 
          className={`${colors.inner} p-1 pixel-border-light`}
          style={{ clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))' }}
        >
          {/* 顶部高光条 */}
          <div className="relative">
            <div className={`absolute top-0 left-0 right-0 h-1 ${colors.top}`} />

            {/* 文字内容 */}
            <div className={`${colors.text} font-bold px-2 py-1 relative z-10 pixel-text`}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* 发光效果 */}
      {!disabled && (
        <div 
          className="absolute inset-0 -z-10 pixel-glow-subtle"
          style={{ color: colors.glow }}
        />
      )}
    </motion.button>
  );
}

/**
 * 像素风格面板组件
 * 增强版 - 带装饰效果
 */
interface PixelPanelProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'dark' | 'warning';
  className?: string;
}

export function PixelPanel({
  children,
  variant = 'primary',
  className = '',
}: PixelPanelProps) {
  const variants = {
    primary: {
      bg: 'bg-blue-600',
      border: 'border-blue-400',
      shadow: 'shadow-blue-900/50',
    },
    secondary: {
      bg: 'bg-purple-600',
      border: 'border-purple-400',
      shadow: 'shadow-purple-900/50',
    },
    success: {
      bg: 'bg-green-600',
      border: 'border-green-400',
      shadow: 'shadow-green-900/50',
    },
    danger: {
      bg: 'bg-red-600',
      border: 'border-red-400',
      shadow: 'shadow-red-900/50',
    },
    dark: {
      bg: 'bg-gray-800',
      border: 'border-gray-600',
      shadow: 'shadow-gray-900/50',
    },
    warning: {
      bg: 'bg-yellow-600',
      border: 'border-yellow-400',
      shadow: 'shadow-yellow-900/50',
    },
  };

  const colors = variants[variant];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        ${colors.bg} 
        border-4 
        ${colors.border} 
        ${colors.shadow}
        shadow-lg
        p-4
        pixel-border
        pixel-pattern-grid
        relative
        overflow-hidden
        ${className}
      `}
      style={{ 
        imageRendering: 'pixelated',
      }}
    >
      {/* 顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-4 pixel-gradient-top" />
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 装饰角标 */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-sm pixel-sparkle" />
    </motion.div>
  );
}

/**
 * 像素风格进度条组件
 * 增强版 - 带动画效果
 */
interface PixelProgressBarProps {
  value: number;
  max: number;
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'purple';
  height?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function PixelProgressBar({
  value,
  max,
  color = 'blue',
  height = 'md',
  showText = false,
  className = '',
}: PixelProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    red: 'bg-gradient-to-b from-red-400 via-red-500 to-red-600',
    green: 'bg-gradient-to-b from-green-400 via-green-500 to-green-600',
    blue: 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600',
    yellow: 'bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600',
    purple: 'bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600',
  };

  const heights = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={`w-full ${className}`}>
      <div 
        className={`
          w-full 
          ${heights[height]} 
          bg-gray-800 
          border-2 
          border-gray-600
          pixel-border
          overflow-hidden
          relative
        `}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* 进度条 */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`
            ${colors[color]}
            h-full
            pixel-progress
            relative
          `}
        >
          {/* 高光 */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30" />
        </motion.div>

        {/* 背景网格 */}
        <div className="absolute inset-0 pixel-pattern-dots opacity-20" />
      </div>

      {/* 文字显示 */}
      {showText && (
        <div className="text-center mt-1 text-xs text-gray-300 pixel-text">
          {value} / {max}
        </div>
      )}
    </div>
  );
}

/**
 * 像素风格徽章组件
 * 增强版 - 带闪光效果
 */
interface PixelBadgeProps {
  children: ReactNode;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PixelBadge({
  children,
  color = 'blue',
  size = 'md',
  className = '',
}: PixelBadgeProps) {
  const colors = {
    red: 'bg-red-500 text-white border-red-300',
    blue: 'bg-blue-500 text-white border-blue-300',
    green: 'bg-green-500 text-white border-green-300',
    yellow: 'bg-yellow-500 text-gray-900 border-yellow-300',
    purple: 'bg-purple-500 text-white border-purple-300',
    gray: 'bg-gray-500 text-white border-gray-300',
    cyan: 'bg-cyan-500 text-white border-cyan-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex 
        items-center 
        justify-center
        gap-1
        border-2
        ${colors[color]}
        ${sizes[size]}
        font-bold
        pixel-border-light
        pixel-badge-shine
        pixel-text
        ${className}
      `}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 装饰点 */}
      <div className="w-1 h-1 bg-white/50 pixel-sparkle" />
      {children}
      <div className="w-1 h-1 bg-white/50 pixel-sparkle" />
    </motion.div>
  );
}

/**
 * 像素风格头像组件
 * 增强版 - 带边框效果
 */
interface PixelAvatarProps {
  emoji?: string;
  src?: string;
  size?: number;
  borderColor?: 'red' | 'blue' | 'green' | 'purple' | 'yellow';
  className?: string;
}

export function PixelAvatar({
  emoji = '👤',
  src,
  size = 64,
  borderColor = 'blue',
  className = '',
}: PixelAvatarProps) {
  const borders = {
    red: 'border-red-500 shadow-red-500/50',
    blue: 'border-blue-500 shadow-blue-500/50',
    green: 'border-green-500 shadow-green-500/50',
    purple: 'border-purple-500 shadow-purple-500/50',
    yellow: 'border-yellow-500 shadow-yellow-500/50',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`
        relative
        border-4
        ${borders[borderColor]}
        pixel-avatar-frame
        shadow-lg
        ${className}
      `}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        boxShadow: `0 0 10px ${borders[borderColor].split(' ')[1]}`,
      }}
    >
      {/* 头像内容 */}
      {src ? (
        <img
          src={src}
          alt="avatar"
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">
          {emoji}
        </div>
      )}

      {/* 装饰角标 */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full pixel-sparkle" />
    </motion.div>
  );
}
