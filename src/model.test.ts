import { describe, expect, it } from 'vitest'
import { buildDemoRun, createUserMessage, resolvePermission, resolveRunMode } from './model'

describe('run mode contracts', () => {
  it('blocks tools and writes in Ask mode', () => {
    expect(resolveRunMode('ask')).toMatchObject({ tools: false, writes: 'blocked' })
  })

  it('allows tools but blocks writes in Plan mode', () => {
    expect(resolveRunMode('plan')).toMatchObject({ tools: true, writes: 'blocked' })
  })

  it('requires confirmation for writes in Craft mode', () => {
    expect(resolveRunMode('craft')).toMatchObject({ tools: true, writes: 'confirm' })
    expect(buildDemoRun('craft').status).toBe('waiting')
  })
})

describe('message and permission behavior', () => {
  it('trims user input', () => {
    expect(createUserMessage('  检查项目  ', new Date('2026-08-20T10:00:00')).content).toBe('检查项目')
  })

  it('records rejected writes as blocked', () => {
    const events = buildDemoRun('craft').events
    expect(resolvePermission(events, false).find((event) => event.tool === 'write')).toMatchObject({ status: 'blocked' })
  })

  it('records approved writes as done', () => {
    const events = buildDemoRun('craft').events
    expect(resolvePermission(events, true).find((event) => event.tool === 'write')).toMatchObject({ status: 'done' })
  })
})
