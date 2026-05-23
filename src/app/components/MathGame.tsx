import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Heart,
  HelpCircle,
  Mail,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  X,
} from 'lucide-react';
import { PixelBadge as PxlBadge, PixelButton as PxlButton } from '@pxlkit/ui-kit';
import { playUISound, playBackgroundMusic, playLessonBackgroundMusic, playFeedbackSound, playBattleSound, playPuzzleSound, playAchievementSound, playMonsterSound, stopBackgroundMusic } from '../utils/audioManager';
import { ShellCatchGame, SeesawGame, BookshelfSortGame, PotionLabGame, MuralPuzzleGame, GateGuardGame, LavaJumpGame, BossBattleGame } from './games';

type Screen = 'home' | 'map' | 'lesson' | 'result' | 'progress';
type LessonKind =
  | 'placeValue'
  | 'sequence'
  | 'count'
  | 'numberLine'
  | 'tenFrame'
  | 'add'
  | 'subtract'
  | 'add2'
  | 'subtract2'
  | 'compare'
  | 'makeTen'
  | 'multiply'
  | 'logic'
  | 'word'
  | 'shape'
  | 'clock'
  | 'money'
  | 'review';

type PlayMode =
  | 'bottleDrop'
  | 'crabCompare'
  | 'lighthouseBulb'
  | 'bossRush'
  | 'coconutPick'
  | 'monsterBattle'
  | 'vinePath'
  | 'echoRune'
  | 'cliffStep'
  | 'bridgePath'
  | 'bookGroup'
  | 'targetStrike'
  | 'potionMix'
  | 'muralPuzzle'
  | 'stoneSwitch'
  | 'gateGuard'
  | 'lavaHop'
  | 'treasureUnlock'
  | 'numberSnake'
  | 'fruitSlice'
  | 'moleWhack'
  | 'seesawCompare'
  | 'dragonBoat'
  | 'towerDefense'
  | 'runnerDash'
  | 'duelBattle';

interface Lesson {
  id: number;
  regionId: number;
  regionName: string;
  nodeType: '机关' | '战斗' | '收集' | 'Boss' | '谜题';
  title: string;
  subtitle: string;
  kind: LessonKind;
  range: [number, number];
  questionCount: number;
  goal: string;
  reward: string;
  scene: string;
  enemy: string;
  decor: string;
  playMode: PlayMode;
  color: 'meadow' | 'sun' | 'aqua' | 'ember' | 'violet' | 'mint';
}

interface Question {
  prompt: string;
  answer: number | string;
  options: Array<number | string>;
  kind: LessonKind;
  hint: string;
  visual: {
    mode?: 'compose' | 'missing' | 'digit' | 'numberLine100' | 'compareClue' | 'nearestTen' | 'swap' | 'order' | 'story';
    a?: number;
    b?: number;
    total?: number;
    target?: number;
    shape?: string;
    coins?: number[];
    hour?: number;
    comparePair?: [number, number];
    values?: Array<number | string>;
    label?: string;
  };
}

interface ProgressState {
  stars: Record<number, number>;
  bestScore: Record<number, number>;
  gems: number;
  lessonsCompleted: number;
  bestStreak: number;
}

interface DailyLessonSession {
  time: string;
  lessonId: number;
  lessonTitle: string;
  regionName: string;
  correct: number;
  total: number;
  stars: number;
  score: number;
  streak: number;
  minutes: number;
  reward: string;
}

interface DailyLearningLog {
  date: string;
  sessions: DailyLessonSession[];
}

const progressKey = 'mathAdventureIslandV2';
const dailyLogKey = 'mathAdventureIslandDailyLogsV1';
const reportEmail = 'mr.hone@foxmail.com';
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
const farmAsset = publicAsset('assets/PixelSRPG-Forge-main/Asset_Packs_素材套图/​FarmLife');
const uiAsset = publicAsset('assets/PixelSRPG-Forge-main/UI_Elements_界面元素/IconsPropsMonsters');
const islandAsset = publicAsset('assets/island-map');

const regionMeta = [
  { id: 1, name: '迷雾海滩', theme: '100以内数的认识', palette: 'beach', boss: '迷雾水母' },
  { id: 2, name: '椰果森林', theme: '两位数加减一位数', palette: 'forest', boss: '巨嘴鸟王' },
  { id: 3, name: '回声山谷', theme: '两位数加减两位数', palette: 'valley', boss: '岩石巨人' },
  { id: 4, name: '算术城堡', theme: '乘法启蒙', palette: 'castle', boss: '算术法师' },
  { id: 5, name: '谜题遗迹', theme: '逻辑与应用题', palette: 'ruin', boss: '遗迹守护者' },
  { id: 6, name: '火焰山巅', theme: '综合最终挑战', palette: 'volcano', boss: '暗影巨龙' },
];

const makeLesson = (
  id: number,
  regionId: number,
  nodeType: Lesson['nodeType'],
  title: string,
  subtitle: string,
  kind: LessonKind,
  range: [number, number],
  questionCount: number,
  goal: string,
  reward: string,
  scene: string,
  enemy: string,
  decor: string,
  playMode: PlayMode,
  color: Lesson['color'],
): Lesson => ({
  id,
  regionId,
  regionName: regionMeta[regionId - 1].name,
  nodeType,
  title,
  subtitle,
  kind,
  range,
  questionCount,
  goal,
  reward,
  scene,
  enemy,
  decor,
  playMode,
  color,
});

const lessons: Lesson[] = [
  makeLesson(1, 1, '机关', '漂流瓶谜题', '几个十和几个一', 'placeValue', [10, 99], 8, '读懂两位数由几个十和几个一组成', '贝壳徽章', '沙滩漂流瓶', '数字精灵', '图层 15.png', 'bottleDrop', 'aqua'),
  makeLesson(2, 1, '战斗', '跷跷板螃蟹', '100以内大小比较', 'compare', [10, 99], 9, '让更大的数字把跷跷板压下去', '钳子徽章', '潮汐浅滩', '螃蟹算术兽', '图层 14.png', 'seesawCompare', 'sun'),
  makeLesson(3, 1, '谜题', '灯塔贪吃蛇', '按规律填数', 'sequence', [20, 100], 9, '沿着正确数字光点修好灯塔', '灯塔徽章', '数字灯塔', '雾灯机关', '图层 10.png', 'numberSnake', 'meadow'),
  makeLesson(4, 1, 'Boss', '迷雾水母', '组成+比较+排序', 'review', [10, 100], 12, '连续完成100以内数感综合挑战', '海雾勇者徽章', '迷雾海面', '迷雾水母', '图层 3.png', 'bossRush', 'aqua'),

  makeLesson(5, 2, '收集', '切椰果', '整十数加一位数', 'add', [20, 90], 9, '切开正确椰果，收集甜甜果汁', '椰果徽章', '椰林树冠', '椰果精灵', '图层 13.png', 'fruitSlice', 'meadow'),
  makeLesson(6, 2, '战斗', '猴子对战', '两位数加一位数', 'add', [20, 99], 10, '算得越快，勇者出手越快', '香蕉徽章', '森林树屋', '猴子算术兽', '图层 8.png', 'duelBattle', 'sun'),
  makeLesson(7, 2, '机关', '藤蔓跑酷', '两位数减一位数', 'subtract', [20, 99], 10, '选对落脚点，越过藤蔓陷阱', '藤蔓徽章', '三岔藤蔓', '藤蔓机关', '图层 5.png', 'runnerDash', 'mint'),
  makeLesson(8, 2, 'Boss', '巨嘴鸟王', '进位与退位综合', 'review', [20, 99], 13, '在限时压力下混合完成两位数加减一位数', '森林勇者徽章', '树冠王座', '巨嘴鸟王', '图层 8.png', 'bossRush', 'meadow'),

  makeLesson(9, 3, '机关', '回声打地鼠', '整十数加整十数', 'add2', [20, 90], 10, '敲中正确回声洞口', '回声徽章', '山谷石刻', '回声石灵', '图层 14.png', 'moleWhack', 'violet'),
  makeLesson(10, 3, '战斗', '岩羊塔防', '两位数加两位数', 'add2', [20, 99], 11, '用正确答案建箭塔，挡住岩羊冲撞', '岩羊徽章', '山崖跳台', '岩羊算术兽', '图层 7.png', 'towerDefense', 'sun'),
  makeLesson(11, 3, '机关', '独木桥赛道', '两位数减两位数', 'subtract2', [20, 99], 11, '踩对木板，让勇者冲过溪谷', '木桥徽章', '溪谷独木桥', '桥面机关', '图层 15.png', 'runnerDash', 'aqua'),
  makeLesson(12, 3, 'Boss', '岩石巨人', '两位数加减综合', 'review', [20, 99], 14, '综合使用两位数加减策略击碎岩石护甲', '山谷勇者徽章', '巨石峡谷', '岩石巨人', '图层 4.png', 'bossRush', 'violet'),

  makeLesson(13, 4, '谜题', '城堡图书馆', '理解几个几', 'multiply', [2, 5], 10, '把重复加法转成乘法表达', '魔法书徽章', '城堡图书馆', '书架精灵', '图层 9.png', 'bookGroup', 'mint'),
  makeLesson(14, 4, '战斗', '骑士对战场', '2-5的乘法口诀', 'multiply', [2, 5], 12, '算对口诀发起连击', '木剑徽章', '骑士训练场', '稻草人算术兽', '图层 12.png', 'duelBattle', 'ember'),
  makeLesson(15, 4, '机关', '魔法工坊', '乘法列式计算', 'multiply', [3, 6], 12, '根据配方算出总剂量', '药水徽章', '魔法工坊', '药水机关', '图层 3.png', 'potionMix', 'violet'),
  makeLesson(16, 4, 'Boss', '算术法师', '乘法应用综合', 'review', [2, 6], 14, '在加法与乘法之间灵活转换', '城堡勇者徽章', '城堡塔顶', '算术法师', '图层 10.png', 'bossRush', 'ember'),

  makeLesson(17, 5, '谜题', '壁画谜题', '一步应用题', 'word', [10, 80], 10, '读懂故事，选择正确算式', '壁画徽章', '古代壁画', '壁画精灵', '图层 9.png', 'muralPuzzle', 'sun'),
  makeLesson(18, 5, '机关', '石板打地鼠', '比多比少', 'logic', [10, 80], 11, '抓住“多几/少几”，敲开正确石板', '石板徽章', '机关石板', '遗迹机关', '图层 6.png', 'moleWhack', 'mint'),
  makeLesson(19, 5, '战斗', '石门守卫', '排除多余条件', 'word', [20, 99], 12, '从文字里找出真正需要的信息', '守卫徽章', '遗迹石门', '石门守卫', '图层 11.png', 'gateGuard', 'violet'),
  makeLesson(20, 5, 'Boss', '遗迹守护者', '两步应用题', 'logic', [20, 99], 14, '完成两步推理题，打开智慧石门', '遗迹勇者徽章', '遗迹核心', '遗迹守护者', '图层 12.png', 'bossRush', 'sun'),

  makeLesson(21, 6, '机关', '熔岩河流', '混合运算生存', 'review', [20, 100], 14, '在倒计时感下快速完成混合运算', '熔岩徽章', '熔岩跳石', '火焰精灵', '图层 4.png', 'lavaHop', 'ember'),
  makeLesson(22, 6, '战斗', '火焰龙舟', '乘法与加法混合', 'review', [20, 100], 15, '算得越快，龙舟划得越快', '火焰徽章', '火山坡道', '火焰精灵', '图层 3.png', 'dragonBoat', 'ember'),
  makeLesson(23, 6, '谜题', '智慧宝库塔防', '全岛知识复盘', 'review', [1, 100], 15, '用知识炮塔守住宝库入口', '宝库徽章', '宝藏石门', '智慧宝箱', '图层 11.png', 'towerDefense', 'violet'),
  makeLesson(24, 6, 'Boss', '暗影巨龙', '最终Boss综合', 'review', [1, 100], 18, '连续完成高强度综合挑战，夺回智慧宝藏', '智慧宝藏', '火山口', '暗影巨龙', '图层 12.png', 'bossRush', 'ember'),
];

const blankProgress: ProgressState = {
  stars: {},
  bestScore: {},
  gems: 0,
  lessonsCompleted: 0,
  bestStreak: 0,
};

const lessonMusicTrack: Record<LessonKind, LessonKind> = {
  placeValue: 'tenFrame',
  sequence: 'numberLine',
  count: 'count',
  numberLine: 'numberLine',
  tenFrame: 'tenFrame',
  add: 'add',
  subtract: 'subtract',
  add2: 'add',
  subtract2: 'subtract',
  compare: 'compare',
  makeTen: 'makeTen',
  multiply: 'money',
  logic: 'word',
  word: 'word',
  shape: 'shape',
  clock: 'clock',
  money: 'money',
  review: 'review',
};

