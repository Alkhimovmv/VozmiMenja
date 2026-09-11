import { signToken, verifyToken } from './auth'

describe('admin auth token', () => {
  it('signs and verifies admin tokens with user identity and role', () => {
    const token = signToken({ userId: 7, phone: '79990000000', role: 'admin' })
    const payload = verifyToken(token)

    expect(payload?.userId).toBe(7)
    expect(payload?.phone).toBe('79990000000')
    expect(payload?.role).toBe('admin')
  })

  it('returns null for invalid tokens', () => {
    expect(verifyToken('bad-token')).toBeNull()
  })
})
