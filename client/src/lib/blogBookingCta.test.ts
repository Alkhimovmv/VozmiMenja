import assert from 'node:assert/strict'
import { extractArticleBookingLinks } from './blogBookingCta'

const content = `
[Карточка](/equipment/jbl-partybox-320)
[Забронировать PartyBox 320](/booking?equipment=jbl-partybox-320)
[Забронировать PartyBox 710](/booking?equipment=jbl-partybox-710)
[Повтор](/booking?equipment=jbl-partybox-320)
`

assert.deepEqual(extractArticleBookingLinks(content), [
  {
    href: '/booking?equipment=jbl-partybox-320',
    label: 'Забронировать PartyBox 320',
    equipment: 'jbl-partybox-320',
  },
  {
    href: '/booking?equipment=jbl-partybox-710',
    label: 'Забронировать PartyBox 710',
    equipment: 'jbl-partybox-710',
  },
])

console.log('blogBookingCta tests passed')

