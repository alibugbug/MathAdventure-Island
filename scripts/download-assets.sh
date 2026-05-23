#!/bin/bash

# PixelSRPG-Forge 资源下载脚本
# 用法: bash download-assets.sh

echo "🎮 小学数学游戏 - PixelSRPG-Forge 资源下载器"
echo "=========================================="
echo ""

# 创建资源目录
mkdir -p public/assets/ui/{buttons,panels,icons,decorations}
mkdir -p public/assets/characters
mkdir -p public/assets/buildings
mkdir -p public/assets/icons

# 定义颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 正在克隆 PixelSRPG-Forge 仓库...${NC}"
echo ""

# 尝试克隆
if git clone --depth 1 https://github.com/Huu-Yuu/PixelSRPG-Forge.git temp-assets 2>/dev/null; then
    echo -e "${GREEN}✅ 克隆成功！${NC}"
    echo ""
    
    echo -e "${BLUE}📂 正在复制资源文件...${NC}"
    
    # 复制UI元素
    if [ -d "temp-assets/UI_Elements_界面元素" ]; then
        cp -r temp-assets/UI_Elements_界面元素/* public/assets/ui/
        echo -e "${GREEN}✅ UI元素复制完成${NC}"
    fi
    
    # 复制技能图标
    if [ -d "temp-assets/Skill_Icons_技能图标" ]; then
        cp -r temp-assets/Skill_Icons_技能图标 public/assets/icons/
        echo -e "${GREEN}✅ 技能图标复制完成${NC}"
    fi
    
    # 复制角色
    if [ -d "temp-assets/Characters_角色人物" ]; then
        cp -r temp-assets/Characters_角色人物 public/assets/characters/
        echo -e "${GREEN}✅ 角色素材复制完成${NC}"
    fi
    
    # 复制建筑
    if [ -d "temp-assets/Buildings_建筑场景" ]; then
        cp -r temp-assets/Buildings_建筑场景 public/assets/buildings/
        echo -e "${GREEN}✅ 建筑场景复制完成${NC}"
    fi
    
    # 清理临时文件
    rm -rf temp-assets
    
    echo ""
    echo -e "${GREEN}🎉 资源下载完成！${NC}"
    echo ""
    echo "📁 资源位置：public/assets/"
    echo ""
    echo "📋 下一步："
    echo "   1. 查看 public/assets/ 目录下的资源"
    echo "   2. 更新 src/app/utils/spriteManager.ts 中的路径"
    echo "   3. 在组件中使用新资源"
    echo "   4. 查看 ASSETS_INTEGRATION_GUIDE.md 了解更多"
    
else
    echo -e "${RED}❌ 克隆失败，可能是网络问题${NC}"
    echo ""
    echo "请手动下载："
    echo "1. 访问 https://github.com/Huu-Yuu/PixelSRPG-Forge"
    echo "2. 点击 'Code' -> 'Download ZIP'"
    echo "3. 解压到 public/assets/ 目录"
    echo ""
    echo "或使用 GitHub CLI："
    echo "   gh repo clone Huu-Yuu/PixelSRPG-Forge public/assets/PixelSRPG-Forge"
fi

echo ""
echo "=========================================="
