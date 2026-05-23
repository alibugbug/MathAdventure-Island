# 像素素材集成指南

本游戏已经内置了纯CSS实现的像素风格UI系统，可以直接使用。如果你想使用真实的像素艺术素材，可以按照以下步骤从 [PixelSRPG-Forge](https://github.com/Huu-Yuu/PixelSRPG-Forge) 仓库集成资源。

## 📦 推荐的素材资源

### 1. UI元素（优先级：高）

**路径**: `UI_Elements_界面元素/`

**可用素材**:
- 按钮（开始、确认、取消等）
- 框架和边框
- 血条和进度条
- 菜单背景
- 图标集合

**用途**: 替换当前的CSS按钮和面板组件

### 2. 技能图标（优先级：高）

**路径**: `Skill_Icons_技能图标/`

**可用素材**:
- 数学运算符图标（加减乘除）
- 奖励图标（星星、奖杯、徽章）
- 状态效果图标
- 技能特效图标

**用途**: 用于战斗模式中的符文、成就系统、关卡图标

### 3. 角色和怪物（优先级：中）

**路径**: `Characters_角色人物/monster.zip`

**可用素材**:
- 各种怪物像素精灵图
- 角色动画帧
- NPC素材

**用途**: 替换战斗模式中的emoji怪物，使用真实的像素角色

### 4. 特效动画（优先级：中）

**路径**: `Skill_Effects_技能特效/`

**可用素材**:
- 攻击特效
- 魔法效果
- 粒子动画

**用途**: 增强战斗时的视觉效果

## 🚀 集成步骤

### 步骤1: 下载素材

```bash
# 克隆整个仓库（可选，较大）
git clone https://github.com/Huu-Yuu/PixelSRPG-Forge.git

# 或者只下载需要的文件夹
# 访问 GitHub 网页，下载对应的 .zip 文件
```

### 步骤2: 组织素材文件

在项目中创建素材文件夹：

```
src/
  assets/
    ui/           # UI元素（按钮、框架等）
    icons/        # 图标（符文、成就等）
    characters/   # 角色和怪物
    effects/      # 特效动画
```

### 步骤3: 导入和使用

#### 示例1: 使用像素按钮图片

```typescript
// src/app/components/CustomButton.tsx
import buttonBg from '../assets/ui/button-primary.png';

export function CustomPixelButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative text-white font-bold px-6 py-3"
      style={{
        backgroundImage: `url(${buttonBg})`,
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated',
      }}
    >
      {children}
    </button>
  );
}
```

#### 示例2: 使用怪物精灵图

```typescript
// src/app/components/PixelMonster.tsx
import slimeSprite from '../assets/characters/slime.png';

export function PixelMonster({ type }) {
  return (
    <div className="relative w-32 h-32">
      <img
        src={slimeSprite}
        alt="Monster"
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
```

#### 示例3: 使用技能图标

```typescript
// src/app/components/RuneIcon.tsx
import addIcon from '../assets/icons/add-symbol.png';
import multiplyIcon from '../assets/icons/multiply-symbol.png';

const iconMap = {
  '+': addIcon,
  '×': multiplyIcon,
  // ... 其他运算符
};

export function RuneIcon({ operator }) {
  return (
    <img
      src={iconMap[operator]}
      alt={operator}
      className="w-12 h-12"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
```

### 步骤4: 优化性能

#### 使用精灵图表（Sprite Sheet）

```typescript
// 将多个小图标合并成一个大图，减少HTTP请求
const spritePositions = {
  star: { x: 0, y: 0, width: 32, height: 32 },
  coin: { x: 32, y: 0, width: 32, height: 32 },
  trophy: { x: 64, y: 0, width: 32, height: 32 },
};

export function SpriteIcon({ type }) {
  const pos = spritePositions[type];
  return (
    <div
      className="inline-block"
      style={{
        width: pos.width,
        height: pos.height,
        backgroundImage: 'url(/assets/sprite-sheet.png)',
        backgroundPosition: `-${pos.x}px -${pos.y}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
}
```

## 📝 版权声明

**重要**: PixelSRPG-Forge 仓库的素材来源复杂，包含互联网收集和商业购买的资源。

- ✅ **个人学习和原型开发**: 可以自由使用
- ⚠️ **商业用途**: 需要你自行核实每个素材的版权状况
- 🔍 **建议**: 如果用于生产环境，请使用正版授权的素材或自己创作

## 🎨 当前的纯CSS方案

如果你不想处理素材文件，当前项目已经实现了完整的纯CSS像素风格UI：

- `PixelButton` - 像素风格按钮
- `PixelPanel` - 像素面板/卡片
- `PixelProgressBar` - 像素进度条
- `PixelDialog` - 像素对话框
- `PixelBadge` - 像素徽章
- `PixelAvatar` - 像素头像框

这些组件不需要任何图片资源，完全通过CSS实现，性能优秀且易于维护。

## 🔧 推荐工具

- **Aseprite**: 专业的像素艺术编辑软件
- **Piskel**: 免费在线像素编辑器
- **TexturePacker**: 生成精灵图表的工具
- **ImageMagick**: 批量处理图片的命令行工具

## 📚 参考资源

- [PixelSRPG-Forge GitHub](https://github.com/Huu-Yuu/PixelSRPG-Forge)
- [Itch.io 像素素材](https://itch.io/game-assets/tag-pixel-art)
- [OpenGameArt 开源游戏素材](https://opengameart.org/)
