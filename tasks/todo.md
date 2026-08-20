# Tasks

- [x] 搭建应用骨架和领域模型
  - Acceptance：开发服务器可启动并显示应用根节点
  - Verify：`npm run build`
- [x] 实现三栏工作台和响应式样式
  - Acceptance：会话栏、对话区、运行详情栏完整呈现
  - Verify：浏览器桌面与窄屏检查
- [x] 实现 Agent 交互闭环
  - Acceptance：模式切换、消息提交、工具事件、权限批准/拒绝均可操作
  - Verify：`npm test`
- [x] 增加持久化和交付说明
  - Acceptance：刷新后恢复状态，README 包含运行命令与 Demo 边界
  - Verify：刷新测试与文档检查
- [x] 完成发布前验证
  - Acceptance：测试、类型检查、构建全部通过
  - Verify：`npm test && npm run typecheck && npm run build`
