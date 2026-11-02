import { InMemoryRateGate } from './publicLeadGuard'

describe('public lead rate gate', () => {
  it('blocks requests above the limit inside one window', () => {
    const gate = new InMemoryRateGate(2, 60_000)

    expect(gate.consume('client', 1_000).allowed).toBe(true)
    expect(gate.consume('client', 2_000).allowed).toBe(true)
    expect(gate.consume('client', 3_000)).toMatchObject({ allowed: false, remaining: 0 })
  })

  it('starts a new window after reset and isolates clients', () => {
    const gate = new InMemoryRateGate(1, 1_000)

    expect(gate.consume('first', 1_000).allowed).toBe(true)
    expect(gate.consume('first', 1_500).allowed).toBe(false)
    expect(gate.consume('second', 1_500).allowed).toBe(true)
    expect(gate.consume('first', 2_000).allowed).toBe(true)
  })
})
