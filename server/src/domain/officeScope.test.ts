import { resolveOfficeScope } from './officeScope'

describe('resolveOfficeScope', () => {
  it('keeps superadmin unfiltered unless an office is selected', () => {
    expect(resolveOfficeScope(null)).toBeUndefined()
    expect(resolveOfficeScope(null, '2')).toEqual([2])
  })

  it('never turns an empty or unauthorized admin scope into global access', () => {
    expect(resolveOfficeScope([])).toEqual([])
    expect(resolveOfficeScope([1], '2')).toEqual([])
    expect(resolveOfficeScope([1], 'invalid')).toEqual([])
  })

  it('returns the selected accessible office or all accessible offices', () => {
    expect(resolveOfficeScope([1, 2])).toEqual([1, 2])
    expect(resolveOfficeScope([1, 2], '2')).toEqual([2])
  })
})