const arcadePlayModes: PlayMode[] = ['numberSnake', 'fruitSlice', 'moleWhack', 'seesawCompare', 'dragonBoat', 'towerDefense', 'runnerDash', 'lavaHop', 'duelBattle', 'bottleDrop', 'bookGroup', 'potionMix', 'muralPuzzle', 'gateGuard', 'bossRush'];

const islandDecorations: Record<LessonKind, string> = {
  placeValue: '图层 15.png',
  sequence: '图层 10.png',
  count: '图层 13.png',
  numberLine: '图层 15.png',
  tenFrame: '图层 3.png',
  add: '图层 4.png',
  add2: '图层 4.png',
  makeTen: '图层 5.png',
  subtract: '图层 6.png',
  subtract2: '图层 6.png',
  compare: '图层 7.png',
  multiply: '图层 12.png',
  logic: '图层 9.png',
  word: '图层 8.png',
  shape: '图层 9.png',
  clock: '图层 10.png',
  money: '图层 11.png',
  review: '图层 12.png',
};

const playModeCopy: Record<PlayMode, { verb: string; instruction: string; optionClass: string; target: string; fx: 'drop' | 'attack' | 'puzzle' | 'coin' | 'boss' }> = {
  bottleDrop: { verb: '拖入瓶口', instruction: '把正确数字贝壳拖到漂流瓶口，也可以直接点击贝壳。', optionClass: 'shell-option', target: '漂流瓶口', fx: 'drop' },
  crabCompare: { verb: '点钳子', instruction: '观察左右数字，点击应该放在中间的比较符号。', optionClass: 'claw-option', target: '螃蟹钳子', fx: 'attack' },
  lighthouseBulb: { verb: '装灯泡', instruction: '找到规律，把正确数字灯泡装回灯塔。', optionClass: 'bulb-option', target: '灯塔空位', fx: 'puzzle' },
  numberSnake: { verb: '吃光点', instruction: '像贪吃蛇一样吃到正确数字光点，吃错会撞上迷雾。', optionClass: 'snake-option', target: '蛇头路线', fx: 'puzzle' },
  fruitSlice: { verb: '切水果', instruction: '像切水果一样劈开正确答案，错的水果会弹开。', optionClass: 'fruit-option', target: '果汁篮', fx: 'coin' },
  moleWhack: { verb: '敲洞口', instruction: '正确答案会从洞口冒出来，快速敲中它。', optionClass: 'mole-option', target: '地鼠洞', fx: 'attack' },
  seesawCompare: { verb: '压跷板', instruction: '选择正确符号，让更大的数字落到低处。', optionClass: 'seesaw-option', target: '跷跷板中心', fx: 'puzzle' },
  dragonBoat: { verb: '划龙舟', instruction: '答得越准，龙舟越快冲向终点。', optionClass: 'boat-option', target: '鼓点节奏', fx: 'coin' },
  towerDefense: { verb: '建箭塔', instruction: '选对答案会立起知识箭塔，挡住来袭怪物。', optionClass: 'tower-option', target: '防线格子', fx: 'attack' },
  runnerDash: { verb: '跳平台', instruction: '点击正确平台，让勇者不断向前跑酷。', optionClass: 'runner-option', target: '下一块平台', fx: 'puzzle' },
  duelBattle: { verb: '发起攻击', instruction: '选对答案就攻击，连续答对会形成连击。', optionClass: 'duel-option', target: '攻击时机', fx: 'attack' },
  bossRush: { verb: '释放勇气', instruction: 'Boss 连续挑战：答对会削弱护甲，答错会扣生命。', optionClass: 'rune-option', target: 'Boss弱点', fx: 'boss' },
  coconutPick: { verb: '摘椰子', instruction: '点击正确椰子，让它掉进背包。', optionClass: 'coconut-option', target: '椰子背包', fx: 'coin' },
  monsterBattle: { verb: '挥剑攻击', instruction: '选出正确答案，勇者会挥剑击退算术兽。', optionClass: 'sword-option', target: '攻击指令', fx: 'attack' },
  vinePath: { verb: '选藤蔓', instruction: '三岔路口只有一条路安全，点击正确结果前进。', optionClass: 'vine-option', target: '安全藤蔓', fx: 'puzzle' },
  echoRune: { verb: '敲回声', instruction: '点击正确回声符文，让山谷回响答案。', optionClass: 'rune-option', target: '回声石壁', fx: 'puzzle' },
  cliffStep: { verb: '稳住岩石', instruction: '答对后岩羊脚下岩石会变稳，连续答对可以连跳。', optionClass: 'stone-option', target: '山崖跳台', fx: 'attack' },
  bridgePath: { verb: '踩踏板', instruction: '依次选择正确数字踏板，帮勇者过桥。', optionClass: 'plank-option', target: '桥面踏板', fx: 'puzzle' },
  bookGroup: { verb: '排书组', instruction: '把正确数量的魔法书放到书架上，理解几个几。', optionClass: 'book-option', target: '魔法书架', fx: 'drop' },
  targetStrike: { verb: '击中靶心', instruction: '选对口诀结果，木剑会击倒训练靶。', optionClass: 'target-option', target: '训练靶心', fx: 'attack' },
  potionMix: { verb: '倒药水', instruction: '点击正确剂量，把药水倒进魔法锅。', optionClass: 'potion-option', target: '魔法锅', fx: 'drop' },
  muralPuzzle: { verb: '读壁画', instruction: '先读故事，再点击最符合情境的答案石板。', optionClass: 'mural-option', target: '壁画答案', fx: 'puzzle' },
  stoneSwitch: { verb: '按石板', instruction: '根据“多几/少几”条件，激活正确机关石板。', optionClass: 'switch-option', target: '机关核心', fx: 'puzzle' },
  gateGuard: { verb: '回应守卫', instruction: '排除多余信息，选择能打开石门的答案。', optionClass: 'guard-option', target: '石门守卫', fx: 'attack' },
  lavaHop: { verb: '跳岩石', instruction: '熔岩岩石会下沉，快速点击正确落脚点。', optionClass: 'lava-option', target: '下一块岩石', fx: 'puzzle' },
  treasureUnlock: { verb: '开宝箱', instruction: '完成综合复盘，把正确答案插入智慧宝箱锁孔。', optionClass: 'treasure-option', target: '宝箱锁孔', fx: 'coin' },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function summarizeDailyLog(log?: DailyLearningLog) {
  const sessions = log?.sessions || [];
  return {
    sessions,
    attempts: sessions.length,
    questions: sessions.reduce((sum, item) => sum + item.total, 0),
    correct: sessions.reduce((sum, item) => sum + item.correct, 0),
    stars: sessions.reduce((sum, item) => sum + item.stars, 0),
    minutes: sessions.reduce((sum, item) => sum + item.minutes, 0),
    bestStreak: sessions.reduce((best, item) => Math.max(best, item.streak), 0),
    accuracy: sessions.length ? Math.round((sessions.reduce((sum, item) => sum + item.correct, 0) / Math.max(1, sessions.reduce((sum, item) => sum + item.total, 0))) * 100) : 0,
  };
}

function buildDailyEmailReport(log: DailyLearningLog, totalStars: number, gems: number, level: number) {
  const summary = summarizeDailyLog(log);
  const lessonLines = summary.sessions.length
    ? summary.sessions.map((item, index) => `${index + 1}. ${item.time} ${item.regionName} - ${item.lessonTitle}: ${item.correct}/${item.total}题，${item.stars}星，连击${item.streak}，用时${item.minutes}分钟`).join('\n')
    : '今天还没有完成关卡。';

  return [
    `数学冒险岛学习日报`,
    `日期：${log.date}`,
    ``,
    `今日概览`,
    `完成挑战：${summary.attempts} 次`,
    `答题情况：${summary.correct}/${summary.questions} 题，正确率 ${summary.accuracy}%`,
    `获得星星：${summary.stars} 颗`,
    `最高连击：${summary.bestStreak}`,
    `学习时长：约 ${summary.minutes} 分钟`,
    ``,
    `长期进度`,
    `累计星星：${totalStars}`,
    `星星币：${gems}`,
    `勇者等级：Lv.${level}`,
    ``,
    `今日明细`,
    lessonLines,
    ``,
    `建议：如果正确率低于80%，明天先复习今天错得多的区域；如果连续两天超过90%，可以解锁下一片冒险区域。`,
  ].join('\n');
}

function makeOptions(answer: number, min: number, max: number): number[] {
  const options = new Set<number>([answer]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, 4]);
  offsets.forEach(offset => {
    if (options.size < 4) options.add(clamp(answer + offset, min, max));
  });
  while (options.size < 4) options.add(rand(min, max));
  return shuffle([...options]);
}

function makeStringOptions(answer: string, options: string[]) {
  return shuffle([answer, ...shuffle(options.filter(option => option !== answer)).slice(0, 3)]);
}

function buildPlaceValueQuestion(lesson: Lesson, questionIndex: number): Question {
  const [min, max] = lesson.range;
  const value = rand(Math.max(12, min), Math.min(98, max));
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const stage = questionIndex % 8;

  if (stage === 0) {
    return {
      kind: 'placeValue',
      prompt: `漂流瓶里写着 ${tens} 个十和 ${ones} 个一，应该贴哪张数字贝壳？`,
      answer: value,
      options: makeOptions(value, 10, 99),
      hint: '十位看“几个十”，个位看“几个一”。',
      visual: { mode: 'compose', a: tens, b: ones, total: value, label: '瓶中线索' },
    };
  }

  if (stage === 1) {
    const target = rand(32, 89);
    const targetTens = Math.floor(target / 10);
    const targetOnes = target % 10;
    const missingTens = Math.random() > 0.5;
    const answer = missingTens ? targetTens : targetOnes;
    return {
      kind: 'placeValue',
      prompt: missingTens
        ? `残缺标签：__ 个十和 ${targetOnes} 个一合成 ${target}。空白处是几？`
        : `残缺标签：${targetTens} 个十和 __ 个一合成 ${target}。空白处是几？`,
      answer,
      options: makeOptions(answer, 0, 9),
      hint: missingTens ? '看十位上的数字。' : '看个位上的数字。',
      visual: { mode: 'missing', a: targetTens, b: targetOnes, total: target, target: answer, label: missingTens ? '缺十位' : '缺个位' },
    };
  }

  if (stage === 2) {
    const askTens = Math.random() > 0.5;
    return {
      kind: 'placeValue',
      prompt: `贝壳编号 ${value}，${askTens ? '十位' : '个位'}上的数字是几？`,
      answer: askTens ? tens : ones,
      options: makeOptions(askTens ? tens : ones, 0, 9),
      hint: '左边是十位，右边是个位。',
      visual: { mode: 'digit', a: tens, b: ones, total: value, label: askTens ? '看十位' : '看个位' },
    };
  }

  if (stage === 3) {
    const start = Math.floor(rand(20, 80) / 10) * 10;
    const step = rand(3, 8);
    const target = start + step;
    return {
      kind: 'placeValue',
      prompt: `勇者从 ${start} 出发，沿数轴向前跳 ${step} 格，会落到哪个数字？`,
      answer: target,
      options: makeOptions(target, 10, 99),
      hint: '从整十数开始，一格一格往后数。',
      visual: { mode: 'numberLine100', a: start, b: step, target, values: Array.from({ length: 11 }, (_, index) => start + index), label: '数轴跳跃' },
    };
  }

  if (stage === 4) {
    const clueTens = rand(3, 8);
    const limit = clueTens * 10 + rand(2, 8);
    const answer = clueTens * 10 + rand(0, Math.max(0, limit - clueTens * 10 - 1));
    const distractors = new Set<number>([
      answer,
      clueTens * 10 + rand(limit % 10, 9),
      clamp((clueTens + 1) * 10 + rand(0, 6), 10, 99),
      clamp((clueTens - 1) * 10 + rand(0, 9), 10, 99),
    ]);
    while (distractors.size < 4) distractors.add(rand(10, 99));
    return {
      kind: 'placeValue',
      prompt: `哪张贝壳是 ${clueTens} 个十，并且比 ${limit} 小？`,
      answer,
      options: shuffle([...distractors]),
      hint: `先找十位是 ${clueTens} 的数，再看是否小于 ${limit}。`,
      visual: { mode: 'compareClue', a: clueTens, b: limit, total: answer, label: '双条件线索' },
    };
  }

  if (stage === 5) {
    const target = rand(24, 86);
    const lowerTen = Math.floor(target / 10) * 10;
    const upperTen = lowerTen + 10;
    const answer = target - lowerTen <= upperTen - target ? lowerTen : upperTen;
    return {
      kind: 'placeValue',
      prompt: `${target} 更接近哪个整十数？`,
      answer,
      options: makeOptions(answer, 10, 100),
      hint: '看它离前一个整十数近，还是离后一个整十数近。',
      visual: { mode: 'nearestTen', a: lowerTen, b: upperTen, target, total: answer, values: [lowerTen, target, upperTen], label: '找最近港口' },
    };
  }

  if (stage === 6) {
    const raw = rand(12, 98);
    const rawTens = Math.floor(raw / 10);
    const rawOnes = raw % 10 || rand(1, 9);
    const source = rawTens * 10 + rawOnes;
    const answer = rawOnes * 10 + rawTens;
    return {
      kind: 'placeValue',
      prompt: `魔法风把 ${source} 的十位和个位交换了，变成几？`,
      answer,
      options: makeOptions(answer, 10, 99),
      hint: '原来的个位会跑到十位，原来的十位会跑到个位。',
      visual: { mode: 'swap', a: rawTens, b: rawOnes, total: source, target: answer, label: '数位交换' },
    };
  }

  const first = rand(24, 49);
  const second = rand(50, 74);
  const third = rand(75, 96);
  const values = shuffle([first, second, third]);
  return {
    kind: 'placeValue',
    prompt: `三只漂流瓶编号是 ${values.join('、')}。从小到大排，第 2 个是几？`,
    answer: second,
    options: makeOptions(second, 10, 99),
    hint: '先比较十位，十位相同再比较个位。',
    visual: { mode: 'order', values, target: second, label: '瓶子排序' },
  };
}

