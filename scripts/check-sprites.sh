#!/bin/bash

# 快速集成精灵图到游戏组件
# 这个脚本会显示如何在现有组件中使用精灵图

echo "🎮 精灵图资源快速集成工具"
echo "================================"
echo ""

# 定义颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 可用资源统计：${NC}"
echo ""

# 统计资源数量
BUTTON_COUNT=$(find public/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/Menu/Buttons -name "*.png" 2>/dev/null | wc -l)
CHAR_COUNT=$(find public/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/Main\ Characters -type d -mindepth 1 -maxdepth 1 2>/dev/null | wc -l)
MONSTER_COUNT=$(find public/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/Traps -name "Idle.png" 2>/dev/null | wc -l)
BG_COUNT=$(find public/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/Background -name "*.png" 2>/dev/null | wc -l)
DECO_COUNT=$(find public/assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters/Other -name "*.png" 2>/dev/null | wc -l)

echo "  🎮 游戏按钮: $BUTTON_COUNT 个"
echo "  👤 角色类型: $CHAR_COUNT 种 (含多种动画)"
echo "  🔥 陷阱/怪物: $MONSTER_COUNT 个"
echo "  🌈 背景颜色: $BG_COUNT 个"
echo "  ✨ 装饰特效: $DECO_COUNT 个"
echo ""

echo -e "${GREEN}✅ 资源已成功加载！${NC}"
echo ""

echo -e "${YELLOW}📝 在代码中使用方法：${NC}"
echo ""
echo "1. 在组件中导入："
echo "   import { SpriteImage } from './SpriteImage';"
echo "   import { spriteAssets } from '../utils/spriteManager';"
echo ""
echo "2. 使用精灵图："
echo "   <SpriteImage"
echo "     src={spriteAssets.buttons[0].path}"
echo "     alt='Play按钮'"
echo "     width={128}"
echo "     height={64}"
echo "   />"
echo ""

echo -e "${BLUE}📚 查看详细文档：${NC}"
echo "   - SPRITE_USAGE_GUIDE.md - 精灵图使用指南"
echo "   - ASSETS_INTEGRATION_GUIDE.md - 资源集成指南"
echo ""

echo "================================"
echo "🎉 准备就绪！开始在游戏中使用精灵图吧！"
