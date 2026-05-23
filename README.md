# 🎮 数学冒险岛 - 小学一年级数学益智游戏

一个像素风格的本地网页版数学学习游戏，融合了**战斗冒险**、**空间解谜**和**基础问答**三种玩法，让数学学习变得有趣且富有挑战性。

## ✨ 核心特色

### 🎯 三种游戏模式

1. **⚔️ 数值对撞战斗模式**
   - 收集魔法符文（+7, ×2, -3等）改变自身数值
   - 匹配怪物弱点可一击必杀
   - 5种不同类型的怪物（史莱姆、哥布林、骷髅兵、暗影龙、魔法师）
   - 实时血条显示和伤害数字动画

2. **🧩 空间几何解谜模式**
   - 用像素方块拼出指定面积的图形
   - 学习周长概念（拼出特定周长的图形）
   - 掌握对称原理（左右对称拼图）
   - 网格可视化帮助理解几何概念

3. **📝 基础问答模式**
   - 认识数字（1-20）
   - 5以内、10以内、20以内加减法
   - 数字比大小
   - 视觉化学习（星星计数）

### 🎨 精美的像素风格UI

- **纯CSS实现的像素UI系统**
  - PixelButton - 带3D效果的像素按钮
  - PixelPanel - 多层边框的像素面板
  - PixelProgressBar - 像素化进度条
  - PixelBadge - 像素徽章
  - PixelAvatar - 像素头像框

- **炫酷的视觉效果**
  - 屏幕震动效果
  - 粒子爆炸系统（Canvas Confetti）
  - 可选的CRT扫描线滤镜（复古电视效果）
  - 流畅的Motion动画

### 🎵 动态8-bit音效系统

- 使用Web Audio API程序化生成音效
- 不同场景的音效：
  - 收集符文 - 上升音阶
  - 攻击命中 - 冲击音效
  - 完美击杀 - 四和弦旋律
  - 胜利 - 胜利号角
  - 答错 - 低沉提示音
  - 成就解锁 - 上升音阶组合

### 🏆 成就系统

6个精心设计的成就：
- 🏅 首次胜利 - 完成第一个关卡
- 👑 战斗大师 - 完成5次完美战斗
- 🧩 解谜天才 - 完成10个拼图谜题
- 🔥 连击之王 - 达成10连击
- 🎯 完美主义者 - 获得5个三星关卡
- ⚡ 传奇冒险者 - 总分突破1000

### 📊 科学的关卡设计

- **12个渐进式关卡**，难度曲线平滑
- **三星评级系统**，鼓励追求完美
- **解锁机制**，必须完成前一关才能进入下一关
- **多样化关卡类型**，基础学习→战斗挑战→解谜思考交替进行

## 🚀 技术栈

- **React 18** + **TypeScript** - 现代化前端框架
- **Motion (Framer Motion)** - 流畅的动画系统
- **Tailwind CSS v4** - 现代化CSS框架
- **Canvas Confetti** - 彩纸特效
- **Web Audio API** - 动态音效生成
- **LocalStorage** - 进度持久化

## 📦 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器（已自动运行）
# Vite服务器已在后台运行，直接在预览窗口查看即可

