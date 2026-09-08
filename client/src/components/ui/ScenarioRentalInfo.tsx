import { CheckCircle2, Clock } from 'lucide-react'

type ScenarioRentalInfoProps = {
  kitTitle?: string
  kitDescription?: string
  durationTitle?: string
  durationDescription?: string
  kitItems?: string[]
  durationItems?: Array<{
    title: string
    text: string
  }>
  className?: string
  cardClassName?: string
  accentClassName?: string
}

export default function ScenarioRentalInfo({
  kitTitle = 'Что входит в комплект',
  kitDescription = 'Уточняем комплектацию под задачу и даты, чтобы вы не брали лишнее и не забыли важные аксессуары.',
  durationTitle = 'Обычно берут на',
  durationDescription = 'Если срок непонятен, напишите вводные — подскажем, где хватит одного дня, а где лучше оставить запас.',
  kitItems,
  durationItems,
  className = '',
  cardClassName = 'border-slate-200 bg-white',
  accentClassName = 'text-[#1D4ED8]',
}: ScenarioRentalInfoProps) {
  return (
    <section className={`py-14 ${className}`}>
      <div className={`container mx-auto grid gap-5 px-4 ${kitItems && durationItems ? 'lg:grid-cols-2' : ''}`}>
        {kitItems && (
          <div className={`rounded-3xl border p-6 md:p-8 ${cardClassName}`}>
            <h2 className="mb-3 text-3xl font-extrabold">{kitTitle}</h2>
            <p className="mb-5 text-sm leading-6 text-slate-600">{kitDescription}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {kitItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-white/65 p-4">
                  <CheckCircle2 className={`mt-0.5 h-5 w-5 flex-shrink-0 ${accentClassName}`} />
                  <span className="text-sm font-semibold leading-6 text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {durationItems && (
          <div className={`rounded-3xl border p-6 md:p-8 ${cardClassName}`}>
            <h2 className="mb-3 text-3xl font-extrabold">{durationTitle}</h2>
            <p className="mb-5 text-sm leading-6 text-slate-600">{durationDescription}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {durationItems.map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/65 p-4">
                  <Clock className={`mb-3 h-5 w-5 ${accentClassName}`} />
                  <h3 className="mb-1 text-lg font-extrabold">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!kitItems && !durationItems && (
          <div className={`rounded-3xl border p-6 md:p-8 ${cardClassName}`}>
            <h2 className="mb-3 text-3xl font-extrabold">{kitTitle}</h2>
            <p className="text-sm leading-6 text-slate-600">
              Напишите задачу и даты — подберем оборудование, срок и комплект без лишней переписки.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
