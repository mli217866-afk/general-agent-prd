export type RunMode = 'craft' | 'plan' | 'ask'
export type SessionStatus = 'idle' | 'running' | 'waiting' | 'done' | 'error'
export type EventStatus = 'done' | 'running' | 'waiting' | 'blocked'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

export interface ToolEvent {
  id: string
  tool: string
  label: string
  detail: string
  status: EventStatus
  duration?: string
  risk?: 'read' | 'write' | 'external'
}

export interface Session {
  id: string
  title: string
  project: string
  updatedAt: string
  status: SessionStatus
  messages: Message[]
  events: ToolEvent[]
}

export interface ModePolicy {
  title: string
  summary: string
  tools: boolean
  writes: 'confirm' | 'blocked'
}

export const MODE_POLICIES: Record<RunMode, ModePolicy> = {
  craft: { title: 'Craft', summary: '可读、可执行，写入前确认', tools: true, writes: 'confirm' },
  plan: { title: 'Plan', summary: '只输出执行计划，不修改文件', tools: true, writes: 'blocked' },
  ask: { title: 'Ask', summary: '纯对话，不调用工具', tools: false, writes: 'blocked' },
}

export function resolveRunMode(mode: RunMode): ModePolicy {
  return MODE_POLICIES[mode]
}

export function createUserMessage(content: string, now = new Date()): Message {
  return {
    id: `user-${now.getTime()}`,
    role: 'user',
    content: content.trim(),
    time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function buildDemoRun(mode: RunMode): { events: ToolEvent[]; response: string; status: SessionStatus } {
  if (mode === 'ask') {
    return {
      events: [],
      response: '我会先给出建议，不读取或修改你的工作区。你可以切换到 Plan 查看执行步骤，或切换到 Craft 让我开始处理。',
      status: 'done',
    }
  }

  if (mode === 'plan') {
    return {
      events: [
        { id: 'scan', tool: 'glob', label: '扫描工作区结构', detail: '找到 18 个候选文件', status: 'done', duration: '0.4s', risk: 'read' },
        { id: 'plan', tool: 'todowrite', label: '生成执行计划', detail: '3 个步骤，0 次写入', status: 'done', duration: '0.1s', risk: 'read' },
      ],
      response: '计划已经整理好：先读取相关文件并识别结构，再生成最小修改方案，最后运行验证。Plan 模式不会写入文件，确认后可切换到 Craft 执行。',
      status: 'done',
    }
  }

  return {
    events: [
      { id: 'scan', tool: 'glob', label: '扫描工作区结构', detail: '找到 18 个候选文件', status: 'done', duration: '0.4s', risk: 'read' },
      { id: 'read', tool: 'read', label: '读取任务上下文', detail: '已读取 README.md 与 src/', status: 'done', duration: '0.7s', risk: 'read' },
      { id: 'write', tool: 'write', label: '写入建议变更', detail: '准备修改 src/agent.config.ts', status: 'waiting', risk: 'write' },
    ],
    response: '我已经完成只读检查。下一步需要写入 1 个文件，请在右侧确认变更。批准前不会修改任何内容。',
    status: 'waiting',
  }
}

export function resolvePermission(events: ToolEvent[], approved: boolean): ToolEvent[] {
  return events.map((event) =>
    event.status === 'waiting'
      ? {
          ...event,
          status: approved ? 'done' : 'blocked',
          detail: approved ? '已批准并完成模拟写入' : '用户拒绝，未执行任何写入',
          duration: approved ? '0.2s' : undefined,
        }
      : event,
  )
}
