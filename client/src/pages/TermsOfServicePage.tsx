export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Условия использования</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Правила пользования сервисом ВозьмиМеня</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Общие положения</h2>
              <p className="text-gray-600 text-sm leading-relaxed">Данные условия использования регулируют отношения между ООО "ВозьмиМеня" и пользователями сервиса аренды оборудования. Используя наш сервис, вы принимаете данные условия в полном объеме.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Описание услуг</h2>
              <p className="text-gray-600 text-sm mb-2">ВозьмиМеня предоставляет следующие услуги:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                {['Аренда профессионального оборудования', 'Техническая поддержка и консультации', 'Доставка и самовывоз оборудования', 'Обслуживание и настройка техники'].map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Регистрация и аккаунт</h2>
              <p className="text-gray-600 text-sm mb-2">Для использования сервиса необходимо:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                {['Предоставить достоверную контактную информацию', 'Быть совершеннолетним или иметь согласие родителей', 'Соблюдать конфиденциальность данных доступа', 'Уведомлять об изменениях в контактных данных'].map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Условия аренды</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div><h3 className="font-semibold text-gray-900 mb-1">4.1. Бронирование</h3><p>Бронирование осуществляется через сайт или по телефону. Подтверждение бронирования происходит в течение 2 часов.</p></div>
                <div><h3 className="font-semibold text-gray-900 mb-1">4.2. Оплата</h3><p>Оплата производится наличными при получении или банковской картой на сайте. Возможна безналичная оплата для юридических лиц.</p></div>
                <div><h3 className="font-semibold text-gray-900 mb-1">4.3. Залог</h3><p>За некоторые виды оборудования взимается залог, который возвращается при возврате техники в исправном состоянии.</p></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Права и обязанности сторон</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">5.1. Обязанности арендатора</h3>
                  <ul className="list-disc pl-5 space-y-1">{['Бережно относиться к арендованному оборудованию', 'Использовать технику по назначению', 'Возвращать оборудование в срок', 'Сообщать о неисправностях немедленно', 'Не передавать оборудование третьим лицам'].map(i => <li key={i}>{i}</li>)}</ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">5.2. Обязанности арендодателя</h3>
                  <ul className="list-disc pl-5 space-y-1">{['Предоставлять исправное оборудование', 'Обеспечивать техническую поддержку', 'Соблюдать сроки доставки', 'Предоставлять инструкции по эксплуатации'].map(i => <li key={i}>{i}</li>)}</ul>
                </div>
              </div>
            </div>
            {[
              { title: '6. Ответственность', prefix: 'Арендатор несет полную материальную ответственность за:', list: ['Утрату или кражу оборудования', 'Повреждения, вызванные неправильной эксплуатацией', 'Просрочку возврата оборудования', 'Нарушение условий договора аренды'] },
            ].map(s => (
              <div key={s.title}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h2>
                <p className="text-gray-600 text-sm mb-2">{s.prefix}</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">{s.list.map(i => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Отмена и возврат</h2>
              <p className="text-gray-600 text-sm leading-relaxed">Отмена бронирования возможна не позднее чем за 24 часа до начала аренды. При отмене менее чем за 24 часа взимается штраф в размере 50% от стоимости аренды.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Форс-мажор</h2>
              <p className="text-gray-600 text-sm leading-relaxed">Стороны освобождаются от ответственности при возникновении обстоятельств непреодолимой силы: стихийных бедствий, военных действий, решений властей и т.д.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Изменение условий</h2>
              <p className="text-gray-600 text-sm leading-relaxed">Мы оставляем за собой право изменять данные условия использования. Актуальная версия всегда доступна на нашем сайте.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Контактная информация</h2>
              <div className="text-gray-600 text-sm space-y-1">
                <p>ООО "ВозьмиМеня"</p>
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
                <p>Адрес: г. Москва, ул. Волжский бульвар, д. 51, строение 15</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Действует с: 22 сентября 2025 года</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
