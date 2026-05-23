#!/bin/bash

# 从GDC音效包中复制音效到项目
# 用法: bash scripts/copy-audio.sh

echo "🎵 GDC音效包集成工具"
echo "=================================="
echo ""

# 定义路径
GDC_AUDIO_PATH="/Users/huahongchen/Documents/练习/数学游戏/Sonniss.com-GDC2026-GameAudioBundle1of5"
PROJECT_AUDIO_PATH="public/audio"

# 创建音频目录
mkdir -p "$PROJECT_AUDIO_PATH"

# 定义颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📦 正在复制音效文件...${NC}"
echo ""

# 复制UI音效
echo -e "${YELLOW}1. UI音效${NC}"

# 从 Casino Cards 获取点击音效
find "$GDC_AUDIO_PATH/344 Audio - Casino Cards Vol. 1" -name "*.wav" | head -5 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/ui_click.wav"
  echo -e "${GREEN}✅ UI点击音效${NC}"
  break
done

# 复制成功音效
find "$GDC_AUDIO_PATH/344 Audio - Christmas Vol. 1" -name "*bell*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/ui_success.wav"
  echo -e "${GREEN}✅ UI成功音效${NC}"
done

# 复制错误音效
find "$GDC_AUDIO_PATH/344 Audio - Antique Small Metals" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/ui_error.wav"
  echo -e "${GREEN}✅ UI错误音效${NC}"
done

echo ""

# 复制战斗音效
echo -e "${YELLOW}2. 战斗音效${NC}"

# 攻击音效
find "$GDC_AUDIO_PATH/344 Audio - Cinematic Fight Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/attack.wav"
  echo -e "${GREEN}✅ 攻击音效${NC}"
done

# 击中音效
find "$GDC_AUDIO_PATH/344 Audio - Historical Weapons Vol. 2" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/hit.wav"
  echo -e "${GREEN}✅ 击中音效${NC}"
done

# 伤害音效
find "$GDC_AUDIO_PATH/344 Audio - Anime Fight Voices Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/damage.wav"
  echo -e "${GREEN}✅ 伤害音效${NC}"
done

# 胜利音效
find "$GDC_AUDIO_PATH/344 Audio - Barbershop Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/victory.wav"
  echo -e "${GREEN}✅ 胜利音效${NC}"
done

echo ""

# 复制解谜音效
echo -e "${YELLOW}3. 解谜音效${NC}"

# 放置方块音效
find "$GDC_AUDIO_PATH/344 Audio - Antique Luggage" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/place_block.wav"
  echo -e "${GREEN}✅ 放置方块音效${NC}"
done

# 移除方块音效
find "$GDC_AUDIO_PATH/344 Audio - Antique Luggage" -name "*.wav" | head -2 | tail -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/remove_block.wav"
  echo -e "${GREEN}✅ 移除方块音效${NC}"
done

echo ""

# 复制成就音效
echo -e "${YELLOW}4. 成就音效${NC}"

# 成就解锁音效
find "$GDC_AUDIO_PATH/344 Audio - Christmas Vol. 1" -name "*jingle*.wav" -o -name "*celebration*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/achievement.wav"
  echo -e "${GREEN}✅ 成就解锁音效${NC}"
done

# 升级音效
find "$GDC_AUDIO_PATH/344 Audio - Bass Drops & Downers Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/level_up.wav"
  echo -e "${GREEN}✅ 升级音效${NC}"
done

echo ""

# 复制怪物音效
echo -e "${YELLOW}5. 怪物音效${NC}"

# 怪物出现音效
find "$GDC_AUDIO_PATH/344 Audio - Dinosaurs Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/monster_spawn.wav"
  echo -e "${GREEN}✅ 怪物出现音效${NC}"
done

# 怪物死亡音效
find "$GDC_AUDIO_PATH/344 Audio - Dinosaurs Vol. 2" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/monster_death.wav"
  echo -e "${GREEN}✅ 怪物死亡音效${NC}"
done

echo ""

# 复制背景音乐
echo -e "${YELLOW}6. 背景音乐${NC}"

# 主菜单背景音乐
find "$GDC_AUDIO_PATH/344 Audio - Elemental Palette Designed Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/bg_main.wav"
  echo -e "${GREEN}✅ 主菜单背景音乐${NC}"
done

# 战斗背景音乐
find "$GDC_AUDIO_PATH/344 Audio - Extreme Winds Vol. 1" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/bg_battle.wav"
  echo -e "${GREEN}✅ 战斗背景音乐${NC}"
done

# 解谜背景音乐
find "$GDC_AUDIO_PATH/344 Audio - Haunting Ambiences Vol. 3" -name "*.wav" | head -1 | while read -r file; do
  cp "$file" "$PROJECT_AUDIO_PATH/bg_puzzle.wav"
  echo -e "${GREEN}✅ 解谜背景音乐${NC}"
done

echo ""
echo "=================================="
echo -e "${GREEN}🎉 音效复制完成！${NC}"
echo ""
echo "📁 音效位置: $PROJECT_AUDIO_PATH"
echo ""
echo "📋 已复制的音效文件:"
ls -la "$PROJECT_AUDIO_PATH" | grep -E "\.(wav|mp3)$"
echo ""
echo "💡 提示: 音效管理器已配置为从 /audio/ 路径加载"
