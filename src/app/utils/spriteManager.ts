const assetsBase = `${import.meta.env.BASE_URL}assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters`;

export interface SpriteAsset {
  id: string;
  name: string;
  path: string;
  category: 'button' | 'character' | 'background' | 'decoration' | 'monster';
}

export const spriteAssets: Record<string, SpriteAsset[]> = {
  buttons: [
    { id: 'btn-play', name: 'Play按钮', path: `${assetsBase}/Menu/Buttons/Play.png`, category: 'button' },
    { id: 'btn-settings', name: '设置按钮', path: `${assetsBase}/Menu/Buttons/Settings.png`, category: 'button' },
    { id: 'btn-restart', name: '重新开始', path: `${assetsBase}/Menu/Buttons/Restart.png`, category: 'button' },
    { id: 'btn-next', name: '下一关', path: `${assetsBase}/Menu/Buttons/Next.png`, category: 'button' },
    { id: 'btn-previous', name: '上一关', path: `${assetsBase}/Menu/Buttons/Previous.png`, category: 'button' },
    { id: 'btn-back', name: '返回', path: `${assetsBase}/Menu/Buttons/Back.png`, category: 'button' },
    { id: 'btn-close', name: '关闭', path: `${assetsBase}/Menu/Buttons/Close.png`, category: 'button' },
    { id: 'btn-levels', name: '关卡', path: `${assetsBase}/Menu/Buttons/Levels.png`, category: 'button' },
    { id: 'btn-achievements', name: '成就', path: `${assetsBase}/Menu/Buttons/Achievements.png`, category: 'button' },
    { id: 'btn-volume', name: '音量', path: `${assetsBase}/Menu/Buttons/Volume.png`, category: 'button' },
    { id: 'btn-leaderboard', name: '排行榜', path: `${assetsBase}/Menu/Buttons/Leaderboard.png`, category: 'button' },
  ],
  characters: [
    { id: 'char-pink-man-idle', name: '粉红人-站立', path: `${assetsBase}/Main Characters/Pink Man/Idle (32x32).png`, category: 'character' },
    { id: 'char-pink-man-run', name: '粉红人-跑步', path: `${assetsBase}/Main Characters/Pink Man/Run (32x32).png`, category: 'character' },
    { id: 'char-pink-man-jump', name: '粉红人-跳跃', path: `${assetsBase}/Main Characters/Pink Man/Jump (32x32).png`, category: 'character' },
    { id: 'char-ninja-frog-idle', name: '忍者青蛙-站立', path: `${assetsBase}/Main Characters/Ninja Frog/Idle (32x32).png`, category: 'character' },
    { id: 'char-ninja-frog-run', name: '忍者青蛙-跑步', path: `${assetsBase}/Main Characters/Ninja Frog/Run (32x32).png`, category: 'character' },
    { id: 'char-ninja-frog-jump', name: '忍者青蛙-跳跃', path: `${assetsBase}/Main Characters/Ninja Frog/Jump (32x32).png`, category: 'character' },
    { id: 'char-virtual-guy-idle', name: '虚拟小子-站立', path: `${assetsBase}/Main Characters/Virtual Guy/Idle (32x32).png`, category: 'character' },
    { id: 'char-virtual-guy-run', name: '虚拟小子-跑步', path: `${assetsBase}/Main Characters/Virtual Guy/Run (32x32).png`, category: 'character' },
    { id: 'char-virtual-guy-jump', name: '虚拟小子-跳跃', path: `${assetsBase}/Main Characters/Virtual Guy/Jump (32x32).png`, category: 'character' },
    { id: 'char-mask-dude-idle', name: '面具小子-站立', path: `${assetsBase}/Main Characters/Mask Dude/Idle (32x32).png`, category: 'character' },
    { id: 'char-mask-dude-run', name: '面具小子-跑步', path: `${assetsBase}/Main Characters/Mask Dude/Run (32x32).png`, category: 'character' },
    { id: 'char-mask-dude-jump', name: '面具小子-跳跃', path: `${assetsBase}/Main Characters/Mask Dude/Jump (32x32).png`, category: 'character' },
  ],
  decorations: [
    { id: 'deco-confetti', name: '彩带', path: `${assetsBase}/Other/Confetti (16x16).png`, category: 'decoration' },
    { id: 'deco-dust', name: '灰尘粒子', path: `${assetsBase}/Other/Dust Particle.png`, category: 'decoration' },
    { id: 'deco-shadow', name: '阴影', path: `${assetsBase}/Other/Shadow.png`, category: 'decoration' },
    { id: 'deco-transition', name: '过渡', path: `${assetsBase}/Other/Transition.png`, category: 'decoration' },
    { id: 'deco-appearing', name: '出现特效', path: `${assetsBase}/Main Characters/Appearing (96x96).png`, category: 'decoration' },
    { id: 'deco-disappearing', name: '消失特效', path: `${assetsBase}/Main Characters/Desappearing (96x96).png`, category: 'decoration' },
  ],
  monsters: [
    { id: 'monster-fire', name: '火焰', path: `${assetsBase}/Traps/Fire/On (16x32).png`, category: 'monster' },
    { id: 'monster-fire-hit', name: '火焰攻击', path: `${assetsBase}/Traps/Fire/Hit (16x32).png`, category: 'monster' },
    { id: 'monster-spike', name: '钉子', path: `${assetsBase}/Traps/Spikes/Idle.png`, category: 'monster' },
    { id: 'monster-spike-head', name: '钉子头', path: `${assetsBase}/Traps/Spike Head/Idle.png`, category: 'monster' },
    { id: 'monster-rock-head', name: '落石头', path: `${assetsBase}/Traps/Rock Head/Idle.png`, category: 'monster' },
    { id: 'monster-saw', name: '锯子', path: `${assetsBase}/Traps/Saw/On (38x38).png`, category: 'monster' },
    { id: 'monster-platform-brown', name: '棕色平台', path: `${assetsBase}/Traps/Platforms/Brown On (32x8).png`, category: 'monster' },
    { id: 'monster-platform-grey', name: '灰色平台', path: `${assetsBase}/Traps/Platforms/Grey On (32x8).png`, category: 'monster' },
    { id: 'monster-block', name: '方块', path: `${assetsBase}/Traps/Blocks/Idle.png`, category: 'monster' },
  ],
  backgrounds: [
    { id: 'bg-blue', name: '蓝色背景', path: `${assetsBase}/Background/Blue.png`, category: 'background' },
    { id: 'bg-green', name: '绿色背景', path: `${assetsBase}/Background/Green.png`, category: 'background' },
    { id: 'bg-purple', name: '紫色背景', path: `${assetsBase}/Background/Purple.png`, category: 'background' },
    { id: 'bg-yellow', name: '黄色背景', path: `${assetsBase}/Background/Yellow.png`, category: 'background' },
    { id: 'bg-pink', name: '粉色背景', path: `${assetsBase}/Background/Pink.png`, category: 'background' },
    { id: 'bg-brown', name: '棕色背景', path: `${assetsBase}/Background/Brown.png`, category: 'background' },
    { id: 'bg-gray', name: '灰色背景', path: `${assetsBase}/Background/Gray.png`, category: 'background' },
  ],
};

export const getSprite = (category: string, id: string): SpriteAsset | null => {
  const sprites = spriteAssets[category];
  if (!sprites) return null;
  return sprites.find(s => s.id === id) || null;
};

export const getAllSprites = (): SpriteAsset[] => {
  return Object.values(spriteAssets).flat();
};

export const preloadSprites = async () => {
  const allSprites = getAllSprites();
  
  const loadPromises = allSprites.map(sprite => 
    loadImage(sprite.path).catch(() => null)
  );

  await Promise.all(loadPromises);
  console.log('🎮 所有精灵图预加载完成');
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};
