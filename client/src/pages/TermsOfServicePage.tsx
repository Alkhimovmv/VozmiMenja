export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Условия использования</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Правила пользования сервисом ВозьмиМеня</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-sm text-gray-600 leading-relaxed">

            <div className="bg-blue-50 rounded-xl p-4 text-blue-800 text-sm">
              Данные условия использования регулируют отношения между ИП Алхимова С.В. и пользователями сервиса аренды оборудования ВозьмиМеня. Оформляя заявку, вы принимаете данные условия в полном объёме.
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Оформление аренды — необходимые документы</h2>
              <p className="mb-3">Для оформления аренды нам понадобится:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>ФИО</strong></li>
                <li><strong>Номер телефона</strong></li>
                <li><strong>Фото первой страницы паспорта</strong> (фото, ФИО, дата рождения)</li>
                <li><strong>Фото страницы с пропиской</strong></li>
              </ul>
              <div className="mt-3 bg-gray-50 rounded-xl p-4 text-gray-500 text-xs">
                На скане паспорта вы можете написать «Не для использования» — это абсолютно допустимо. Документы необходимы для проверки личности и отправки оборудования. После окончания аренды все ваши данные удаляются из системы.
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Как получить оборудование</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Самовывоз через постамат (24/7)</h3>
                  <p>В офисе работает постамат с удалённым доступом — вы можете приехать в любое время дня и ночи. Мы выдаём вам временный код от двери офиса и временный код от ячейки постамата. При этом личное присутствие арендодателя не требуется.</p>
                  <p className="mt-1.5">Для получения через постамат необходимо заблаговременно прислать:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Первую страницу паспорта (фото, ФИО, дата рождения)</li>
                    <li>Страницу с пропиской</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Личная встреча</h3>
                  <p>Если вам необходимо личное присутствие арендодателя, мы договариваемся об удобном времени и встречаемся в офисе. При себе необходимо иметь <strong>паспорт</strong>.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Доставка</h2>
              <p className="mb-2">Доставка оборудования осуществляется курьерами <strong>Яндекс Go</strong>. Стоимость и сроки доставки определяются напрямую тарифами Яндекса и зависят от:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Текущего спроса и загруженности курьеров</li>
                <li>Расстояния до адреса доставки</li>
                <li>Времени суток и дорожной ситуации</li>
                <li>Габаритов и веса оборудования</li>
              </ul>
              <p className="mt-2">Стоимость доставки рассчитывается в момент оформления заказа и оплачивается отдельно от стоимости аренды. ИП Алхимова С.В. не устанавливает тарифы на доставку и не несёт ответственности за их изменение.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Бронирование и оплата</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">4.1. Бронирование</h3>
                  <p>Оформляется через сайт или по телефону. Подтверждение — в течение 2 часов.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">4.2. Оплата</h3>
                  <p>Наличными при получении, банковской картой или безналичным переводом. Для юридических лиц — безналичная оплата по счёту.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">4.3. Залог</h3>
                  <p>По решению арендодателя может быть взят залог, который возвращается при возврате оборудования в исправном и чистом состоянии.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Обязанности арендатора</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Бережно обращаться с арендованным оборудованием</li>
                <li>Использовать технику строго по назначению</li>
                <li>Возвращать оборудование в срок и в чистом состоянии</li>
                <li>Незамедлительно сообщать о неисправностях</li>
                <li>Не передавать оборудование третьим лицам</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Ответственность</h2>
              <p className="mb-2">Арендатор несёт полную материальную ответственность за:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Утрату или кражу оборудования</li>
                <li>Повреждения, вызванные неправильной эксплуатацией</li>
                <li>Просрочку возврата (двойная суточная ставка за каждый день)</li>
                <li>Возврат оборудования в загрязнённом состоянии (штраф 5 000 руб.)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Отмена бронирования</h2>
              <p>Отмена возможна не позднее чем за 24 часа до начала аренды. При отмене менее чем за 24 часа взимается штраф в размере 50% от стоимости аренды.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Изменение условий</h2>
              <p>Мы оставляем за собой право изменять данные условия использования. Актуальная версия всегда доступна на сайте vozmimenya.ru.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Контактная информация</h2>
              <div className="space-y-1">
                <p><strong>ИП Алхимова Софья Вадимовна</strong></p>
                <p>ОГРНИП: 326670000005031, ИНН: 672403445744</p>
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
                <p>Адрес: 216400, Смоленская обл., г. Десногорск, мкр. 4, д. 18, сек. 2, кв. 81</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Редакция от 9 мая 2026 года</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
