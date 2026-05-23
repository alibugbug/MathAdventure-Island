# 🎮 精灵图资源使用指南

## 📁 资源位置

资源已下载到：`public/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/`

## 🎯 可用资源类别

### 1. 🎮 游戏按钮 (Menu/Buttons)
```
Play.png      - 开始游戏
Settings.png   - 设置
Restart.png    - 重新开始
Next.png       - 下一关
Previous.png   - 上一关
Back.png       - 返回
Close.png      - 关闭
Levels.png     - 关卡选择
Achievements.png - 成就
Volume.png     - 音量
Leaderboard.png - 排行榜
```

### 2. 👤 主角色精灵 (Main Characters)
每个角色有多种动画状态：
- **Idle (32x32)** - 站立
- **Run (32x32)** - 跑步
- **Jump (32x32)** - 跳跃
- **Fall (32x32)** - 下落
- **Hit (32x32)** - 受伤
- **Wall Jump (32x32)** - 蹬墙跳
- **Double Jump (32x32)** - 二段跳

**可用角色：**
- Pink Man (粉红人)
- Ninja Frog (忍者青蛙)
- Virtual Guy (虚拟小子)
- Mask Dude (面具小子)

### 3. 🔥 陷阱/怪物 (Traps)
- **Fire/** - 火焰陷阱
- **Spikes/** - 尖刺
- **Rock Head/** - 落石头
- **Saw/** - 锯子
- **Spiked Ball/** - 狼牙棒
- **Platforms/** - 移动平台

### 4. ✨ 装饰特效 (Other)
- **Confetti (16x16)** - 彩带
- **Dust Particle** - 灰尘粒子
- **Shadow** - 阴影
- **Transition** - 过渡特效

### 5. 🌈 背景 (Background)
- Blue.png, Green.png, Purple.png
- Yellow.png, Pink.png, Brown.png, Gray.png

## 🚀 在组件中使用

### 基础用法

```tsx
import { SpriteImage } from './SpriteImage';
import { spriteAssets } from '../utils/spriteManager';

function MyComponent() {
  return (
    <div>
      {/* 使用SpriteImage组件 */}
      <SpriteImage 
        src={spriteAssets.buttons[0].path}
        alt="Play按钮"
        width={64}
        height={64}
      />
      
      {/* 直接使用路径 */}
      <SpriteImage 
        src="/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/Menu/Buttons/Play.png"
        alt="开始"
        className="pixel-border"
      />
    </div>
  );
}
```

### 在游戏中的使用示例

#### 1. 主页装饰 - 使用角色站立图
```tsx
function HomeScreen() {
  const characters = spriteAssets.characters;
  
  return (
    <div className="relative">
      {/* 背景 */}
      <SpriteImage 
        src={spriteAssets.backgrounds[0].path}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* 装饰性角色 */}
      <div className="absolute bottom-10 left-10">
        <SpriteImage 
          src={characters[0].path} // Pink Man Idle
          width={64}
          height={64}
        />
      </div>
      
      {/* Play按钮 */}
      <SpriteImage 
        src={spriteAssets.buttons[0].path}
        className="cursor-pointer hover:scale-110 transition-transform"
        width={128}
        height={64}
      />
    </div>
  );
}
```

#### 2. 战斗关卡 - 使用怪物/陷阱图
```tsx
function BattleLevel() {
  const monsters = spriteAssets.monsters;
  
  return (
    <div className="relative">
      {/* 火焰怪物 */}
      <SpriteImage 
        src={monsters[0].path} // Fire
        width={32}
        height={64}
        className="pixel-glow pixel-sparkle"
      />
      
      {/* 锯子怪物 */}
      <SpriteImage 
        src={monsters[5].path} // Saw
        width={76}
        height={76}
        className="pixel-rotate-animation"
      />
    </div>
  );
}
```

#### 3. 通关庆祝 - 使用彩带特效
```tsx
function VictoryScreen() {
  return (
    <div className="relative">
      {/* 彩带飘落效果 */}
      {[...Array(10)].map((_, i) => (
        <SpriteImage
          key={i}
          src={spriteAssets.decorations[0].path} // Confetti
          width={16}
          height={16}
          className="absolute pixel-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
```

#### 4. 角色选择界面
```tsx
function CharacterSelect() {
  const characters = spriteAssets.characters;
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {characters.map((char) => (
        <motion.div
          key={char.id}
          whileHover={{ scale: 1.1 }}
          className="cursor-pointer pixel-border"
        >
          <SpriteImage
            src={char.path}
            alt={char.name}
            width={64}
            height={64}
          />
          <div className="text-center text-sm mt-2">
            {char.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

#### 5. 加载动画 - 使用出现/消失特效
```tsx
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SpriteImage
        src={spriteAssets.decorations[4].path} // Appearing
        width={192}
        height={192}
        className="pixel-sparkle"
      />
      <div className="mt-4 text-lg animate-pulse">
        加载中...
      </div>
    </div>
  );
}
```

## 🎨 样式搭配建议

### 与CSS类配合使用

```tsx
<SpriteImage 
  src={spriteAssets.buttons[0].path}
  className="pixel-border pixel-shadow hover:scale-110"
  width={128}
  height={64}
/>
```

### 与动画配合

```tsx
<motion.div
  animate={{ 
    y: [0, -10, 0],
    rotate: [0, 5, -5, 0],
  }}
  transition={{ 
    duration: 2,
    repeat: Infinity,
  }}
>
  <SpriteImage 
    src={characterIdle}
    className="pixel-sparkle"
    width={64}
    height={64}
  />
</motion.div>
```

## 📝 最佳实践

### 1. 预加载资源
```tsx
import { preloadSprites } from '../utils/spriteManager';

useEffect(() => {
  preloadSprites(); // 游戏启动时预加载所有精灵图
}, []);
```

### 2. 按需加载
```tsx
// 只加载当前关卡需要的资源
const currentLevelSprites = [
  spriteAssets.monsters[0],
  spriteAssets.characters[0],
];

currentLevelSprites.forEach(sprite => {
  loadImage(sprite.path);
});
```

### 3. 错误处理
```tsx
<SpriteImage 
  src={sprite.path}
  alt={sprite.name}
  className="pixel-border"
  width={64}
  height={64}
/>
```

### 4. 响应式尺寸
```tsx
// 根据屏幕大小调整
const getSize = () => {
  if (window.innerWidth < 768) return { width: 32, height: 32 };
  if (window.innerWidth < 1024) return { width: 48, height: 48 };
  return { width: 64, height: 64 };
};
```

## 🔧 故障排除

### 问题1: 图片不显示
**解决方案：** 检查路径是否正确
```tsx
// 正确路径格式
src="/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/..."
```

### 问题2: 图片模糊
**解决方案：** 确保使用 `imageRendering: pixelated`
```tsx
<SpriteImage 
  src={sprite.path}
  style={{ imageRendering: 'pixelated' }}
/>
```

### 问题3: 加载慢
**解决方案：** 使用预加载或延迟加载
```tsx
// 预加载关键资源
useEffect(() => {
  preloadSprites();
}, []);
```

## 📚 更多资源

如需更多资源，可以下载完整的 PixelSRPG-Forge 仓库：

```bash
git clone https://github.com/Huu-Yuu/PixelSRPG-Forge.git
```

其他可用资源包：
- Characters_角色人物/
- Buildings_建筑场景/
- Skill_Icons_技能图标/
- Weapons_武器装备/
- Terrain_地形地块/

祝游戏开发愉快！🎮✨