function buildQuestion(lesson: Lesson, questionIndex = 0): Question {
  const [min, max] = lesson.range;
  const reviewPools: Record<number, LessonKind[]> = {
    1: ['placeValue', 'compare', 'sequence'],
    2: ['add', 'subtract', 'compare'],
    3: ['add2', 'subtract2', 'compare'],
    4: ['multiply', 'add2', 'word'],
    5: ['logic', 'word', 'add2', 'subtract2'],
    6: ['placeValue', 'add2', 'subtract2', 'multiply', 'logic', 'word'],
  };
  const kind = lesson.kind === 'review' ? shuffle<LessonKind>(reviewPools[lesson.regionId] || reviewPools[6])[0] : lesson.kind;

  if (kind === 'placeValue') {
    return buildPlaceValueQuestion(lesson, questionIndex);
  }

  if (kind === 'sequence') {
    const step = shuffle([2, 5, 10])[0];
    const start = rand(2, 8) * step;
    const blankIndex = rand(1, 3);
    const values = Array.from({ length: 5 }, (_, index) => start + index * step);
    const answer = values[blankIndex];
    return {
      kind,
      prompt: `找规律：${values.map((value, index) => index === blankIndex ? '__' : value).join('、')}，空格是几？`,
      answer,
      options: makeOptions(answer, 1, 100),
      hint: `相邻两个数每次都增加 ${step}。`,
      visual: { a: start, b: step, target: answer },
    };
  }

  if (kind === 'count') {
    const total = rand(min, max);
    return {
      kind,
      prompt: '菜园里一共有多少个成熟作物？',
      answer: total,
      options: makeOptions(total, 1, 12),
      hint: '可以先数满一行，再接着数下一行。',
      visual: { total },
    };
  }

  if (kind === 'numberLine') {
    const a = rand(0, 7);
    const b = rand(1, 3);
    const answer = a + b;
    return {
      kind,
      prompt: `从 ${a} 出发，向前走 ${b} 格，会到几？`,
      answer,
      options: makeOptions(answer, 0, 12),
      hint: '向右走一格，数就加 1。',
      visual: { a, b, target: answer },
    };
  }

  if (kind === 'tenFrame') {
    const total = rand(1, 9);
    const answer = 10 - total;
    return {
      kind,
      prompt: `${total} 还差几个就满 10？`,
      answer,
      options: makeOptions(answer, 0, 10),
      hint: '十格图里空着几个，就是还差几个。',
      visual: { total, target: 10 },
    };
  }

  if (kind === 'add') {
    const a = max > 30 ? rand(20, Math.min(89, max - 8)) : rand(1, max <= 10 ? 6 : 12);
    const b = max > 30 ? rand(1, 9) : rand(1, max <= 10 ? 10 - a : clamp(20 - a, 2, 8));
    const answer = a + b;
    return {
      kind,
      prompt: `${a} + ${b} = ?`,
      answer,
      options: makeOptions(answer, 1, 100),
      hint: max > 30 ? '先算个位，再看是否需要进一到十位。' : '先把第一堆放在心里，再接着数第二堆。',
      visual: { a, b, total: answer },
    };
  }

  if (kind === 'add2') {
    const a = lesson.regionId >= 3 ? rand(20, 79) : rand(10, 50);
    const b = lesson.regionId >= 3 ? rand(10, Math.min(99 - a, 48)) : rand(10, 40);
    const answer = a + b;
    return {
      kind,
      prompt: `${a} + ${b} = ?`,
      answer,
      options: makeOptions(answer, 10, 100),
      hint: '先把十位相加，再把个位相加；个位满10要向十位进1。',
      visual: { a, b, total: answer },
    };
  }

  if (kind === 'makeTen') {
    const a = rand(1, 9);
    const answer = 10 - a;
    return {
      kind,
      prompt: `${a} 和几可以组成 10？`,
      answer,
      options: makeOptions(answer, 1, 9),
      hint: '看到 1 想 9，看到 2 想 8，像一对搭档。',
      visual: { a, total: 10 },
    };
  }

  if (kind === 'subtract') {
    const a = max > 30 ? rand(22, max) : rand(4, max);
    const b = max > 30 ? rand(1, 9) : rand(1, a - 1);
    const answer = a - b;
    return {
      kind,
      prompt: `${a} - ${b} = ?`,
      answer,
      options: makeOptions(answer, 0, 100),
      hint: max > 30 ? '个位不够减时，可以向十位借1个十。' : '从总数里划掉拿走的数量，剩下的就是答案。',
      visual: { a, b, total: answer },
    };
  }

  if (kind === 'subtract2') {
    const b = rand(11, 48);
    const a = rand(b + 10, 99);
    const answer = a - b;
    return {
      kind,
      prompt: `${a} - ${b} = ?`,
      answer,
      options: makeOptions(answer, 0, 100),
      hint: '先看个位够不够减，再处理十位。',
      visual: { a, b, total: answer },
    };
  }

  if (kind === 'compare') {
    const a = rand(min, max);
    const b = Math.random() > 0.2 ? rand(min, max) : a;
    const answer = a > b ? '>' : a < b ? '<' : '=';
    return {
      kind,
      prompt: '选择中间应该放的符号。',
      answer,
      options: makeStringOptions(answer, ['>', '<', '=']),
      hint: '开口朝向更大的数。',
      visual: { comparePair: [a, b] },
    };
  }

  if (kind === 'word') {
    const a = rand(lesson.regionId >= 5 ? 20 : 8, lesson.regionId >= 5 ? 80 : 28);
    const b = rand(1, Math.min(18, a - 1));
    const isAdd = Math.random() > 0.45;
    const answer = isAdd ? a + b : a - b;
    return {
      kind,
      prompt: isAdd ? `冒险小店有 ${a} 颗星糖，数字精灵又送来 ${b} 颗。现在有几颗？` : `勇者带着 ${a} 颗星糖，路上分给居民 ${b} 颗。还剩几颗？`,
      answer,
      options: makeOptions(answer, 0, 100),
      hint: isAdd ? '“又送来”表示变多，用加法。' : '“分给”表示拿走，用减法。',
      visual: { a, b, total: answer },
    };
  }

  if (kind === 'multiply') {
    const a = rand(min, max);
    const b = rand(2, 6);
    const answer = a * b;
    return {
      kind,
      prompt: `${b} 组，每组 ${a} 个，一共有几个？`,
      answer,
      options: makeOptions(answer, 2, 36),
      hint: '几个几可以用连加，也可以用乘法。',
      visual: { a, b, total: answer },
    };
  }

  if (kind === 'logic') {
    const base = rand(12, 64);
    const diff = rand(3, 18);
    const more = Math.random() > 0.5;
    const answer = more ? base + diff : base - diff;
    return {
      kind,
      prompt: more ? `海滩有 ${base} 个贝壳，森林的贝壳比海滩多 ${diff} 个。森林有几个？` : `仓库有 ${base} 个木箱，遗迹比仓库少 ${diff} 个。遗迹有几个？`,
      answer,
      options: makeOptions(answer, 0, 100),
      hint: more ? '“比它多”要加上多出的数量。' : '“比它少”要减去少的数量。',
      visual: { a: base, b: diff, total: answer },
    };
  }

  if (kind === 'shape') {
    const shapes = [
      { name: '三角形', sides: 3 },
      { name: '正方形', sides: 4 },
      { name: '长方形', sides: 4 },
      { name: '五边形', sides: 5 },
      { name: '六边形', sides: 6 },
    ];
    const shape = shapes[rand(0, shapes.length - 1)];
    return {
      kind,
      prompt: `${shape.name} 有几条边？`,
      answer: shape.sides,
      options: makeOptions(shape.sides, 3, 8),
      hint: '沿着图形外圈一条一条数。',
      visual: { shape: shape.name, total: shape.sides },
    };
  }

  if (kind === 'clock') {
    const hour = rand(1, 12);
    return {
      kind,
      prompt: '钟面显示的是几点？',
      answer: hour,
      options: makeOptions(hour, 1, 12),
      hint: '分针指向 12 时，看短针指向几。',
      visual: { hour },
    };
  }

  const target = rand(3, 10);
  const coins: number[] = [];
  let rest = target;
  [5, 2, 1].forEach(coin => {
    while (rest >= coin && coins.length < 6) {
      coins.push(coin);
      rest -= coin;
    }
  });
  return {
    kind: 'money',
    prompt: '这些金币一共是多少元？',
    answer: target,
    options: makeOptions(target, 1, 12),
    hint: '先算 5 元，再算 2 元，最后数 1 元。',
    visual: { coins, total: target },
  };
}