# 构建生产版本（注意：不要在当前环境运行）
# pnpm run build
```

## 🎮 游戏玩法

### 战斗模式

1. 查看怪物的弱点数值
2. 收集地图上的符文改变自己的数值
3. 当你的数值等于怪物弱点时，攻击可以一击必杀
4. 击败所有怪物完成关卡

**技巧**：
- 提前规划符文收集路线
- 匹配弱点获得双倍奖励
- 连续击败怪物获得更高分数

### 解谜模式

1. 阅读题目要求（面积、周长或对称）
2. 点击网格放置/移除像素方块
3. 达到目标数值完成拼图
4. 完成所有谜题过关

**技巧**：
- 面积 = 方块的数量
- 周长 = 图形边缘的总长度
- 对称 = 左右两边镜像对称
- 使用提示按钮获得帮助

### 基础模式

1. 观察题目（星星计数、算式、比大小）
2. 从4个选项中选择正确答案
3. 答对得分，答错扣生命值
4. 连对3题以上触发连击奖励

## 🎨 像素素材集成

项目已内置完整的纯CSS像素风格UI系统，无需额外素材即可运行。

如果你想使用真实的像素艺术素材，请参考 [ASSETS_GUIDE.md](./ASSETS_GUIDE.md)，其中包含：
- 如何从 [PixelSRPG-Forge](https://github.com/Huu-Yuu/PixelSRPG-Forge) 下载素材
- UI元素集成指南
- 角色/怪物精灵图使用方法
- 性能优化建议（精灵图表、懒加载等）

## 📁 项目结构

```
src/
├── app/
│   ├── App.tsx                    # 主应用入口
│   └── components/
│       ├── MathGame.tsx           # 游戏主组件（路由和关卡管理）
│       ├── BattleLevel.tsx        # 战斗模式组件
│       ├── PuzzleLevel.tsx        # 解谜模式组件
│       ├── AchievementSystem.tsx  # 成就系统
│       ├── PixelUI.tsx            # 像素风格UI组件库
│       └── PixelEffects.tsx       # 特效系统（粒子、屏幕震动、CRT滤镜）
├── styles/
│   ├── theme.css                  # 主题变量
│   └── fonts.css                  # 字体导入
└── imports/                       # Figma导入资源（如有）
```

## 🎯 教学理念

### 游戏化学习的优势

1. **即时反馈** - 答对立即奖励，答错友好提示
2. **成就激励** - 星级评定和成就系统激发学习动力
3. **情境化学习** - 将抽象数学概念转化为具体游戏机制
4. **自主探索** - 解谜模式鼓励试错和思考

### 符合一年级认知水平

- **具象化表达** - 用星星、方块等可视化元素
- **渐进式难度** - 从5以内到20以内逐步提升
- **多感官刺激** - 视觉、听觉、触觉三重反馈
- **成就感设计** - 每个关卡都能获得成就感

## 🔧 自定义和扩展

### 添加新关卡

编辑 `src/app/components/MathGame.tsx`，在 `levels` 数组中添加：

```typescript
{
  id: 13,
  name: '新关卡名称',
  type: 'battle', // 'battle' | 'puzzle' | 'recognize' | 'add' | 'subtract' | 'compare'
  gameMode: 'battle', // 'battle' | 'puzzle' | 'basic'
  range: { min: 1, max: 30 },
  questions: 5,
  stars: 0,
  description: '关卡描述'
}
```

### 自定义UI主题

编辑 `src/app/components/PixelUI.tsx` 中的颜色配置：

```typescript
const variants = {
  myTheme: {
    outer: 'bg-indigo-700',
    inner: 'bg-indigo-600',
    content: 'bg-indigo-900',
  },
};
```

### 调整音效

在各个组件的 `playSound` 函数中修改音频参数：

```typescript
oscillator.frequency.value = 800; // 频率（Hz）
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // 音量
```

## 📝 开发注意事项

### 重要提醒

- ❌ **不要运行 `vite build`** - 这不是标准Vite项目
- ❌ **不要创建 `index.html`** - 入口由 Figma Make 自动生成
- ❌ **不要手动启动开发服务器** - 已自动运行
- ✅ **使用预览窗口查看效果** - localhost不可访问

### 性能优化建议

1. **懒加载** - 大型素材按需加载
2. **精灵图** - 将多个小图标合并减少HTTP请求
3. **音效缓存** - AudioContext复用
4. **LocalStorage** - 控制存储大小，定期清理

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

改进方向：
- 添加更多关卡和谜题类型
- 实现排行榜系统
- 支持多人对战模式
- 添加更多视觉特效
- 优化移动端体验

## 📄 许可证

本项目代码采用 MIT 许可证。

**素材使用提醒**：如果集成 PixelSRPG-Forge 的素材，请注意该仓库的版权声明，商业使用前需自行核实素材来源。

## 🙏 鸣谢

- [PixelSRPG-Forge](https://github.com/Huu-Yuu/PixelSRPG-Forge) - 像素素材资源库
- [Motion](https://motion.dev/) - 强大的动画库
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) - 彩纸特效
- [Lucide Icons](https://lucide.dev/) - 精美的图标库

---

**让数学学习变得像玩游戏一样有趣！** 🎮✨
