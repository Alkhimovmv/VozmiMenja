import { PDFDownloadLink } from '@react-pdf/renderer'
import RentalAgreementPDF from '../components/RentalAgreementPDF'

export default function RentalAgreementPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Договор аренды оборудования</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Типовая форма договора — заполняется при получении оборудования</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Пояснение */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-blue-800 text-sm">
            Договор заключается при каждой аренде. Арендодатель заполняет поля об оборудовании и стоимости заранее — арендатору остаётся вписать только свои данные и подписать.
          </div>

          {/* Сам договор */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 text-sm text-gray-700 leading-relaxed space-y-8 print:shadow-none print:border-none">

            {/* Шапка */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-widest">г. Москва</p>
              <h2 className="text-xl font-bold text-gray-900">ДОГОВОР АРЕНДЫ ОБОРУДОВАНИЯ № ______</h2>
              <p className="text-gray-500 text-xs">«______» ________________ 20____ г.</p>
            </div>

            {/* Преамбула */}
            <div className="border-t border-gray-100 pt-6">
              <p>
                Индивидуальный предприниматель <strong>Алхимова Софья Вадимовна</strong>, ОГРНИП 326670000005031,
                ИНН 672403445744, именуемая в дальнейшем <strong>«Арендодатель»</strong>, с одной стороны,
                и&nbsp;
                <span className="inline-block border-b border-gray-400 min-w-[240px]">&nbsp;</span>,
                именуемый(-ая) в дальнейшем <strong>«Арендатор»</strong>, с другой стороны, вместе именуемые
                <strong> «Стороны»</strong>, заключили настоящий Договор о нижеследующем.
              </p>
            </div>

            {/* 1. Предмет */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">1. ПРЕДМЕТ ДОГОВОРА</h3>
              <div className="space-y-2">
                <p>1.1. Арендодатель передаёт Арендатору во временное пользование следующее оборудование (далее — <strong>Оборудование</strong>):</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex gap-2"><span className="text-gray-500 w-32 flex-shrink-0">Наименование:</span><span className="border-b border-gray-300 flex-1">&nbsp;</span></div>
                </div>
                <p>1.2. Оборудование используется Арендатором строго по назначению.</p>
              </div>
            </div>

            {/* 2. Срок */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">2. СРОК АРЕНДЫ</h3>
              <div className="space-y-2">
                <p>
                  2.1. Срок аренды: с «____» __________ 20__ г.&nbsp;&nbsp;по «____» __________ 20__ г.
                </p>
                <p>
                  2.2. Время возврата Оборудования: <span className="border-b border-gray-400 inline-block min-w-[80px]">&nbsp;</span> ч. <span className="border-b border-gray-400 inline-block min-w-[40px]">&nbsp;</span> мин.
                </p>
                <p>2.3. Срок может быть продлён по письменному согласию Сторон до истечения первоначального срока.</p>
              </div>
            </div>

            {/* 3. Стоимость */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ</h3>
              <div className="space-y-2">
                <p>
                  3.1. Итоговая сумма за весь срок: <span className="border-b border-gray-400 inline-block min-w-[120px]">&nbsp;</span> руб.
                </p>
                <p>3.2. Оплата производится наличными, банковским переводом или по ссылке картой в момент получения Оборудования.</p>
                <p>
                  3.3. Залог: <span className="border-b border-gray-400 inline-block min-w-[80px]">&nbsp;</span> руб. Возвращается при возврате Оборудования в исправном и чистом состоянии.
                </p>
              </div>
            </div>

            {/* 4. Обязанности */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">4. ПРАВА И ОБЯЗАННОСТИ СТОРОН</h3>
              <div className="space-y-2">
                <p><strong>Арендодатель</strong> обязуется:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>передать Оборудование в исправном состоянии;</li>
                  <li>вернуть залог при соблюдении условий договора.</li>
                </ul>
                <p className="pt-1"><strong>Арендатор</strong> обязуется:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>использовать Оборудование строго по назначению;</li>
                  <li>не передавать Оборудование третьим лицам без письменного согласия Арендодателя;</li>
                  <li>немедленно уведомить Арендодателя о неисправности или повреждении;</li>
                  <li>вернуть Оборудование в срок, в исправном и чистом состоянии, в полной комплектации.</li>
                </ul>
              </div>
            </div>

            {/* 5. Ответственность */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">5. ОТВЕТСТВЕННОСТЬ СТОРОН</h3>
              <div className="space-y-2">
                <p>5.1. Арендатор несёт полную материальную ответственность за утрату, хищение или повреждение Оборудования с момента его получения до возврата.</p>
                <p>5.2. При возврате Оборудования в ненадлежащем <strong>санитарном состоянии</strong> (загрязнённым) взимается штраф <strong>5 000 (пять тысяч) рублей</strong>.</p>
                <p>5.3. При <strong>просрочке возврата</strong> начисляется пеня в размере <strong>двойной суточной ставки</strong> за каждые начатые сутки просрочки. Арендатору предоставляется 2 часа на форс-мажорные обстоятельства без штрафных санкций.</p>
                <p>5.4. При <strong>отмене бронирования менее чем за 24 часа</strong> до начала аренды взимается штраф <strong>50% от стоимости</strong> аренды.</p>
                <p>5.5. Уплата пени не освобождает Арендатора от исполнения обязательства по возврату Оборудования.</p>
                <p>5.6. Ответственность за вред, причинённый третьим лицам при использовании Оборудования, несёт Арендатор.</p>
              </div>
            </div>

            {/* 6. Прочие */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">6. ПРОЧИЕ УСЛОВИЯ</h3>
              <div className="space-y-2">
                <p>6.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.</p>
                <p>6.2. Споры разрешаются путём переговоров. При невозможности — в суде по месту нахождения Арендодателя.</p>
                <p>6.3. Во всём, что не предусмотрено настоящим Договором, Стороны руководствуются действующим законодательством РФ.</p>
                <p>6.4. Договор составлен в двух экземплярах, имеющих равную юридическую силу.</p>
              </div>
            </div>

            {/* 7. Реквизиты и подписи */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">7. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Арендодатель */}
                <div className="space-y-2 text-sm">
                  <p className="font-bold text-gray-900">Арендодатель:</p>
                  <p>ИП Алхимова Софья Вадимовна</p>
                  <p>ОГРНИП: 326670000005031</p>
                  <p>ИНН: 672403445744</p>
                  <p>Р/с: 40802810600009319726</p>
                  <p>Банк: АО «ТБанк»</p>
                  <p>БИК: 044525974</p>
                  <p>Тел.: +7 (993) 363-64-64</p>
                  <p>Email: alkhimovmv@yandex.ru</p>
                </div>

                {/* Арендатор */}
                <div className="space-y-3 text-sm">
                  <p className="font-bold text-gray-900">Арендатор:</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">ФИО</p>
                      <div className="border-b border-gray-300 w-full h-6" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Паспорт: серия и номер</p>
                      <div className="border-b border-gray-300 w-full h-6" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Прописка</p>
                      <div className="border-b border-gray-300 w-full h-6" />
                      <div className="border-b border-gray-300 w-full h-6 mt-2" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Телефон</p>
                      <div className="border-b border-gray-300 w-full h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Подписи на одной строке */}
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Подпись Арендодателя / Печать</p>
                  <div className="border-b border-gray-300 w-full h-8" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Подпись Арендатора</p>
                  <div className="border-b border-gray-300 w-full h-8" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Типовая форма договора ИП Алхимовой С.В. Редакция от 9 мая 2026 года.</p>
            </div>
          </div>

          {/* Кнопка скачивания PDF */}
          <div className="mt-6 flex justify-center">
            <PDFDownloadLink
              document={<RentalAgreementPDF />}
              fileName="Договор_аренды_ВозьмиМеня.pdf"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              {({ loading }) => (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {loading ? 'Подготовка PDF...' : 'Скачать договор (PDF)'}
                </>
              )}
            </PDFDownloadLink>
          </div>

        </div>
      </section>
    </div>
  )
}
