export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Условия использования</h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Правила пользования сервисом ВозьмиМеня
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Общие положения</h2>
              <p className="text-gray-700 mb-6">
                Данные условия использования регулируют отношения между ООО "ВозьмиМеня" и
                пользователями сервиса аренды оборудования. Используя наш сервис, вы принимаете
                данные условия в полном объеме.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Описание услуг</h2>
              <p className="text-gray-700 mb-4">ВозьмиМеня предоставляет следующие услуги:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Аренда профессионального оборудования</li>
                <li>Техническая поддержка и консультации</li>
                <li>Доставка и самовывоз оборудования</li>
                <li>Обслуживание и настройка техники</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Регистрация и аккаунт</h2>
              <p className="text-gray-700 mb-4">Для использования сервиса необходимо:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Предоставить достоверную контактную информацию</li>
                <li>Быть совершеннолетним или иметь согласие родителей</li>
                <li>Соблюдать конфиденциальность данных доступа</li>
                <li>Уведомлять об изменениях в контактных данных</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Условия аренды</h2>
              <div className="mb-6 text-gray-700">
                <h3 className="text-lg font-semibold mb-3">4.1. Бронирование</h3>
                <p className="mb-3">
                  Бронирование осуществляется через сайт или по телефону. Подтверждение
                  бронирования происходит в течение 2 часов.
                </p>

                <h3 className="text-lg font-semibold mb-3">4.2. Оплата</h3>
                <p className="mb-3">
                  Оплата производится наличными при получении или банковской картой на сайте.
                  Возможна безналичная оплата для юридических лиц.
                </p>

                <h3 className="text-lg font-semibold mb-3">4.3. Залог</h3>
                <p className="mb-3">
                  За некоторые виды оборудования взимается залог, который возвращается
                  при возврате техники в исправном состоянии.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Права и обязанности сторон</h2>
              <div className="mb-6 text-gray-700">
                <h3 className="text-lg font-semibold mb-3">5.1. Обязанности арендатора</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Бережно относиться к арендованному оборудованию</li>
                  <li>Использовать технику по назначению</li>
                  <li>Возвращать оборудование в срок</li>
                  <li>Сообщать о неисправностях немедленно</li>
                  <li>Не передавать оборудование третьим лицам</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">5.2. Обязанности арендодателя</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Предоставлять исправное оборудование</li>
                  <li>Обеспечивать техническую поддержку</li>
                  <li>Соблюдать сроки доставки</li>
                  <li>Предоставлять инструкции по эксплуатации</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Ответственность</h2>
              <p className="text-gray-700 mb-4">
                Арендатор несет полную материальную ответственность за:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Утрату или кражу оборудования</li>
                <li>Повреждения, вызванные неправильной эксплуатацией</li>
                <li>Просрочку возврата оборудования</li>
                <li>Нарушение условий договора аренды</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Отмена и возврат</h2>
              <p className="text-gray-700 mb-6">
                Отмена бронирования возможна не позднее чем за 24 часа до начала аренды.
                При отмене менее чем за 24 часа взимается штраф в размере 50% от стоимости аренды.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Форс-мажор</h2>
              <p className="text-gray-700 mb-6">
                Стороны освобождаются от ответственности при возникновении обстоятельств
                непреодолимой силы: стихийных бедствий, военных действий, решений властей и т.д.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Изменение условий</h2>
              <p className="text-gray-700 mb-6">
                Мы оставляем за собой право изменять данные условия использования.
                Актуальная версия всегда доступна на нашем сайте.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Контактная информация</h2>
              <div className="text-gray-700">
                <p>ООО "ВозьмиМеня"</p>
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
                <p>Адрес: г. Москва, ул. Волжский бульвар, д. 51, строение 15</p>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Действует с: 22 сентября 2025 года
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}