export default function MathGame() {
  const [screen, setScreen] = useState<Screen>('home');
  const [progressReturnScreen, setProgressReturnScreen] = useState<Screen>('home');
  const [progress, setProgress] = useState<ProgressState>(blankProgress);
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [draggedAnswer, setDraggedAnswer] = useState<number | string | null>(null);
  const [lastStars, setLastStars] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [lessonStartedAt, setLessonStartedAt] = useState(Date.now());
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLearningLog>>({});

  useEffect(() => {
    const saved = localStorage.getItem(progressKey);
    if (saved) {
      try {
        setProgress({ ...blankProgress, ...JSON.parse(saved) });
      } catch {
        setProgress(blankProgress);
      }
    }
    const savedLogs = localStorage.getItem(dailyLogKey);
    if (savedLogs) {
      try {
        setDailyLogs(JSON.parse(savedLogs));
      } catch {
        setDailyLogs({});
      }
    }
  }, []);

  useEffect(() => {
    if (screen === 'home') playBackgroundMusic('home');
    if (screen === 'map' || screen === 'progress' || screen === 'result') playBackgroundMusic('map');
    if (screen === 'lesson') playLessonBackgroundMusic(activeLesson.id);
  }, [screen, activeLesson.id]);

  useEffect(() => () => stopBackgroundMusic(), []);

  const totalStars = useMemo(() => Object.values(progress.stars).reduce((sum, item) => sum + item, 0), [progress.stars]);
  const maxStars = lessons.length * 3;
  const playerLevel = Math.max(1, Math.floor(totalStars / 6) + 1);
  const xpPercent = ((totalStars % 6) / 6) * 100;
  const regionProgress = useMemo(() => regionMeta.map(region => {
    const nodes = lessons.filter(lesson => lesson.regionId === region.id);
    const stars = nodes.reduce((sum, lesson) => sum + (progress.stars[lesson.id] || 0), 0);
    const completed = nodes.filter(lesson => (progress.stars[lesson.id] || 0) > 0).length;
    return { ...region, nodes, stars, completed, totalStars: nodes.length * 3 };
  }), [progress.stars]);
  const currentQuestion = questions[questionIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = Boolean(currentQuestion && selectedAnswer === currentQuestion.answer);
  const todayKey = getTodayKey();
  const todayLog = dailyLogs[todayKey] || { date: todayKey, sessions: [] };
  const todaySummary = useMemo(() => summarizeDailyLog(todayLog), [todayLog]);

  const saveProgress = (next: ProgressState) => {
    setProgress(next);
    localStorage.setItem(progressKey, JSON.stringify(next));
  };

  const saveDailySession = (session: DailyLessonSession) => {
    const date = getTodayKey();
    setDailyLogs(previous => {
      const nextLog = {
        date,
        sessions: [...(previous[date]?.sessions || []), session],
      };
      const next = { ...previous, [date]: nextLog };
      localStorage.setItem(dailyLogKey, JSON.stringify(next));
      return next;
    });
  };

  const sendTodayReport = () => {
    playUISound('click');
    const log = dailyLogs[todayKey] || { date: todayKey, sessions: [] };
    const subject = `数学冒险岛学习日报 ${todayKey}`;
    const body = buildDailyEmailReport(log, totalStars, progress.gems, playerLevel);
    window.location.href = `mailto:${reportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const startLesson = (lesson: Lesson) => {
    playUISound('click');
    playMonsterSound('monster_spawn');
    setActiveLesson(lesson);
    setQuestions(Array.from({ length: lesson.questionCount }, (_, index) => buildQuestion(lesson, index)));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setStreak(0);
    setHearts(3);
    setShowHint(false);
    setDraggedAnswer(null);
    setLessonStartedAt(Date.now());
    setScreen('lesson');
  };

  const finishLesson = (finalCorrect: number, finalStreak: number, finalHearts: number) => {
    const accuracy = finalCorrect / activeLesson.questionCount;
    const stars = accuracy >= 0.9 && finalHearts > 0 ? 3 : accuracy >= 0.72 ? 2 : accuracy >= 0.5 ? 1 : 0;
    const score = finalCorrect * 100 + finalStreak * 20 + finalHearts * 60;
    const alreadyCompleted = progress.stars[activeLesson.id] > 0;
    const nextProgress: ProgressState = {
      stars: { ...progress.stars, [activeLesson.id]: Math.max(progress.stars[activeLesson.id] || 0, stars) },
      bestScore: { ...progress.bestScore, [activeLesson.id]: Math.max(progress.bestScore[activeLesson.id] || 0, score) },
      gems: progress.gems + stars * 3 + finalCorrect,
      lessonsCompleted: progress.lessonsCompleted + (alreadyCompleted || stars === 0 ? 0 : 1),
      bestStreak: Math.max(progress.bestStreak, finalStreak),
    };
    setLastStars(stars);
    setLastScore(score);
    saveProgress(nextProgress);
    saveDailySession({
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      regionName: activeLesson.regionName,
      correct: finalCorrect,
      total: activeLesson.questionCount,
      stars,
      score,
      streak: finalStreak,
      minutes: Math.max(1, Math.round((Date.now() - lessonStartedAt) / 60000)),
      reward: activeLesson.reward,
    });
    if (stars > 0) {
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.72 } });
      playBattleSound('victory');
      playAchievementSound('achievement_unlock');
      playFeedbackSound('coin');
    } else {
      playBattleSound('defeat');
    }
    setScreen('result');
  };

  const chooseAnswer = (answer: number | string) => {
    if (!currentQuestion || selectedAnswer !== null) return;
    const feedback = playModeCopy[activeLesson.playMode];
    const correct = answer === currentQuestion.answer;
    const nextCorrect = correct ? correctCount + 1 : correctCount;
    const nextStreak = correct ? streak + 1 : 0;
    const nextHearts = correct ? hearts : Math.max(0, hearts - 1);
    setSelectedAnswer(answer);
    setCorrectCount(nextCorrect);
    setStreak(nextStreak);
    setHearts(nextHearts);
    playUISound('select');
    if (correct) {
      if (feedback.fx === 'boss') playFeedbackSound('boss_hit');
      if (feedback.fx === 'attack') playBattleSound('attack');
      if (feedback.fx === 'drop') playFeedbackSound('drop');
      if (feedback.fx === 'puzzle') playPuzzleSound('puzzle_complete');
      if (feedback.fx === 'coin') playFeedbackSound('coin');
      playUISound('success');
      if (nextStreak > 0 && nextStreak % 3 === 0) playFeedbackSound('combo');
    } else {
      playBattleSound('damage');
      playUISound('error');
    }
    if (correct) {
      confetti({ particleCount: 28, spread: 45, origin: { y: 0.78 } });
    }

    window.setTimeout(() => {
      if (questionIndex + 1 >= activeLesson.questionCount || nextHearts <= 0) {
        finishLesson(nextCorrect, Math.max(progress.bestStreak, nextStreak), nextHearts);
      } else {
        setQuestionIndex(index => index + 1);
        setSelectedAnswer(null);
        setDraggedAnswer(null);
        setShowHint(false);
      }
    }, correct ? 760 : 1100);
  };

  const resetAll = () => {
    playUISound('click');
    saveProgress(blankProgress);
    setDailyLogs({});
    localStorage.removeItem(dailyLogKey);
    setScreen('map');
  };

  if (screen === 'home') {
    return (
      <main
        className="math-shell home-screen-v2"
        onPointerDown={() => playBackgroundMusic('home')}
      >
        <img
          className="home-bg-image"
          src={publicAsset('assets/home_bg.png')}
          alt=""
          aria-hidden="true"
        />
        <div className="home-sky" aria-hidden="true">
          <div className="pixel-cloud-v2 cloud-a" />
          <div className="pixel-cloud-v2 cloud-b" />
          <div className="pixel-cloud-v2 cloud-c" />
          <div className="pixel-cloud-v2 cloud-d" />
        </div>

        <section className="home-stage-v2">
          <div className="home-left-v2">
            <div className="home-ribbon-v2">
              <PxlBadge tone="green">一年级数学益智冒险</PxlBadge>
            </div>
            <h1 className="home-title-v2">
              <img src={publicAsset('assets/title.png')} alt="数学冒险岛" />
              <span>数学冒险岛</span>
            </h1>
            <div className="home-desc-v2">
              从数数、十格图、加减法到图形、钟表和金币，<br />
              把一年级核心数学拆成 6 大区域、24 段冒险挑战。
            </div>
            <div className="home-actions-v2">
              <PxlButton
                tone="gold"
                size="lg"
                iconLeft={<BookOpen size={24} />}
                className="home-pxl-button"
                onClick={() => {
                  playUISound('click');
                  playBackgroundMusic('map');
                  setScreen('map');
                }}
              >
                进入岛屿
              </PxlButton>
              <PxlButton
                tone="cyan"
                size="lg"
                variant="solid"
                iconLeft={<Award size={24} />}
                className="home-pxl-button"
                onClick={() => {
                  playUISound('click');
                  playBackgroundMusic('map');
                  setProgressReturnScreen('home');
                  setScreen('progress');
                }}
              >
                学习档案
              </PxlButton>
            </div>
          </div>

          <div className="home-scene-v2" aria-hidden="true">
            <div className="floating-items-v2">
              <img src={`${farmAsset}/carrot_05.png`} alt="" />
              <img src={`${farmAsset}/itemdisc_02.png`} alt="" />
              <img src={`${farmAsset}/beetroot_05.png`} alt="" />
              <img src={`${farmAsset}/sunflower_05.png`} alt="" />
              <img src={`${farmAsset}/wheat_05.png`} alt="" />
            </div>
            <div className="palm-v2"><i /><b /><b /><b /><b /></div>
            <div className="grass-platform-v2" />
            <div className="kid-row-v2">
              <span /><span /><span /><span />
            </div>
          </div>
        </section>

        <div className="ground-strip-v2" aria-hidden="true">
          <div className="grass-line-v2" />
          <div className="water-line-v2" />
          <div className="brick-line-v2" />
        </div>
      </main>
    );
  }

  if (screen === 'map') {
    return (
      <main className="math-shell map-screen">
        <PixelBackdrop />
        <TopBar
          title="冒险岛世界地图"
          subtitle={`⭐ ${totalStars}/${maxStars} 星 · 🪙 ${progress.gems} 星星币 · Lv.${playerLevel} 小小勇者`}
          onBack={() => setScreen('home')}
          right={<button className="icon-button" onClick={() => {
            setProgressReturnScreen('map');
            setScreen('progress');
          }} aria-label="学习档案"><Award size={20} /></button>}
        />

        <section className="adventure-hud">
          <div className="hero-card">
            <img src={`${uiAsset}/Main Characters/Virtual Guy/Idle (32x32).png`} alt="" />
            <div>
              <strong>小小勇者 Lv.{playerLevel}</strong>
              <span>草帽短裤 · 木剑</span>
              <div className="xp-bar"><i style={{ width: `${xpPercent}%` }} /></div>
            </div>
          </div>
          <div className="daily-card">
            <span>每日冒险</span>
            <strong>连续答对 8 题</strong>
            <em>奖励 +12 星星币</em>
          </div>
          <div className="shop-card">
            <img src={`${farmAsset}/sword.png`} alt="" />
            <div>
              <strong>装备商店</strong>
              <span>木剑 · 披风 · 计时沙漏</span>
            </div>
          </div>
        </section>

        <section className="world-map-layout">
          <aside className="region-rail">
            {regionProgress.map(region => (
              <div key={region.id} className={`region-chip ${region.palette}`}>
                <span>{region.id}</span>
                <strong>{region.name}</strong>
                <em>{region.completed}/{region.nodes.length} 节点 · {region.stars}/{region.totalStars} 星</em>
              </div>
            ))}
          </aside>

          <section className="lesson-grid adventure-grid">
            {lessons.map((lesson, index) => {
              const stars = progress.stars[lesson.id] || 0;
              const locked = index > 0 && !progress.stars[lessons[index - 1].id];
              const region = regionMeta[lesson.regionId - 1];
              return (
                <motion.button
                  key={lesson.id}
                  whileHover={locked ? undefined : { y: -5 }}
                  whileTap={locked ? undefined : { scale: 0.98 }}
                  className={`lesson-node adventure-node region-${region.palette} ${lesson.color} lesson-${lesson.kind} ${lesson.nodeType === 'Boss' ? 'boss-node' : ''} ${locked ? 'locked' : ''}`}
                  onClick={() => !locked && startLesson(lesson)}
                >
                  <img className="island-base-img" src={`${islandAsset}/island_bg.png`} alt="" />
                  <img className="island-deco-img main" src={`${islandAsset}/${lesson.decor || islandDecorations[lesson.kind]}`} alt="" />
                  <img className="island-deco-img tree-a" src={`${islandAsset}/图层 13.png`} alt="" />
                  <img className="island-deco-img rock-a" src={`${islandAsset}/图层 14.png`} alt="" />
                  <div className="island-card-content">
                    <span className="node-index">{lesson.id.toString().padStart(2, '0')}</span>
                    <span className="node-type">{lesson.regionName} · {lesson.nodeType}</span>
                    <span className="node-title">{lesson.title}</span>
                    <span className="node-subtitle">{lesson.subtitle}</span>
                    <span className="node-goal">{lesson.enemy}：{lesson.goal}</span>
                    <span className="node-footer">
                      <span>{lesson.questionCount} 题</span>
                      <span className="star-row">{[1, 2, 3].map(star => <Star key={star} size={16} fill={star <= stars ? 'currentColor' : 'none'} />)}</span>
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </section>
        </section>
      </main>
    );
  }

  if (screen === 'lesson' && currentQuestion) {
    const progressPercent = ((questionIndex + (isAnswered ? 1 : 0)) / activeLesson.questionCount) * 100;
    const presentation = playModeCopy[activeLesson.playMode];
    const acceptsDrop = ['bottleDrop', 'bookGroup', 'potionMix', 'treasureUnlock'].includes(activeLesson.playMode);
    const isArcadeMode = arcadePlayModes.includes(activeLesson.playMode);
    return (
      <main className={`math-shell lesson-screen theme-${activeLesson.color} lesson-play-${activeLesson.id} mode-${activeLesson.playMode}`}>
        <PixelBackdrop />
        <TopBar
          title={`${activeLesson.regionName} · ${activeLesson.title}`}
          subtitle={`${activeLesson.nodeType}挑战 · ${activeLesson.subtitle}`}
          onBack={() => setScreen('map')}
          right={<div className="heart-row">{[0, 1, 2].map(item => <Heart key={item} size={20} fill={item < hearts ? 'currentColor' : 'none'} />)}</div>}
        />

        <section className="play-layout">
          <aside className="mission-panel">
            <div className="battle-scene">
              <img className="hero-sprite" src={`${uiAsset}/Main Characters/Virtual Guy/Run (32x32).png`} alt="" />
              <span className="versus-line" />
              <div className={`enemy-sprite enemy-${activeLesson.nodeType.toLowerCase()}`}>
                {activeLesson.nodeType === 'Boss' ? activeLesson.enemy.slice(0, 2) : activeLesson.enemy.slice(0, 1)}
              </div>
            </div>
            <div className="mission-kicker"><Target size={16} /> {activeLesson.scene}</div>
            <h2>{activeLesson.goal}</h2>
            <div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
            <div className="mission-stats">
              <span>题目 {questionIndex + 1}/{activeLesson.questionCount}</span>
              <span>连击 {streak}</span>
              <span>答对 {correctCount}</span>
              <span>奖励 {activeLesson.reward}</span>
            </div>
            <button className="hint-button" onClick={() => { playUISound('click'); setShowHint(!showHint); }}>
              <HelpCircle size={18} /> {showHint ? '收起提示' : '打开提示'}
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.p className="hint-box" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {currentQuestion.hint}
                </motion.p>
              )}
            </AnimatePresence>
          </aside>

          <section className={`challenge-panel mode-${activeLesson.playMode}`}>
            <div className="interaction-banner">
              <span>{presentation.verb}</span>
              <strong>{presentation.instruction}</strong>
            </div>
            <div className="visual-zone">
              {isArcadeMode ? (
                <ArcadeGame
                  lesson={activeLesson}
                  question={currentQuestion}
                  streak={streak}
                  progress={progressPercent}
                  disabled={isAnswered}
                  onChoose={chooseAnswer}
                />
              ) : (
                <>
                  <ModeStage lesson={activeLesson} question={currentQuestion} streak={streak} progress={progressPercent} />
                  <QuestionVisual question={currentQuestion} />
                  <div
                    className={`answer-drop-zone ${acceptsDrop ? 'active' : ''} ${draggedAnswer !== null ? 'ready' : ''}`}
                    onDragOver={event => acceptsDrop && event.preventDefault()}
                    onDrop={event => {
                      event.preventDefault();
                      if (acceptsDrop && draggedAnswer !== null) {
                        playFeedbackSound('drop');
                        chooseAnswer(draggedAnswer);
                      }
                    }}
                  >
                    {presentation.target}
                  </div>
                </>
              )}
            </div>
            <div className="question-card">
              <p>{activeLesson.playMode === 'fruitSlice' ? `只切结果 = ${currentQuestion.answer} 的椰果算式，避开炸弹` : activeLesson.playMode === 'numberSnake' ? '控制小蛇，按算式结果从小到大吃掉食物' : activeLesson.playMode === 'moleWhack' ? '敲中目标算式地鼠；每敲对一次，目标数字马上更换' : activeLesson.playMode === 'duelBattle' ? '选择“战斗”，答对算式发动攻击，答错会被反击' : currentQuestion.prompt}</p>
            </div>
            {!isArcadeMode && <div className="answer-grid">
              {currentQuestion.options.map(option => {
                const answerState = !isAnswered ? '' : option === currentQuestion.answer ? 'correct' : option === selectedAnswer ? 'wrong' : 'dim';
                return (
                  <motion.button
                    key={String(option)}
                    whileHover={!isAnswered ? { y: -3 } : undefined}
                    whileTap={!isAnswered ? { scale: 0.96 } : undefined}
                    className={`answer-tile ${presentation.optionClass} ${answerState}`}
                    draggable={!isAnswered && acceptsDrop}
                    onMouseEnter={() => !isAnswered && playUISound('hover')}
                    onDragStart={() => {
                      if (!isAnswered && acceptsDrop) {
                        setDraggedAnswer(option);
                        playUISound('select');
                      }
                    }}
                    onClick={() => chooseAnswer(option)}
                    disabled={isAnswered}
                  >
                    <span className="option-action">{presentation.verb}</span>
                    {option}
                  </motion.button>
                );
              })}
            </div>}
          </section>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    return (
      <main className="math-shell result-screen">
        <PixelBackdrop />
        <section className="result-card">
          <div className="result-stars">{[1, 2, 3].map(star => <Star key={star} size={42} fill={star <= lastStars ? 'currentColor' : 'none'} />)}</div>
          <h1>{lastStars > 0 ? '关卡完成' : '再试一次'}</h1>
          <p>{activeLesson.reward} · 得分 {lastScore}</p>
          <div className="result-summary">
            <span><Check size={18} /> 答对 {correctCount}/{activeLesson.questionCount}</span>
            <span><Coins size={18} /> 星星币 +{lastStars * 3 + correctCount}</span>
            <span><Sparkles size={18} /> 最佳连击 {progress.bestStreak}</span>
          </div>
          <div className="home-actions compact">
            <button className="pixel-action primary" onClick={() => setScreen('map')}>
              <ChevronRight size={22} /> 回地图
            </button>
            <button className="pixel-action ghost" onClick={() => startLesson(activeLesson)}>
              <RotateCcw size={22} /> 再玩一次
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="math-shell progress-screen">
      <PixelBackdrop />
      <TopBar title="学习档案" subtitle="掌握情况与奖励" onBack={() => setScreen(progressReturnScreen)} />
      <section className="progress-board">
        <div className="stat-box"><Star size={26} /><strong>{totalStars}</strong><span>已获星星</span></div>
        <div className="stat-box"><Coins size={26} /><strong>{progress.gems}</strong><span>星星币</span></div>
        <div className="stat-box"><BookOpen size={26} /><strong>{progress.lessonsCompleted}</strong><span>完成课程</span></div>
        <div className="stat-box"><Sparkles size={26} /><strong>{progress.bestStreak}</strong><span>最高连击</span></div>
      </section>
      <section className="daily-report-card">
        <div className="daily-report-copy">
          <span>今日学习报告</span>
          <strong>{todaySummary.correct}/{todaySummary.questions} 题 · 正确率 {todaySummary.accuracy}% · {todaySummary.stars} 星 · {todaySummary.minutes} 分钟</strong>
          <em>收件人：{reportEmail}</em>
        </div>
        <button className="pixel-action primary report-button" onClick={sendTodayReport}>
          <Mail size={20} /> 发送今日报告
        </button>
      </section>
      {todaySummary.sessions.length > 0 && (
        <section className="daily-session-list">
          {todaySummary.sessions.slice(-5).reverse().map((session, index) => (
            <div className="daily-session-row" key={`${session.time}-${session.lessonId}-${index}`}>
              <span>{session.time}</span>
              <strong>{session.regionName} · {session.lessonTitle}</strong>
              <em>{session.correct}/{session.total} 题 · {session.stars} 星 · 连击 {session.streak}</em>
            </div>
          ))}
        </section>
      )}
      <section className="achievement-list">
        {lessons.map(lesson => (
          <div className="achievement-row" key={lesson.id}>
            <span>{lesson.reward}</span>
            <span>{[1, 2, 3].map(star => <Star key={star} size={15} fill={star <= (progress.stars[lesson.id] || 0) ? 'currentColor' : 'none'} />)}</span>
          </div>
        ))}
      </section>
      <button className="reset-button" onClick={resetAll}><X size={18} /> 清空本地进度</button>
    </main>
  );
}

function TopBar({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack: () => void; right?: ReactNode }) {
  return (
    <header className="top-bar">
      <button className="icon-button" onClick={onBack} aria-label="返回"><ArrowLeft size={22} /></button>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right || <span className="top-spacer" />}
    </header>
  );
}

function PixelBackdrop() {
  return (
    <div className="pixel-backdrop" aria-hidden="true">
      <div className="pixel-sky" />
      <div className="pixel-cloud one" />
      <div className="pixel-cloud two" />
      <div className="pixel-ground" />
    </div>
  );
}

function ArcadeGame({ lesson, question, streak, progress, disabled, onChoose }: { lesson: Lesson; question: Question; streak: number; progress: number; disabled: boolean; onChoose: (answer: number | string) => void }) {
  const [snakeCell, setSnakeCell] = useState(0);
  const [snakeDirection, setSnakeDirection] = useState(1);
  const [boatPower, setBoatPower] = useState(0);
  const options = question.options;
  const pair = question.visual.comparePair || [question.visual.a || 0, question.visual.b || 0];

  useEffect(() => {
    setSnakeCell(0);
    setSnakeDirection(1);
    setBoatPower(0);
  }, [question.prompt]);

  useEffect(() => {
    if (lesson.playMode !== 'numberSnake' || disabled) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') setSnakeDirection(1);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') setSnakeDirection(-1);
      if (event.key === 'Enter') onChoose(options[snakeCell % options.length]);
    };
    window.addEventListener('keydown', onKey);
    const timer = window.setInterval(() => {
      setSnakeCell(cell => (cell + snakeDirection + options.length) % options.length);
    }, Math.max(420, 760 - streak * 55));
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearInterval(timer);
    };
  }, [lesson.playMode, disabled, snakeDirection, snakeCell, options, streak, onChoose]);

  if (lesson.playMode === 'numberSnake') {
    return <NumberSnakeCanvas question={question} disabled={disabled} onChoose={onChoose} />;
  }

  if (lesson.playMode === 'fruitSlice') {
    return <FruitSliceCanvas question={question} disabled={disabled} onChoose={onChoose} />;
  }

  if (lesson.playMode === 'moleWhack') {
    return <MoleWhackCanvas question={question} disabled={disabled} onChoose={onChoose} />;
  }

  if (lesson.playMode === 'seesawCompare') {
    return <SeesawGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} />;
  }

  if (lesson.playMode === 'dragonBoat') {
    const step = Math.min(5, Math.floor(progress / 20) + boatPower);
    return (
      <div className="arcade-game live-boat-game">
        <div className="arcade-tip">先算出答案，再敲对应鼓点推动龙舟</div>
        <div className="river-lane"><div className="finish-flag">终</div><div className={'dragon-boat boat-step-' + step}><b>龙</b><i /><i /><i /></div></div>
        <div className="boat-paddles">{options.map(option => <button key={String(option)} disabled={disabled} onClick={() => { setBoatPower(2); onChoose(option); }}>{option}</button>)}</div>
      </div>
    );
  }

  if (lesson.playMode === 'towerDefense') {
    return (
      <div className="arcade-game live-tower-game">
        <div className="arcade-tip">把正确数字放成炮塔，挡住怪物路线</div>
        <div className="tower-road"><span /><span /><span /><span /></div>
        <div className="tower-slots">{options.map((option, index) => <button key={String(option)} disabled={disabled} className={'tower-build build-' + index} onClick={() => onChoose(option)}>{option}</button>)}</div>
      </div>
    );
  }

  if (lesson.playMode === 'runnerDash' || lesson.playMode === 'lavaHop') {
    return (
      <div className={'arcade-game live-runner-game ' + (lesson.playMode === 'lavaHop' ? 'lava' : '')}>
        <div className="arcade-tip">选择正确平台，勇者才会跳过去</div>
        <i className={'runner-avatar speed-' + Math.min(5, streak)} />
        {options.map((option, index) => <button key={String(option)} disabled={disabled} className={'run-platform platform-' + index} onClick={() => onChoose(option)}>{option}</button>)}
      </div>
    );
  }

  if (lesson.playMode === 'duelBattle') {
    return (
      <div className="arcade-game live-duel-game">
        <div className="arcade-tip">选择招式，答对马上攻击，连击越高攻击越远</div>
        <div className="duel-avatar hero">勇</div><div className={'live-attack-wave speed-' + Math.min(5, streak)} /><div className="duel-avatar enemy">怪</div>
        <div className="duel-skills">{options.map(option => <button key={String(option)} disabled={disabled} onClick={() => onChoose(option)}>{option}</button>)}</div>
      </div>
    );
  }

  if (lesson.playMode === 'bottleDrop') {
    return <ShellCatchGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} />;
  }

  if (lesson.playMode === 'bookGroup') {
    return <BookshelfSortGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} />;
  }

  if (lesson.playMode === 'potionMix') {
    return <PotionLabGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} />;
  }

  if (lesson.playMode === 'muralPuzzle') {
    return <MuralPuzzleGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} progress={progress} />;
  }

  if (lesson.playMode === 'gateGuard') {
    return <GateGuardGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} />;
  }

  if (lesson.playMode === 'lavaHop') {
    return <LavaJumpGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} />;
  }

  if (lesson.playMode === 'bossRush') {
    return <BossBattleGame question={question} disabled={disabled} onChoose={onChoose} streak={streak} progress={progress} bossName={lesson.enemy} />;
  }

  return <ModeStage lesson={lesson} question={question} streak={streak} progress={progress} />;
}

function PocketMonsterBattle({ question, disabled, onChoose }: { question: Question; disabled: boolean; onChoose: (answer: number | string) => void }) {
  const [heroHp, setHeroHp] = useState(30);
  const [monsterHp, setMonsterHp] = useState(30);
  const [combo, setCombo] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [message, setMessage] = useState('算术兽出现了！选择“战斗”开始心算对决！');
  const [effect, setEffect] = useState<'hero-hit' | 'monster-hit' | 'hero-attack' | 'monster-attack' | ''>('');
  const [locked, setLocked] = useState(false);
  const heroSprite = `${uiAsset}/Main Characters/Virtual Guy/Idle (32x32).png`;
  const heroRunSprite = `${uiAsset}/Main Characters/Virtual Guy/Run (32x32).png`;
  const monsterSprite = publicAsset('assets/PixelSRPG-Forge-main/Characters_角色人物/monster/AngryPig/Idle (36x30).png');
  const monsterHitSprite = publicAsset('assets/PixelSRPG-Forge-main/Characters_角色人物/monster/AngryPig/Hit 1 (36x30).png');

  useEffect(() => {
    setShowQuiz(false);
    setLocked(false);
    setEffect('');
    setMessage('算术兽盯着你。选择“战斗”发动数学攻击！');
  }, [question.prompt]);

  const choose = (option: number | string) => {
    if (disabled || locked) return;
    const correct = option === question.answer;
    setLocked(true);
    setShowQuiz(false);
    if (correct) {
      const damage = Math.min(18, 8 + combo * 2);
      setMonsterHp(value => Math.max(0, value - damage));
      setCombo(value => value + 1);
      setEffect('hero-attack');
      setMessage(`答对了！数学之刃造成 ${damage} 点伤害。`);
      playBattleSound('attack');
      window.setTimeout(() => setEffect('monster-hit'), 170);
      window.setTimeout(() => onChoose(option), 620);
    } else {
      const damage = 10;
      setHeroHp(value => Math.max(0, value - damage));
      setCombo(0);
      setEffect('monster-attack');
      setMessage(`答错了！算术兽反击，勇者受到 ${damage} 点伤害。`);
      playBattleSound('damage');
      window.setTimeout(() => setEffect('hero-hit'), 170);
      window.setTimeout(() => onChoose(option), 720);
    }
  };

  return (
    <div className="pocket-battle-game">
      <div className="pocket-battle-screen">
        <div className="pocket-sky"><i /><i /></div>
        <div className="combatant enemy-side">
          <div className="poke-status enemy-status">
            <strong>算术兽</strong><span>Lv.5</span>
            <div className="poke-hp"><i style={{ width: `${Math.max(8, (monsterHp / 30) * 100)}%` }} /></div>
          </div>
          <img className={'monster-sprite ' + (effect === 'monster-hit' ? 'hit' : '')} src={effect === 'monster-hit' ? monsterHitSprite : monsterSprite} alt="算术兽" />
        </div>
        <div className="combatant hero-side">
          <img className={'battle-hero-sprite ' + (effect === 'hero-hit' ? 'hit' : effect === 'hero-attack' ? 'attack' : '')} src={effect === 'hero-attack' ? heroRunSprite : heroSprite} alt="小小勇者" />
          <div className="poke-status hero-status">
            <strong>小小勇者</strong><span>Lv.5</span>
            <div className="poke-hp"><i style={{ width: `${Math.max(8, (heroHp / 30) * 100)}%` }} /></div>
          </div>
        </div>
        {effect === 'hero-attack' && <div className="slash-fx hero-slash" />}
        {effect === 'monster-attack' && <div className="slash-fx monster-slash" />}
      </div>

      <div className="pocket-action-panel">
        <div className="pocket-message">{message}</div>
        {!showQuiz ? (
          <div className="pocket-commands">
            <button disabled={disabled || locked} onClick={() => { setShowQuiz(true); setMessage('心算挑战！选出正确答案发动攻击。'); playUISound('click'); }}>战斗</button>
            <button disabled={disabled || locked} onClick={() => { setMessage('背包里有勇气糖，但这回要靠心算取胜。'); playUISound('click'); }}>背包</button>
            <button disabled={disabled || locked} onClick={() => { setMessage(combo >= 2 ? '连击已充能：下一次答对伤害更高。' : '技能需要连续答对来充能。'); playUISound('click'); }}>技能</button>
            <button disabled={disabled || locked} onClick={() => { setMessage('勇者不能逃跑，算术兽挡住了路。'); playUISound('error'); }}>逃跑</button>
          </div>
        ) : (
          <div className="pocket-quiz-panel">
            <div className="pocket-question">{question.prompt.replace(' = ?', '')}</div>
            <div className="pocket-options">
              {question.options.map(option => <button key={String(option)} disabled={disabled || locked} onClick={() => choose(option)}>{option}</button>)}
            </div>
          </div>
        )}
        <div className="pocket-stats"><span>勇者 HP {heroHp}</span><span>算术兽 HP {monsterHp}</span><span>连击 {combo}</span></div>
      </div>
    </div>
  );
}

type MoleItem = {
  active: boolean;
  x: number;
  y: number;
  expression: string;
  result: number;
  isBomb: boolean;
  life: number;
};

type HitEffect = { active: boolean; x: number; y: number; timer: number; color: string; text: string };

function MoleWhackCanvas({ question, disabled, onChoose }: { question: Question; disabled: boolean; onChoose: (answer: number | string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const spawnRef = useRef<number | null>(null);
  const stateRef = useRef({
    score: 0,
    lives: 3,
    target: Number(question.answer) || 42,
    moles: [] as MoleItem[],
    holes: [] as { x: number; y: number }[],
    hit: { active: false, x: 0, y: 0, timer: 0, color: '#f9bc5c', text: '' } as HitEffect,
    resolved: false,
    correctHits: 0,
  });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;
    const W = 750;
    const H = 550;
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const wrongAnswer = () => question.options.find(option => option !== question.answer) ?? '__wrong__';
    const makeExpression = (target: number | null) => {
      if (target !== null) {
        if (target > 12 && Math.random() > 0.45) {
          const a = random(5, Math.max(6, target - 2));
          return { expression: `${a}+${target - a}`, result: target };
        }
        const minuend = random(target + 5, Math.min(99, target + 40));
        return { expression: `${minuend}-${minuend - target}`, result: target };
      }
      let result = stateRef.current.target;
      while (result === stateRef.current.target) result = random(12, 95);
      if (result > 12 && Math.random() > 0.5) {
        const a = random(5, Math.max(6, result - 2));
        return { expression: `${a}+${result - a}`, result };
      }
      const minuend = random(result + 5, Math.min(99, result + 38));
      return { expression: `${minuend}-${minuend - result}`, result };
    };
    const nextTarget = () => {
      const candidates = question.options.filter(option => typeof option === 'number' && option !== stateRef.current.target) as number[];
      if (candidates.length && Math.random() > 0.25) return candidates[random(0, candidates.length - 1)];
      let target = stateRef.current.target;
      while (target === stateRef.current.target) target = random(20, 95);
      return target;
    };
    const init = () => {
      const holes = [];
      const marginX = 80;
      const marginY = 86;
      const stepX = (W - marginX * 2) / 2;
      const stepY = (H - marginY * 2) / 2;
      for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) holes.push({ x: marginX + col * stepX, y: marginY + row * stepY });
      stateRef.current = {
        score: 0,
        lives: 3,
        target: Number(question.answer) || 42,
        holes,
        moles: holes.map(hole => ({ active: false, x: hole.x, y: hole.y, expression: '', result: 0, isBomb: false, life: 0 })),
        hit: { active: false, x: 0, y: 0, timer: 0, color: '#f9bc5c', text: '' },
        resolved: false,
        correctHits: 0,
      };
      forceRender(v => v + 1);
    };
    const spawnMole = (forceCorrect = false) => {
      if (disabled || stateRef.current.resolved) return;
      const free = stateRef.current.moles.map((mole, index) => mole.active ? -1 : index).filter(index => index >= 0);
      if (!free.length) return;
      const index = free[random(0, free.length - 1)];
      const mole = stateRef.current.moles[index];
      const isBomb = !forceCorrect && Math.random() < 0.14;
      if (isBomb) {
        Object.assign(mole, { active: true, isBomb: true, expression: '!', result: 0, life: 1700 });
      } else {
        const formula = makeExpression(forceCorrect || Math.random() < 0.42 ? stateRef.current.target : null);
        Object.assign(mole, { active: true, isBomb: false, expression: formula.expression, result: formula.result, life: 1750 });
      }
    };
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();
    };
    const setHit = (x: number, y: number, color: string, text: string) => {
      stateRef.current.hit = { active: true, x, y, timer: 14, color, text };
    };
    const finishWrong = () => {
      if (stateRef.current.resolved) return;
      stateRef.current.resolved = true;
      onChoose(wrongAnswer());
    };
    const finishCorrect = () => {
      if (stateRef.current.resolved) return;
      stateRef.current.resolved = true;
      onChoose(question.answer);
    };
    const whackAt = (x: number, y: number) => {
      if (disabled || stateRef.current.resolved) return;
      const index = stateRef.current.holes.findIndex(hole => Math.hypot(x - hole.x, y - hole.y) < 52);
      if (index < 0) return;
      const mole = stateRef.current.moles[index];
      if (!mole.active) {
        stateRef.current.score = Math.max(0, stateRef.current.score - 2);
        setHit(x, y, '#b9692e', '-2');
        playUISound('error');
        return;
      }
      mole.active = false;
      if (mole.isBomb) {
        stateRef.current.lives -= 1;
        stateRef.current.score = Math.max(0, stateRef.current.score - 12);
        setHit(x, y, '#cc4444', '炸弹');
        playBattleSound('damage');
        if (stateRef.current.lives <= 0) finishWrong();
      } else if (mole.result === stateRef.current.target) {
        stateRef.current.score += 12;
        stateRef.current.correctHits += 1;
        setHit(x, y, '#479f3a', '+12');
        playBattleSound('attack');
        stateRef.current.target = nextTarget();
        stateRef.current.moles.forEach(item => { item.active = false; });
        spawnMole(true);
        if (stateRef.current.correctHits >= 1) finishCorrect();
      } else {
        stateRef.current.lives -= 1;
        stateRef.current.score = Math.max(0, stateRef.current.score - 8);
        setHit(x, y, '#cc5a2a', `目标${stateRef.current.target}`);
        playUISound('error');
        if (stateRef.current.lives <= 0) finishWrong();
      }
      forceRender(v => v + 1);
    };
    const getPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H };
    };
    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      const point = getPoint(event);
      whackAt(point.x, point.y);
    };
    const draw = () => {
      const state = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#d9b56a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#a7773a';
      ctx.fillRect(0, H - 48, W, 48);
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = '#5e8c3a';
        ctx.beginPath();
        ctx.moveTo(30 + i * 65, H - 42);
        ctx.lineTo(20 + i * 65, H - 68);
        ctx.lineTo(40 + i * 65, H - 68);
        ctx.fill();
      }
      ctx.fillStyle = '#fffac4';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`目标 ${state.target}`, 28, 44);
      state.holes.forEach(hole => {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y + 5, 46, 0, Math.PI * 2);
        ctx.fillStyle = '#5e3e1f';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hole.x, hole.y - 2, 39, 0, Math.PI * 2);
        ctx.fillStyle = '#2f200e';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hole.x - 10, hole.y - 12, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffecb3';
        ctx.fill();
      });
      state.moles.forEach(mole => {
        if (!mole.active) return;
        const x = mole.x;
        const y = mole.y - 12;
        ctx.fillStyle = mole.isBomb ? '#4e3a2a' : '#b78144';
        ctx.beginPath();
        ctx.ellipse(x, y - 5, 30, 34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = mole.isBomb ? '#2b2b2b' : '#e0a15c';
        ctx.beginPath();
        ctx.ellipse(x, y - 10, 24, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 12, y - 18, 7, 0, Math.PI * 2);
        ctx.arc(x + 12, y - 18, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2a0e';
        ctx.beginPath();
        ctx.arc(x - 10, y - 19, 3, 0, Math.PI * 2);
        ctx.arc(x + 14, y - 19, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = mole.isBomb ? '#ff5e5e' : '#2d2b0f';
        ctx.textAlign = 'center';
        ctx.font = mole.isBomb ? 'bold 30px sans-serif' : `bold ${mole.expression.length > 6 ? 18 : 22}px monospace`;
        ctx.fillText(mole.isBomb ? '!' : mole.expression, x, y - 31);
        ctx.fillStyle = '#c97e3a';
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      const hit = state.hit;
      if (hit.active) {
        ctx.save();
        ctx.shadowBlur = 9;
        ctx.shadowColor = hit.color;
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, 24, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe0a3';
        ctx.fill();
        ctx.fillStyle = hit.color;
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hit.text, hit.x, hit.y + 8);
        ctx.restore();
      }
    };
    const loop = (now: number) => {
      const state = stateRef.current;
      state.moles.forEach(mole => {
        if (!mole.active) return;
        mole.life -= 16;
        if (mole.life <= 0) mole.active = false;
      });
      if (state.hit.active) {
        state.hit.timer -= 1;
        if (state.hit.timer <= 0) state.hit.active = false;
      }
      draw();
      frameRef.current = window.requestAnimationFrame(loop);
    };
    init();
    spawnMole(true);
    spawnRef.current = window.setInterval(() => spawnMole(false), 850);
    canvas.addEventListener('pointerdown', onPointerDown);
    frameRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (spawnRef.current) window.clearInterval(spawnRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [question.prompt, question.answer, disabled, onChoose]);

  const state = stateRef.current;
  return (
    <div className="arcade-game mole-canvas-game">
      <div className="mole-hud">
        <span>得分 <strong>{state.score}</strong></span>
        <span>目标 <strong>{state.target}</strong></span>
        <span>生命 <strong>{state.lives}</strong></span>
      </div>
      <canvas ref={canvasRef} width={750} height={550} aria-label="算术打地鼠" />
      <div className="mole-rule">只敲结果等于目标的地鼠。每敲对一次，目标数字会马上换。</div>
    </div>
  );
}

type SnakeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type SnakeCellPoint = { x: number; y: number };
type SnakeFood = { x: number; y: number; expression: string; result: number };

function NumberSnakeCanvas({ question, disabled, onChoose }: { question: Question; disabled: boolean; onChoose: (answer: number | string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stateRef = useRef({
    snake: [] as SnakeCellPoint[],
    direction: 'RIGHT' as SnakeDirection,
    nextDirection: 'RIGHT' as SnakeDirection,
    foods: [] as SnakeFood[],
    target: 0,
    score: 0,
    lives: 2,
    resolved: false,
    touchStart: null as SnakeCellPoint | null,
    flash: '',
  });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;
    const GRID = 20;
    const CELL = canvas.width / GRID;
    const FOOD_COUNT = 4;
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const same = (a: SnakeCellPoint, b: SnakeCellPoint) => a.x === b.x && a.y === b.y;
    const wrongAnswer = () => question.options.find(option => option !== question.answer) ?? '__wrong__';

    const makeExpression = (result?: number) => {
      const value = result ?? random(12, 92);
      if (value > 12 && Math.random() > 0.45) {
        const a = random(5, Math.max(6, value - 2));
        return { expression: `${a}+${value - a}`, result: value };
      }
      const minuend = random(value + 5, Math.min(99, value + 36));
      return { expression: `${minuend}-${minuend - value}`, result: value };
    };
    const occupiedKey = (point: SnakeCellPoint) => `${point.x},${point.y}`;
    const emptyCells = () => {
      const occupied = new Set<string>();
      stateRef.current.snake.forEach(point => occupied.add(occupiedKey(point)));
      stateRef.current.foods.forEach(point => occupied.add(occupiedKey(point)));
      const cells: SnakeCellPoint[] = [];
      for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) if (!occupied.has(`${x},${y}`)) cells.push({ x, y });
      return cells;
    };
    const updateTarget = () => {
      const foods = stateRef.current.foods;
      stateRef.current.target = foods.length ? Math.min(...foods.map(food => food.result)) : 0;
    };
    const addFood = (forcedResult?: number) => {
      const cells = emptyCells();
      if (!cells.length) return;
      const pos = cells[random(0, cells.length - 1)];
      const formula = makeExpression(forcedResult);
      stateRef.current.foods.push({ ...pos, ...formula });
      updateTarget();
    };
    const init = () => {
      stateRef.current = {
        snake: [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        foods: [],
        target: 0,
        score: 0,
        lives: 2,
        resolved: false,
        touchStart: null,
        flash: '',
      };
      addFood(Number(question.answer) || undefined);
      while (stateRef.current.foods.length < FOOD_COUNT) {
        let result = random(12, 92);
        while (result === stateRef.current.foods[0]?.result) result = random(12, 92);
        addFood(result);
      }
      updateTarget();
      forceRender(v => v + 1);
    };
    const finishWrong = (msg: string) => {
      if (stateRef.current.resolved) return;
      stateRef.current.flash = msg;
      stateRef.current.resolved = true;
      playBattleSound('damage');
      onChoose(wrongAnswer());
    };
    const finishCorrect = () => {
      if (stateRef.current.resolved) return;
      stateRef.current.resolved = true;
      playFeedbackSound('coin');
      onChoose(question.answer);
    };
    const handleDirection = (direction: SnakeDirection) => {
      const opposite: Record<SnakeDirection, SnakeDirection> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      if (opposite[direction] !== stateRef.current.direction) stateRef.current.nextDirection = direction;
    };
    const tick = () => {
      const state = stateRef.current;
      if (disabled || state.resolved) return;
      state.direction = state.nextDirection;
      const head = { ...state.snake[0] };
      if (state.direction === 'RIGHT') head.x += 1;
      if (state.direction === 'LEFT') head.x -= 1;
      if (state.direction === 'UP') head.y -= 1;
      if (state.direction === 'DOWN') head.y += 1;
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        finishWrong('撞到边界了');
        draw();
        return;
      }
      if (state.snake.some(part => same(part, head))) {
        finishWrong('撞到自己了');
        draw();
        return;
      }
      const foodIndex = state.foods.findIndex(food => same(food, head));
      if (foodIndex >= 0) {
        const food = state.foods[foodIndex];
        if (food.result !== state.target) {
          state.lives -= 1;
          state.flash = `应先吃 ${state.target}`;
          state.foods.splice(foodIndex, 1);
          addFood();
          state.snake.unshift(head);
          state.snake.pop();
          if (state.lives <= 0) finishWrong('吃错顺序');
        } else {
          state.score += 10;
          state.snake.unshift(head);
          state.foods.splice(foodIndex, 1);
          finishCorrect();
        }
      } else {
        state.snake.unshift(head);
        state.snake.pop();
      }
      updateTarget();
      draw();
      forceRender(v => v + 1);
    };
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();
    };
    const draw = () => {
      const state = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2a4820';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#6f9e4f';
      ctx.lineWidth = 1;
      for (let index = 0; index <= GRID; index++) {
        ctx.beginPath();
        ctx.moveTo(index * CELL, 0);
        ctx.lineTo(index * CELL, canvas.height);
        ctx.moveTo(0, index * CELL);
        ctx.lineTo(canvas.width, index * CELL);
        ctx.stroke();
      }
      state.foods.forEach(food => {
        const x = food.x * CELL;
        const y = food.y * CELL;
        const isTarget = food.result === state.target;
        ctx.save();
        ctx.shadowBlur = isTarget ? 9 : 2;
        ctx.shadowColor = isTarget ? '#ffd966' : 'rgba(0,0,0,.32)';
        ctx.fillStyle = '#f5bc70';
        drawRoundRect(x + 2, y + 2, CELL - 4, CELL - 4, 8);
        ctx.fillStyle = '#fff1b5';
        drawRoundRect(x + 4, y + 4, CELL - 8, CELL - 8, 6);
        ctx.fillStyle = '#3d2a10';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.floor(CELL * 0.34)}px monospace`;
        ctx.fillText(food.expression, x + CELL / 2, y + CELL / 2 - 2);
        ctx.fillStyle = '#996633';
        ctx.font = `${Math.floor(CELL * 0.25)}px monospace`;
        ctx.fillText('?', x + CELL / 2, y + CELL / 2 + 12);
        ctx.restore();
      });
      state.snake.forEach((part, index) => {
        const x = part.x * CELL;
        const y = part.y * CELL;
        const grad = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
        grad.addColorStop(0, index === 0 ? '#7cb518' : '#5f9e2e');
        grad.addColorStop(1, index === 0 ? '#4c8b2b' : '#3f7522');
        ctx.fillStyle = grad;
        drawRoundRect(x + 2, y + 2, CELL - 4, CELL - 4, 8);
        if (index === 0) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x + CELL - 8, y + 8, 4, 0, Math.PI * 2);
          ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1f2f0c';
          ctx.beginPath();
          ctx.arc(x + CELL - 8, y + 7, 2, 0, Math.PI * 2);
          ctx.arc(x + 8, y + 7, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.fillStyle = '#fff9cf';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`目标 ${state.target || '-'}`, 18, 40);
      if (state.flash) {
        ctx.fillStyle = '#ff6b4a';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(state.flash, canvas.width / 2, canvas.height - 28);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') handleDirection('UP');
      if (event.key === 'ArrowDown') handleDirection('DOWN');
      if (event.key === 'ArrowLeft') handleDirection('LEFT');
      if (event.key === 'ArrowRight') handleDirection('RIGHT');
      if (event.key.startsWith('Arrow')) event.preventDefault();
    };
    const getPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onPointerDown = (event: PointerEvent) => {
      stateRef.current.touchStart = getPoint(event);
    };
    const onPointerMove = (event: PointerEvent) => {
      const start = stateRef.current.touchStart;
      if (!start) return;
      const point = getPoint(event);
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) handleDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      else handleDirection(dy > 0 ? 'DOWN' : 'UP');
      stateRef.current.touchStart = null;
    };

    init();
    draw();
    window.addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    intervalRef.current = window.setInterval(tick, 220);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
    };
  }, [question.prompt, question.answer, disabled, onChoose]);

  const state = stateRef.current;
  return (
    <div className="arcade-game snake-canvas-game">
      <div className="snake-hud">
        <span>得分 <strong>{state.score}</strong></span>
        <span>生命 <strong>{state.lives}</strong></span>
        <span>先吃 <strong>{state.target || '-'}</strong></span>
      </div>
      <canvas ref={canvasRef} width={600} height={600} aria-label="数字贪吃蛇算术顺序挑战" />
      <div className="snake-rule">方向键或滑动控制。每个食物是算式，必须按结果从小到大吃。</div>
    </div>
  );
}

