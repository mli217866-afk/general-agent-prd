import type { Session } from './model'

export const seedSessions: Session[] = [
  {
    id: 'workspace-audit',
    title: '梳理项目目录与风险',
    project: 'agent-workbench',
    updatedAt: '刚刚',
    status: 'waiting',
    messages: [
      { id: 'm1', role: 'user', content: '检查这个项目，告诉我上线前还缺什么。', time: '10:24' },
      {
        id: 'm2',
        role: 'assistant',
        content: '我检查了项目结构和发布配置。核心链路完整，但凭据存储和错误回放还需要补齐。现在准备写入一份发布检查清单，需要你的批准。',
        time: '10:25',
      },
    ],
    events: [
      { id: 'e1', tool: 'glob', label: '扫描项目文件', detail: '共发现 42 个文件', status: 'done', duration: '0.5s', risk: 'read' },
      { id: 'e2', tool: 'read', label: '读取关键配置', detail: 'package.json、vite.config.ts', status: 'done', duration: '0.8s', risk: 'read' },
      { id: 'e3', tool: 'write', label: '创建发布检查清单', detail: 'docs/release-checklist.md', status: 'waiting', risk: 'write' },
    ],
  },
  {
    id: 'meeting-notes',
    title: '会议纪要转行动项',
    project: '默认项目',
    updatedAt: '18 分钟前',
    status: 'done',
    messages: [
      { id: 'm3', role: 'user', content: '把今天的产品会整理成行动项。', time: '10:02' },
      { id: 'm4', role: 'assistant', content: '已整理为 6 条行动项，并按负责人和截止日期分组。', time: '10:04' },
    ],
    events: [
      { id: 'e4', tool: 'read', label: '读取会议纪要', detail: 'product-sync.md', status: 'done', duration: '0.3s', risk: 'read' },
      { id: 'e5', tool: 'write', label: '生成行动项', detail: 'actions.md', status: 'done', duration: '0.2s', risk: 'write' },
    ],
  },
  {
    id: 'research',
    title: '竞品能力调研',
    project: 'research',
    updatedAt: '昨天',
    status: 'idle',
    messages: [{ id: 'm5', role: 'user', content: '先规划一下通用 Agent 的竞品调研。', time: '昨天' }],
    events: [],
  },
]
