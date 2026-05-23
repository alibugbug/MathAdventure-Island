import { useState, useEffect, CSSProperties } from 'react';
import { loadImage } from '../utils/spriteManager';

interface SpriteImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export const SpriteImage = ({
  src,
  alt = '',
  className = '',
  style = {},
  width,
  height,
  onClick,
}: SpriteImageProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadSprite = async () => {
      try {
        setLoading(true);
        setError(false);
        const img = await loadImage(src);
        if (mounted) {
          setImage(img);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setLoading(false);
          console.warn(`Failed to load sprite: ${src}`, err);
        }
      }
    };

    loadSprite();

    return () => {
      mounted = false;
    };
  }, [src]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ 
          width, 
          height,
          backgroundColor: 'rgba(0,0,0,0.2)',
          ...style 
        }}
      >
        <div className="text-xs text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ 
          width, 
          height,
          backgroundColor: 'rgba(255,0,0,0.1)',
          border: '1px dashed red',
          ...style 
        }}
      >
        <span className="text-xs text-red-400">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        imageRendering: 'pixelated',
        width,
        height,
        ...style,
      }}
      onClick={onClick}
    />
  );
};
