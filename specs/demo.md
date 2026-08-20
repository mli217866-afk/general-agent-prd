# Spec: 通用 Agent 交互 Demo

## Objective

构建一个浏览器可运行的桌面 Agent 高保真 Demo，让产品评审者无需配置模型 Key 就能体验三栏工作台、会话切换、工作模式、工具执行时间线、权限审批和本地持久化。

## Tech Stack

- React 19 + TypeScript
- Vite
- Lucide React 图标
- 原生 CSS 设计令牌与响应式布局
- localStorage 持久化 Demo 状态

## Commands

- 安装：`npm install`
- 开发：`npm run dev`
- 测试：`npm test`
- 类型检查：`npm run typecheck`
- 构建：`npm run build`

## Project Structure

- `src/components/`：工作台组件
- `src/data/`：演示会话和工具事件
- `src/lib/`：状态和持久化逻辑
- `src/styles/`：设计令牌与页面样式
- `src/test/`：行为测试
- `tasks/`：计划与任务清单

## Code Style

```ts
export function resolveRunMode(mode: RunMode): ModePolicy {
  return MODE_POLICIES[mode];
}
```

使用明确的领域类型和小组件；事件处理函数以动作命名；不为单一场景创建抽象层。

## Testing Strategy

- Vitest 验证模式契约、消息提交和权限决策。
- Vite build 验证 TypeScript 与生产构建。
- 浏览器手测桌面布局、响应式布局和主要交互。

## Boundaries

- Always：危险动作默认等待批准；错误显式显示；状态保存在本机。
- Ask first：接入真实模型、真实终端、Electron 主进程或云端服务。
- Never：收集真实 API Key；执行真实文件写入或终端命令；声称模拟结果已真实执行。

## Success Criteria

- 三栏界面在桌面尺寸完整可见，小屏可降级为单主栏。
- 可新建和切换会话，可选择 Craft、Plan、Ask。
- 发送消息后出现流式运行状态和工具时间线。
- 写入动作必须经批准或拒绝，拒绝后明确终止。
- 会话、模式和权限选择刷新后仍保留。
- 测试、类型检查和生产构建通过。

## Open Questions

- 真实模型、终端与 Electron 集成留作下一阶段。