type SliceItem = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'fruit' | 'bomb';
  expression?: string;
  result?: number;
};

type SliceParticle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type SwipePoint = { x: number; y: number };

function FruitSliceCanvas({ question, disabled, onChoose }: { question: Question; disabled: boolean; onChoose: (answer: number | string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const stateRef = useRef({
    items: [] as SliceItem[],
    particles: [] as SliceParticle[],
    swipe: [] as SwipePoint[],
    dragging: false,
    frame: 0,
    resolved: false,
  });
  const target = Number(question.answer) || 42;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;
    const W = 1000;
    const H = 550;
    stateRef.current = { items: [], particles: [], swipe: [], dragging: false, frame: 0, resolved: false };

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const makeTargetExpression = () => {
      if (target > 12 && Math.random() > 0.45) {
        const a = random(5, Math.max(6, target - 2));
        return { expression: `${a}+${target - a}`, result: target };
      }
      const minuend = random(target + 5, Math.min(99, target + 38));
      return { expression: `${minuend}-${minuend - target}`, result: target };
    };
    const makeWrongExpression = () => {
      let result = target;
      while (result === target) result = clamp(target + random(-15, 15), 5, 99);
      if (result > 12 && Math.random() > 0.5) {
        const a = random(3, Math.max(4, result - 2));
        return { expression: `${a}+${result - a}`, result };
      }
      const minuend = random(result + 4, Math.min(99, result + 30));
      return { expression: `${minuend}-${minuend - result}`, result };
    };
    const addParticles = (x: number, y: number, color: string) => {
      for (let index = 0; index < 16; index++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 1,
          color,
          size: random(4, 10),
        });
      }
    };
    const spawnItem = () => {
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const correct = Math.random() < 0.38;
      const x = side === 'left' ? -40 : W + 40;
      const y = random(H - 72, H - 28);
      const vx = side === 'left' ? random(2, 4) : random(-4, -2);
      const vy = random(-15, -10);
      if (Math.random() < 0.12) {
        stateRef.current.items.push({ x, y, vx, vy, radius: 34, type: 'bomb' });
        return;
      }
      const formula = correct ? makeTargetExpression() : makeWrongExpression();
      stateRef.current.items.push({ x, y, vx, vy, radius: 42, type: 'fruit', ...formula });
    };
    const getCanvasPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * W,
        y: ((event.clientY - rect.top) / rect.height) * H,
      };
    };
    const resolveWrong = () => {
      if (stateRef.current.resolved) return;
      stateRef.current.resolved = true;
      const wrong = question.options.find(option => option !== question.answer) ?? '__wrong__';
      onChoose(wrong);
    };
    const sliceAt = (x: number, y: number) => {
      if (disabled || stateRef.current.resolved) return;
      const items = stateRef.current.items;
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const dx = x - item.x;
        const dy = y - item.y;
        if (Math.sqrt(dx * dx + dy * dy) > item.radius) continue;
        items.splice(index, 1);
        if (item.type === 'bomb') {
          addParticles(item.x, item.y, '#3b1b16');
          playBattleSound('damage');
          resolveWrong();
          return;
        }
        if (item.result === target) {
          addParticles(item.x, item.y, '#f9b83a');
          playFeedbackSound('coin');
          stateRef.current.resolved = true;
          onChoose(question.answer);
          return;
        }
        addParticles(item.x, item.y, '#ba5a3a');
        playUISound('error');
        resolveWrong();
        return;
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      stateRef.current.dragging = true;
      const point = getCanvasPoint(event);
      stateRef.current.swipe = [point];
      sliceAt(point.x, point.y);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      event.preventDefault();
      const point = getCanvasPoint(event);
      stateRef.current.swipe.push(point);
      if (stateRef.current.swipe.length > 14) stateRef.current.swipe.shift();
      sliceAt(point.x, point.y);
    };
    const onPointerUp = (event: PointerEvent) => {
      stateRef.current.dragging = false;
      stateRef.current.swipe = [];
      canvas.releasePointerCapture?.(event.pointerId);
    };
    const drawBackground = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#c5e9a3');
      grad.addColorStop(1, '#7cb342');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff9e8';
      [[140, 70, 58], [205, 62, 68], [805, 92, 62], [875, 76, 72]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.68, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#3b6e2b';
      for (let index = 0; index < 12; index++) {
        ctx.beginPath();
        ctx.moveTo(45 + index * 86, H - 34);
        ctx.lineTo(27 + index * 86, H - 68);
        ctx.lineTo(66 + index * 86, H - 68);
        ctx.fill();
      }
    };
    const drawItem = (item: SliceItem) => {
      ctx.save();
      ctx.shadowBlur = 3;
      ctx.shadowColor = 'rgba(0,0,0,0.32)';
      if (item.type === 'bomb') {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#2d2d2d';
        ctx.fill();
        ctx.fillStyle = '#ffef8a';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', item.x, item.y + 1);
      } else {
        const grd = ctx.createRadialGradient(item.x - 10, item.y - 12, 6, item.x, item.y, item.radius);
        grd.addColorStop(0, '#ffe28a');
        grd.addColorStop(1, '#ffaa3c');
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.fillStyle = '#4a2a10';
        ctx.font = 'bold 25px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.expression || '', item.x, item.y + 1);
        ctx.beginPath();
        ctx.arc(item.x - 13, item.y - 14, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffc0';
        ctx.fill();
      }
      ctx.restore();
    };
    const drawSwipe = () => {
      const swipe = stateRef.current.swipe;
      if (swipe.length < 2) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffcc44';
      ctx.beginPath();
      ctx.moveTo(swipe[0].x, swipe[0].y);
      swipe.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#fff2a0';
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffaa33';
      ctx.stroke();
      ctx.restore();
    };
    const loop = () => {
      const state = stateRef.current;
      state.frame++;
      if (!disabled && !state.resolved && state.frame % 38 === 0 && state.items.length < 15) spawnItem();
      if (state.frame === 4) { spawnItem(); spawnItem(); spawnItem(); }
      state.items.forEach(item => {
        item.x += item.vx;
        item.y += item.vy;
        item.vy += 0.28;
      });
      state.items = state.items.filter(item => item.x > -180 && item.x < W + 180 && item.y < H + 190);
      state.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.025;
      });
      state.particles = state.particles.filter(particle => particle.life > 0);
      drawBackground();
      state.items.forEach(drawItem);
      state.particles.forEach(particle => {
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      drawSwipe();
      ctx.fillStyle = '#fff4cf';
      ctx.font = 'bold 24px monospace';
      ctx.shadowColor = '#31551f';
      ctx.shadowBlur = 3;
      ctx.fillText(`只切结果 = ${target} 的椰果`, 34, 46);
      frameRef.current = window.requestAnimationFrame(loop);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [question.prompt, question.answer, disabled, onChoose, target]);

  return (
    <div className="arcade-game fruit-canvas-game">
      <div className="fruit-hud"><span>目标</span><strong>{target}</strong><em>划过正确算式</em></div>
      <canvas ref={canvasRef} width={1000} height={550} aria-label="切水果算术挑战" />
    </div>
  );
}

