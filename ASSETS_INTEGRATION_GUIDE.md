# PixelSRPG-Forge 资源集成指南

## 📦 如何下载 PixelSRPG-Forge 资源

### 方法1：Git克隆（推荐）
```bash
# 克隆整个仓库
git clone https://github.com/Huu-Yuu/PixelSRPG-Forge.git assets/PixelSRPG-Forge

# 或只克隆特定文件夹
cd assets/PixelSRPG-Forge
git init
git remote add origin https://github.com/Huu-Yuu/PixelSRPG-Forge.git
git fetch origin
git checkout origin/master -- UI_Elements_界面元素
```

### 方法2：直接下载
1. 访问 https://github.com/Huu-Yuu/PixelSRPG-Forge
2. 下载整个仓库或特定文件夹
3. 解压到 `assets/PixelSRPG-Forge/` 目录

## 📁 资源目录结构

```
assets/PixelSRPG-Forge/
├── UI_Elements_界面元素/          # 🎯 UI界面元素（按钮、面板、进度条等）
├── Characters_角色人物/            # 👥 角色精灵和动画
├── Buildings_建筑场景/             # 🏰 建筑和场景素材
├── Skill_Icons_技能图标/          # ⚡ 技能图标
├── Weapons_武器装备/             # ⚔️ 武器装备
├── Terrain_地形地块/              # 🗺️ 地形和地块
├── other_其他素材3万多张/         # 📦 其他素材
└── ...其他文件夹
```

## 🎨 UI元素资源

### 推荐下载的UI资源包：
1. **UI_Elements_界面元素** - 核心UI组件
2. **Skill_Icons_技能图标** - 图标素材
3. **Buildings_建筑场景** - 装饰背景

## 🔧 集成到项目

### 1. 放置资源文件
将下载的资源放到 `public/assets/` 目录：
```bash
public/assets/
├── ui/
│   ├── buttons/
│   ├── panels/
│   ├── icons/
│   └── decorations/
├── characters/
├── buildings/
└── icons/
```

### 2. 更新spriteManager.ts
在 `src/app/utils/spriteManager.ts` 中更新资源路径：
```typescript
export const pixelUISprites = {
  buttons: [
    { 
      id: 'btn-primary', 
      name: '主要按钮', 
      path: '/assets/ui/buttons/primary.png', 
      type: 'button' 
    },
    // ... 更多按钮
  ],
  // ... 其他资源
};
```

### 3. 使用图片组件
在React组件中使用：
```typescript
import { useState, useEffect } from 'react';
import { loadImage } from '../utils/spriteManager';

const PixelImage = ({ src, alt, className }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadImage(src).then(img => setImage(img));
  }, [src]);

  if (!image) return <div className={className}>Loading...</div>;

  return <img src={src} alt={alt} className={className} />;
};
```

## 🎮 已优化的UI组件

### 像素风格CSS类
在 `src/styles/pixel-ui.css` 中提供了丰富的像素风格样式：

| 类名 | 效果 |
|------|------|
| `.pixel-border` | 像素边框效果 |
| `.pixel-shadow` | 像素阴影 |
| `.pixel-glow` | 发光效果 |
| `.pixel-text` | 像素文字效果 |
| `.pixel-pattern-*` | 各种像素背景图案 |
| `.pixel-btn-*` | 按钮状态动画 |
| `.pixel-progress` | 像素进度条 |
| `.pixel-sparkle` | 闪烁动画 |
| `.pixel-bounce` | 弹跳动画 |
| `.pixel-float` | 漂浮动画 |

### 使用示例
```jsx
<div className="pixel-border pixel-shadow pixel-glow">
  <h1 className="pixel-text">像素文字</h1>
  <button className="pixel-btn-hover pixel-btn-press">
    像素按钮
  </button>
</div>
```

## 📊 资源使用建议

### 基础UI（必需）
- ✅ UI_Elements_界面元素/buttons/
- ✅ UI_Elements_界面元素/panels/
- ✅ UI_Elements_界面元素/borders/

### 游戏功能（推荐）
- ✅ Skill_Icons_技能图标/ - 战斗技能图标
- ✅ UI_Elements_界面元素/progress_bars/ - 血条、经验条
- ✅ UI_Elements_界面元素/icons/ - UI图标

### 装饰增强（可选）
- ✅ Buildings_建筑场景/ - 背景装饰
- ✅ UI_Elements_界面元素/decorations/ - 装饰元素

## 🎨 色彩系统

建议使用像素游戏经典配色：

```css
/* 主色调 */
--pixel-blue: #4a90d9;
--pixel-purple: #9b59b6;
--pixel-green: #2ecc71;
--pixel-red: #e74c3c;
--pixel-gold: #f1c40f;
--pixel-orange: #e67e22;

/* 边框颜色 */
--pixel-border-dark: #2c3e50;
--pixel-border-light: #ecf0f1;

/* 背景颜色 */
--pixel-bg-dark: #1a1a2e;
--pixel-bg-medium: #16213e;
--pixel-bg-light: #0f3460;
```

## 🐛 常见问题

### Q: 图片加载失败怎么办？
A: 检查资源路径是否正确，确保文件在 `public/` 目录下

### Q: 如何优化图片加载？
A: 使用懒加载和图片预加载：
```typescript
// 预加载关键图片
useEffect(() => {
  preloadSprites();
}, []);
```

### Q: 图片不清晰？
A: 确保使用 `image-rendering: pixelated;` CSS属性

## 📝 版权声明

这些素材来自 [PixelSRPG-Forge](https://github.com/Huu-Yuu/PixelSRPG-Forge)。

⚠️ **重要提示**：
- 素材仅供学习和个人项目使用
- 商业使用需自行检查版权状态
- 建议参考使用而非直接复制

## 🚀 下一步

1. ⬇️ 下载 PixelSRPG-Forge 资源
2. 📂 将资源放到 `public/assets/` 目录
3. 🔧 更新 `spriteManager.ts` 中的路径
4. ✨ 在组件中使用优化后的UI组件
5. 🎨 自定义色彩和样式

祝你的小学数学游戏开发顺利！🎮
