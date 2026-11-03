import { getPostomatSecret, secretMatches } from './secrets'

describe('secretMatches', () => {
  it('accepts only an exact string match', () => {
    expect(secretMatches('s3cret', 's3cret')).toBe(true)
    expect(secretMatches('s3cre', 's3cret')).toBe(false)
    expect(secretMatches('s3cret!', 's3cret')).toBe(false)
    expect(secretMatches(['s3cret'], 's3cret')).toBe(false)
    expect(secretMatches(undefined, 's3cret')).toBe(false)
    expect(secretMatches('', '')).toBe(false)
  })
})

describe('getPostomatSecret', () => {
  it('prefers a per-office secret and falls back to the shared one', () => {
    const env = { POSTOMAT_SECRET: 'shared', POSTOMAT_SECRET_OFFICE_2: 'office-two' } as NodeJS.ProcessEnv
    expect(getPostomatSecret(2, env)).toBe('office-two')
    expect(getPostomatSecret(1, env)).toBe('shared')
    expect(getPostomatSecret(undefined, env)).toBe('shared')
  })
})