function ModeStage({ lesson, question, streak, progress }: { lesson: Lesson; question: Question; streak: number; progress: number }) {
  const options = question.options;
  const pair = question.visual.comparePair || [question.visual.a || 0, question.visual.b || 0];
  const speedClass = 'speed-' + Math.min(5, streak);

  if (lesson.playMode === 'numberSnake') {
    return (
      <div className="mini-stage snake-stage" aria-hidden="true">
        <div className={'snake-body ' + speedClass}>{[0, 1, 2, 3, 4].map(part => <i key={part} />)}</div>
        {options.map((option, index) => <span key={String(option)} className={'snake-food food-' + index}>{option}</span>)}
      </div>
    );
  }

  if (lesson.playMode === 'fruitSlice') {
    return (
      <div className="mini-stage fruit-stage" aria-hidden="true">
        {options.map((option, index) => <span key={String(option)} className={'fruit fruit-' + index}>{option}</span>)}
        <i className="slice-line" />
      </div>
    );
  }

  if (lesson.playMode === 'moleWhack') {
    return (
      <div className="mini-stage mole-stage" aria-hidden="true">
        {options.map((option, index) => <span key={String(option)} className={'mole-hole hole-' + index}><b>{option}</b></span>)}
        <i className="pixel-hammer" />
      </div>
    );
  }

  if (lesson.playMode === 'seesawCompare') {
    const leftHeavy = Number(pair[0]) > Number(pair[1]);
    return (
      <div className="mini-stage seesaw-stage" aria-hidden="true">
        <div className={'seesaw-board ' + (leftHeavy ? 'left-heavy' : 'right-heavy')}>
          <span>{pair[0]}</span>
          <span>{pair[1]}</span>
        </div>
        <i />
      </div>
    );
  }

  if (lesson.playMode === 'dragonBoat') {
    const boatStep = Math.min(5, Math.floor(progress / 20) + Math.min(2, streak));
    return (
      <div className="mini-stage boat-stage" aria-hidden="true">
        <div className="finish-flag">终</div>
        <div className={'dragon-boat boat-step-' + boatStep}><b>龙</b><i /><i /><i /></div>
      </div>
    );
  }

  if (lesson.playMode === 'towerDefense') {
    return (
      <div className="mini-stage tower-stage" aria-hidden="true">
        <div className="tower-line">{[0, 1, 2].map(tower => <i key={tower} className={tower < Math.min(3, streak) ? 'built' : ''} />)}</div>
        <div className="invader-line">{[0, 1, 2, 3].map(enemy => <b key={enemy} />)}</div>
      </div>
    );
  }

  if (lesson.playMode === 'runnerDash' || lesson.playMode === 'lavaHop') {
    return (
      <div className={'mini-stage runner-stage ' + (lesson.playMode === 'lavaHop' ? 'lava-runner' : '')} aria-hidden="true">
        {[0, 1, 2, 3].map(step => <span key={step} className={step === 1 ? 'target-step' : ''}>{options[step]}</span>)}
        <i className={'runner-hero ' + speedClass} />
      </div>
    );
  }

  if (lesson.playMode === 'duelBattle') {
    return <PocketMonsterBattle question={question} disabled={disabled} onChoose={onChoose} />;
  }

  if (lesson.playMode === 'monsterBattle' || lesson.playMode === 'bossRush') {
    return (
      <div className="mini-stage duel-stage" aria-hidden="true">
        <div className="duel-hero"><i /></div>
        <div className={'attack-wave ' + speedClass} />
        <div className="duel-enemy"><b>{lesson.nodeType === 'Boss' ? 'Boss' : lesson.enemy.slice(0, 2)}</b></div>
      </div>
    );
  }

  return null;
}
function QuestionVisual({ question }: { question: Question }) {
  if (question.kind === 'placeValue') {
    if (question.visual.mode === 'missing') {
      const missingTens = question.visual.label === '缺十位';
      return (
        <div className="place-value-visual place-value-missing">
          <div className={missingTens ? 'mystery-tile' : ''}><strong>{missingTens ? '?' : question.visual.a}</strong><span>个十</span></div>
          <div className={!missingTens ? 'mystery-tile' : ''}><strong>{!missingTens ? '?' : question.visual.b}</strong><span>个一</span></div>
          <strong className="value-arrow">=</strong>
          <div><strong>{question.visual.total}</strong><span>目标数</span></div>
        </div>
      );
    }

    if (question.visual.mode === 'digit') {
      return (
        <div className="place-value-visual digit-visual">
          <div><strong>{question.visual.a}</strong><span>十位</span></div>
          <div><strong>{question.visual.b}</strong><span>个位</span></div>
          <i>{question.visual.label}</i>
        </div>
      );
    }

    if (question.visual.mode === 'numberLine100') {
      return (
        <div className="number-line number-line-wide">
          {question.visual.values?.map(value => (
            <span key={value} className={value === question.visual.a ? 'start' : value === question.visual.target ? 'target' : ''}>{value}</span>
          ))}
        </div>
      );
    }

    if (question.visual.mode === 'compareClue') {
      return (
        <div className="place-value-visual clue-visual">
          <div><strong>{question.visual.a}</strong><span>个十</span></div>
          <strong className="value-arrow">且</strong>
          <div><strong>&lt; {question.visual.b}</strong><span>比它小</span></div>
        </div>
      );
    }

    if (question.visual.mode === 'nearestTen') {
      return (
        <div className="nearest-ten-visual">
          <span>{question.visual.a}</span>
          <strong>{question.visual.target}</strong>
          <span>{question.visual.b}</span>
        </div>
      );
    }

    if (question.visual.mode === 'swap') {
      return (
        <div className="place-value-visual swap-visual">
          <div><strong>{question.visual.a}</strong><span>十位</span></div>
          <ChevronRight size={42} />
          <div><strong>{question.visual.b}</strong><span>个位</span></div>
          <strong className="value-arrow">交换</strong>
        </div>
      );
    }

    if (question.visual.mode === 'order') {
      return (
        <div className="bottle-order-visual">
          {question.visual.values?.map(value => (
            <div key={value} className={value === question.visual.target ? 'target-bottle' : ''}>
              <span>{value}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="place-value-visual">
        <div><strong>{question.visual.a}</strong><span>个十</span></div>
        <div><strong>{question.visual.b}</strong><span>个一</span></div>
      </div>
    );
  }

  if (question.kind === 'sequence') {
    const start = question.visual.a || 0;
    const step = question.visual.b || 1;
    const target = question.visual.target || start;
    return (
      <div className="sequence-visual">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = start + index * step;
          return <span key={index} className={value === target ? 'mystery' : ''}>{value === target ? '?' : value}</span>;
        })}
      </div>
    );
  }

  if (question.kind === 'count') {
    return <ObjectField count={question.visual.total || 0} />;
  }

  if (question.kind === 'tenFrame' || question.kind === 'makeTen') {
    const filled = question.kind === 'makeTen' ? question.visual.a || 0 : question.visual.total || 0;
    return (
      <div className="ten-frame">
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index} className={index < filled ? 'filled' : ''}>{index < filled && <img src={`${farmAsset}/itemdisc_01.png`} alt="" />}</span>
        ))}
      </div>
    );
  }

  if (question.kind === 'numberLine') {
    const start = question.visual.a || 0;
    const target = question.visual.target || 0;
    return (
      <div className="number-line">
        {Array.from({ length: 11 }).map((_, index) => (
          <span key={index} className={index === start ? 'start' : index === target ? 'target' : ''}>{index}</span>
        ))}
      </div>
    );
  }

  if (question.kind === 'compare') {
    const [a, b] = question.visual.comparePair || [0, 0];
    return <div className="compare-visual"><ObjectStack count={Math.min(a, 10)} label={a} /><strong>?</strong><ObjectStack count={Math.min(b, 10)} label={b} /></div>;
  }

  if (question.kind === 'shape') {
    return <div className={`shape-visual sides-${question.visual.total}`}>{question.visual.shape}</div>;
  }

  if (question.kind === 'clock') {
    const hour = question.visual.hour || 12;
    return (
      <div className="clock-face">
        <span>12</span><span>3</span><span>6</span><span>9</span>
        <i className="minute-hand" />
        <i className="hour-hand" style={{ transform: `rotate(${hour * 30}deg)` }} />
      </div>
    );
  }

  if (question.kind === 'money') {
    return (
      <div className="coin-field">
        {question.visual.coins?.map((coin, index) => <span key={`${coin}-${index}`}>{coin}元</span>)}
      </div>
    );
  }

  if (question.kind === 'multiply') {
    return (
      <div className="multiply-visual">
        {Array.from({ length: question.visual.b || 0 }).map((_, group) => (
          <ObjectStack key={group} count={question.visual.a || 0} label={question.visual.a || 0} />
        ))}
      </div>
    );
  }

  if (['add', 'subtract', 'add2', 'subtract2', 'logic', 'word'].includes(question.kind)) {
    const sign = question.kind === 'subtract' || question.kind === 'subtract2' ? '-' : '+';
    return (
      <div className="number-battle-visual">
        <span>{question.visual.a}</span>
        <strong>{sign}</strong>
        <span>{question.visual.b}</span>
        <strong>=</strong>
        <span className="mystery">?</span>
      </div>
    );
  }

  return <ObjectGroups a={question.visual.a || 0} b={question.visual.b || 0} faded={question.kind === 'subtract'} />;
}

function ObjectField({ count }: { count: number }) {
  const crops = ['carrot_05.png', 'cabbage_05.png', 'wheat_05.png', 'beetroot_05.png'];
  return (
    <div className="object-field">
      {Array.from({ length: count }).map((_, index) => (
        <motion.img
          key={index}
          initial={{ scale: 0, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: index * 0.035 }}
          src={`${farmAsset}/${crops[index % crops.length]}`}
          alt=""
        />
      ))}
    </div>
  );
}

function ObjectGroups({ a, b, faded = false }: { a: number; b: number; faded?: boolean }) {
  return (
    <div className="object-groups">
      <ObjectStack count={a} label={a} />
      <span>{faded ? '-' : '+'}</span>
      <ObjectStack count={b} label={b} faded={faded} />
    </div>
  );
}

function ObjectStack({ count, label, faded = false }: { count: number; label: number; faded?: boolean }) {
  return (
    <div className={`object-stack ${faded ? 'faded' : ''}`}>
      <ObjectField count={count} />
      <b>{label}</b>
    </div>
  );
}
