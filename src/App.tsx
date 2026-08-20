import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Bot,
  Check,
  ChevronDown,
  CircleStop,
  Clock3,
  Code2,
  FileCode2,
  FileText,
  Folder,
  GitBranch,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelRightClose,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react'
import { seedSessions } from './data'
import {
  buildDemoRun,
  createUserMessage,
  MODE_POLICIES,
  resolvePermission,
  type RunMode,
  type Session,
  type ToolEvent,
} from './model'

const STORAGE_KEY = 'general-agent-demo:v1'

function loadSessions(): Session[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Session[]) : seedSessions
  } catch {
    return seedSessions
  }
}

function StatusMark({ status }: { status: Session['status'] }) {
  return <span className={`status-mark status-${status}`} aria-label={status} />
}

function ToolIcon({ tool }: { tool: string }) {
  if (tool === 'write') return <FileCode2 size={15} />
  if (tool === 'read' || tool === 'glob') return <FileText size={15} />
  if (tool === 'bash') return <TerminalSquare size={15} />
  return <Code2 size={15} />
}

function ToolRow({ event }: { event: ToolEvent }) {
  return (
    <div className={`tool-row tool-${event.status}`}>
      <div className="tool-icon"><ToolIcon tool={event.tool} /></div>
      <div className="tool-copy">
        <div className="tool-title-line">
          <strong>{event.label}</strong>
          {event.duration && <span>{event.duration}</span>}
        </div>
        <p>{event.detail}</p>
      </div>
      <div className="tool-state">
        {event.status === 'done' && <Check size={14} />}
        {event.status === 'waiting' && <Clock3 size={14} />}
        {event.status === 'blocked' && <X size={14} />}
      </div>
    </div>
  )
}

