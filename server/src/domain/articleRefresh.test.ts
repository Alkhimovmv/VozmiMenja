import { applyArticleRefresh } from './articleRefresh'

const intro = 'Качественный звук - это 50% успеха любого видео.'
const links = '\n\nДля такой задачи можно сразу посмотреть [DJI Mic 2](/equipment/dji-mic-2).'
const rule = { from: intro, to: `${intro}${links}` }

describe('applyArticleRefresh', () => {
  it('adds the paragraph once and is idempotent on repeated deploys', () => {
    const original = `${intro}\n\nОсновной текст.`

    const once = applyArticleRefresh(original, [rule])
    const twice = applyArticleRefresh(once, [rule])

    expect(once).toBe(`${intro}${links}\n\nОсновной текст.`)
    expect(twice).toBe(once)
  })

  it('collapses paragraphs accumulated by previous non-idempotent runs', () => {
    const broken = `${intro}${links.repeat(60)}\n\nОсновной текст.`

    expect(applyArticleRefresh(broken, [rule])).toBe(`${intro}${links}\n\nОсновной текст.`)
  })

  it('removes copies of older versions of the injected paragraph', () => {
    const oldLinks = '\n\nДля такой задачи можно сразу посмотреть [DJI Mic 2](/equipment/1232f00f-dc96).'
    const broken = `${intro}${links.repeat(21)}${oldLinks.repeat(39)}\n\nОсновной текст.\n\nЗаключение.`

    const result = applyArticleRefresh(broken, [rule])

    expect(result).toBe(`${intro}${links}\n\nОсновной текст.\n\nЗаключение.`)
    expect(applyArticleRefresh(result, [rule])).toBe(result)
  })

  it('keeps plain replacements working and stable', () => {
    const plain = { from: '**Позвоните нам** – , поможем выбрать', to: '**Напишите нам** - поможем выбрать модель' }
    const content = `Текст. ${plain.from}.`

    const result = applyArticleRefresh(content, [plain])

    expect(result).toBe(`Текст. ${plain.to}.`)
    expect(applyArticleRefresh(result, [plain])).toBe(result)
  })

  it('does not repeat a replacement that appends to a non-paragraph fragment', () => {
    const row = { from: '| Поломка | Ремонт |', to: '| Поломка | Ремонт |\n| Просрочка | Двойная ставка |' }
    const content = '| Нарушение | Штраф |\n| Поломка | Ремонт |'

    const once = applyArticleRefresh(content, [row])

    expect(once).toBe('| Нарушение | Штраф |\n| Поломка | Ремонт |\n| Просрочка | Двойная ставка |')
    expect(applyArticleRefresh(once, [row])).toBe(once)
  })

  it('leaves unrelated content untouched', () => {
    expect(applyArticleRefresh('Другая статья.', [rule])).toBe('Другая статья.')
  })
})
