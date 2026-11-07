export interface ArticleReplacement {
  from: string
  to: string
}

// Длина начала абзаца, по которой узнаём автоматически добавленный блок ссылок в любой его версии.
const LEAD_LENGTH = 40

// Применяет правила обновления статьи идемпотентно: повторный запуск ничего не меняет.
//
// Правило, где `to` начинается с `from` (дописать абзац после вступления), раньше применялось
// на каждом деплое: `from` оставался в тексте, и абзац накапливался десятки раз — в том числе
// старыми версиями текста, если правило потом меняли. Поэтому для таких правил:
// 1) удаляются все абзацы, начинающиеся так же, как дописываемые (любая версия, любое число копий);
// 2) после `from` вставляется ровно одна актуальная версия.
export function applyArticleRefresh(content: string, replacements: ArticleReplacement[]): string {
  let next = content

  for (const { from, to } of replacements) {
    if (to.startsWith(from) && to.length > from.length) {
      if (!next.includes(from)) continue
      const leads = to.slice(from.length)
        .split('\n\n')
        .map((paragraph) => paragraph.trim().slice(0, LEAD_LENGTH))
        .filter((lead) => lead.length >= 20)
      const withoutInjected = next
        .split('\n\n')
        .filter((paragraph) => !leads.some((lead) => paragraph.trim().startsWith(lead)))
        .join('\n\n')
      next = withoutInjected.replace(from, to)
    } else if (next.includes(from)) {
      next = next.split(from).join(to)
    }
  }

  return next
}