function SessionList({ sessions, activeId, onSelect, onNew }: { sessions: Session[]; activeId: string; onSelect: (id: string) => void; onNew: () => void }) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark"><Sparkles size={17} /></div>
        <span>General Agent</span>
        <button className="icon-button brand-action" aria-label="设置"><Settings2 size={17} /></button>
      </div>
      <button className="new-session" onClick={onNew}><Plus size={16} /> 新建会话 <kbd>⌘ N</kbd></button>
      <div className="search-box"><Search size={15} /><input aria-label="搜索会话" placeholder="搜索会话" /></div>
      <div className="session-section-label"><span>最近会话</span><button aria-label="更多"><MoreHorizontal size={15} /></button></div>
      <div className="session-list">
        {sessions.map((session) => (
          <button key={session.id} className={`session-item ${activeId === session.id ? 'active' : ''}`} onClick={() => onSelect(session.id)}>
            <div className="session-title"><StatusMark status={session.status} /><span>{session.title}</span></div>
            <div className="session-meta"><span>{session.project}</span><span>{session.updatedAt}</span></div>
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="runtime-state"><span className="live-indicator" /> 本地运行时已连接</div>
        <button className="profile-button"><div className="avatar">HX</div><span><strong>本地工作区</strong><small>数据仅保存在此设备</small></span><ChevronDown size={15} /></button>
      </div>
    </aside>
  )
}

function Timeline({ events }: { events: ToolEvent[] }) {
  if (!events.length) return <div className="empty-timeline"><Activity size={20} /><p>发送任务后，这里会显示工具调用和执行结果。</p></div>
  return <div className="timeline">{events.map((event) => <ToolRow key={event.id} event={event} />)}</div>
}

export function App() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions)
  const [activeId, setActiveId] = useState(sessions[0]?.id ?? '')
  const [mode, setMode] = useState<RunMode>('craft')
  const [draft, setDraft] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [rightOpen, setRightOpen] = useState(true)
  const [mobileNav, setMobileNav] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const active = useMemo(() => sessions.find((session) => session.id === activeId) ?? sessions[0], [sessions, activeId])
  const pendingEvent = active?.events.find((event) => event.status === 'waiting')

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)), [sessions])
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [active?.messages.length, isRunning])

  const updateActive = (updater: (session: Session) => Session) => {
    setSessions((current) => current.map((session) => (session.id === active.id ? updater(session) : session)))
  }

  const createSession = () => {
    const id = `session-${Date.now()}`
    const session: Session = { id, title: '新会话', project: '默认项目', updatedAt: '刚刚', status: 'idle', messages: [], events: [] }
    setSessions((current) => [session, ...current])
    setActiveId(id)
    setMobileNav(false)
  }

  const submit = () => {
    if (!draft.trim() || isRunning) return
    const userMessage = createUserMessage(draft)
    const nextTitle = active.messages.length === 0 ? draft.trim().slice(0, 18) : active.title
    updateActive((session) => ({ ...session, title: nextTitle, updatedAt: '刚刚', status: 'running', messages: [...session.messages, userMessage], events: [] }))
    setDraft('')
    setIsRunning(true)

    window.setTimeout(() => {
      const result = buildDemoRun(mode)
      const responseTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      updateActive((session) => ({
        ...session,
        status: result.status,
        events: result.events,
        messages: [...session.messages, { id: `assistant-${Date.now()}`, role: 'assistant', content: result.response, time: responseTime }],
      }))
      setIsRunning(false)
    }, 950)
  }

  const decidePermission = (approved: boolean) => {
    updateActive((session) => ({
      ...session,
      status: approved ? 'done' : 'error',
      events: resolvePermission(session.events, approved),
      messages: [...session.messages, {
        id: `permission-${Date.now()}`,
        role: 'assistant',
        content: approved ? '已完成模拟写入，并保留了可回滚的变更记录。' : '操作已取消。没有文件被修改。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }],
    }))
  }

  if (!active) return null

  return (
    <div className="app-shell">
      <div className={`mobile-overlay ${mobileNav ? 'show' : ''}`} onClick={() => setMobileNav(false)} />
      <div className={`sidebar-wrap ${mobileNav ? 'show' : ''}`}><SessionList sessions={sessions} activeId={active.id} onSelect={(id) => { setActiveId(id); setMobileNav(false) }} onNew={createSession} /></div>

      <main className="conversation-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="打开会话列表"><Menu size={19} /></button>
          <div className="title-stack"><strong>{active.title}</strong><span><Folder size={13} /> {active.project} <GitBranch size={13} /> main</span></div>
          <div className="topbar-actions">
            <span className="demo-label">本地演示</span>
            <button className="icon-button" onClick={() => setRightOpen((open) => !open)} aria-label="切换运行详情"><PanelRightClose size={18} /></button>
            <button className="icon-button" aria-label="更多操作"><MoreHorizontal size={18} /></button>
          </div>
        </header>

        <div className="messages">
          {active.messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon"><Bot size={25} /></div>
              <h1>今天想完成什么？</h1>
              <p>我可以读取项目、制定计划并在你批准后执行变更。</p>
              <div className="starter-grid">
                <button onClick={() => setDraft('检查当前项目并列出上线风险')}><ShieldCheck size={17} /><span>检查项目风险<small>只读扫描并生成报告</small></span></button>
                <button onClick={() => setDraft('整理项目目录并给出重构计划')}><FileText size={17} /><span>整理项目结构<small>先规划，不直接修改</small></span></button>
              </div>
            </div>
          )}
          {active.messages.map((message) => (
            <article key={message.id} className={`message message-${message.role}`}>
              <div className="message-avatar">{message.role === 'user' ? 'HX' : <Bot size={16} />}</div>
              <div className="message-body"><div className="message-author"><strong>{message.role === 'user' ? '你' : 'Agent'}</strong><span>{message.time}</span></div><p>{message.content}</p></div>
            </article>
          ))}
          {isRunning && <div className="thinking"><span /><span /><span /><em>正在理解任务并装配工具</em></div>}
          <div ref={endRef} />
        </div>

        <div className="composer-wrap">
          <div className="mode-tabs" role="tablist">
            {(Object.keys(MODE_POLICIES) as RunMode[]).map((key) => <button key={key} className={mode === key ? 'active' : ''} onClick={() => setMode(key)}>{MODE_POLICIES[key].title}</button>)}
            <span>{MODE_POLICIES[mode].summary}</span>
          </div>
          <div className="composer">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder="描述你想完成的任务…" rows={2} />
            <div className="composer-footer">
              <div><button className="composer-tool"><Plus size={16} /></button><button className="model-picker">Claude 3.7 Sonnet <ChevronDown size={13} /></button></div>
              <button className={`send-button ${draft.trim() ? 'ready' : ''}`} onClick={submit} disabled={!draft.trim() || isRunning}>{isRunning ? <CircleStop size={17} /> : <Send size={17} />}</button>
            </div>
          </div>
          <p className="composer-note">Enter 发送 · Shift + Enter 换行 · Demo 不会执行真实操作</p>
        </div>
      </main>

      {rightOpen && <aside className="inspector">
        <div className="inspector-header"><div><Activity size={16} /><strong>运行详情</strong></div><span>{active.events.length} 个事件</span></div>
        <section className="run-summary">
          <div className="summary-line"><span>状态</span><strong className={`run-${active.status}`}><StatusMark status={active.status} /> {active.status === 'waiting' ? '等待批准' : active.status === 'running' ? '执行中' : active.status === 'error' ? '已终止' : active.status === 'done' ? '已完成' : '待命'}</strong></div>
          <div className="summary-line"><span>模式</span><strong>{MODE_POLICIES[mode].title}</strong></div>
          <div className="summary-line"><span>工作区</span><strong>{active.project}</strong></div>
        </section>
        <div className="inspector-section-title"><span>工具时间线</span><button><MoreHorizontal size={15} /></button></div>
        <Timeline events={active.events} />
        {pendingEvent && <div className="permission-card">
          <div className="permission-title"><ShieldCheck size={18} /><span><strong>需要批准</strong><small>写入操作 · 不可静默执行</small></span></div>
          <div className="diff-preview"><div><span>+</span> export const releaseReady = true</div><div><span>+</span> export const auditTrail = 'local'</div></div>
          <p><FileCode2 size={14} /> {pendingEvent.detail}</p>
          <div className="permission-actions"><button onClick={() => decidePermission(false)}>拒绝</button><button className="approve" onClick={() => decidePermission(true)}><Play size={14} /> 批准并执行</button></div>
        </div>}
        <div className="inspector-footer"><ShieldCheck size={14} /><span>所有动作仅为模拟，真实接入将在下一阶段完成。</span></div>
      </aside>}
    </div>
  )
}
