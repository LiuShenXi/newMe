import type { GrowthTreeDto, TreeFruitDto } from '@newme/shared';

export interface TreeFruit {
  date: string;
  focuses: string[];
  id?: string;
  note: string;
  reflection: string;
  score: number;
  size: number;
  week: string;
  x: number;
  y: number;
}

export interface GrowthTreeViewData {
  fruits: TreeFruit[];
  honorCount: number;
  stage: GrowthTreeDto['stage'];
}

export const treeFruits: TreeFruit[] = [
  {
    date: '2026-03-15',
    focuses: ['完成登录模块前后端', '恢复晨跑节奏', '整理第一版产品笔记'],
    note: '完成登录模块前后端，恢复晨跑节奏。',
    reflection: '虽然节奏有点碎，但核心模块终于往前推了一步。',
    score: 72,
    size: 18,
    week: '第 11 周',
    x: 94,
    y: 226,
  },
  {
    date: '2026-03-22',
    focuses: ['推进原型主流程', '读完两章社会学', '完成三次晨跑'],
    note: '原型推进明显，阅读完成两章。',
    reflection: '原型有了第一口气，阅读也没有断。',
    score: 86,
    size: 24,
    week: '第 12 周',
    x: 145,
    y: 170,
  },
  {
    date: '2026-03-29',
    focuses: ['保留最低推进', '补齐清单结构', '记录一次产品反思'],
    note: '工作较忙，但保留了最低推进。',
    reflection: '工作挤占了时间，但保留了最低行动线。',
    score: 64,
    size: 20,
    week: '第 13 周',
    x: 224,
    y: 214,
  },
  {
    date: '2026-04-05',
    focuses: ['完成清单页基础结构', '调整能量页层级', '确认成长树方向'],
    note: '完成清单页基础结构。',
    reflection: '开始看见这个产品真正的节奏了。',
    score: 79,
    size: 16,
    week: '第 14 周',
    x: 252,
    y: 150,
  },
  {
    date: '2026-04-12',
    focuses: ['跑通冷启动闭环', '生成第一版今日清单', '完成一次周结算'],
    note: '冷启动闭环跑通。',
    reflection: '从目标到行动的路径成立了，还需要更顺手。',
    score: 76,
    size: 14,
    week: '第 15 周',
    x: 122,
    y: 132,
  },
  {
    date: '2026-04-19',
    focuses: ['确认能量球方向', '补充打分前提醒', '准备交互版本'],
    note: '能量球方向确认，准备做交互版本。',
    reflection: '能量反馈比纯任务完成率更贴近真实状态。',
    score: 78,
    size: 22,
    week: '第 16 周',
    x: 176,
    y: 260,
  },
];

const fruitPositions = [
  { x: 94, y: 226 },
  { x: 145, y: 170 },
  { x: 224, y: 214 },
  { x: 252, y: 150 },
  { x: 122, y: 132 },
  { x: 176, y: 260 },
  { x: 205, y: 108 },
  { x: 282, y: 236 },
];

export function toTreeFruit(dto: TreeFruitDto, index: number): TreeFruit {
  const position = fruitPositions[index % fruitPositions.length];
  const createdAt = new Date(dto.createdAt);
  const weekNumber = dto.weekId.includes('-W') ? dto.weekId.split('-W')[1] : dto.weekId;

  return {
    date: Number.isNaN(createdAt.getTime()) ? dto.createdAt.slice(0, 10) : createdAt.toISOString().slice(0, 10),
    focuses: [dto.label],
    id: dto.id,
    note: dto.capsuleSummary,
    reflection: dto.capsuleSummary,
    score: dto.score,
    size: 18 + Math.round(dto.score / 18),
    week: dto.label || `第 ${Number(weekNumber)} 周`,
    x: position.x,
    y: position.y,
  };
}

export function toGrowthTreeViewData(dto: GrowthTreeDto): GrowthTreeViewData {
  return {
    fruits: dto.fruits.map(toTreeFruit),
    honorCount: dto.honors.length,
    stage: dto.stage,
  };
}
