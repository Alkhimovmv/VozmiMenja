export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Политика конфиденциальности</h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Мы заботимся о защите ваших персональных данных
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
                Настоящая Политика конфиденциальности регулирует порядок обработки и использования
                персональных данных пользователей сервиса ВозьмиМеня. Используя наш сервис, вы
                соглашаетесь с условиями данной политики.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Сбор персональных данных</h2>
              <p className="text-gray-700 mb-4">Мы собираем следующие категории персональных данных:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Контактная информация (имя, телефон, email)</li>
                <li>Данные о бронированиях и предпочтениях</li>
                <li>Техническая информация (IP-адрес, тип браузера)</li>
                <li>Информация об использовании сервиса</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Цели обработки данных</h2>
              <p className="text-gray-700 mb-4">Ваши персональные данные используются для:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Обработки заявок на аренду оборудования</li>
                <li>Связи с вами по вопросам заказов</li>
                <li>Улучшения качества сервиса</li>
                <li>Отправки уведомлений и информации</li>
                <li>Соблюдения правовых требований</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Хранение и защита данных</h2>
              <p className="text-gray-700 mb-6">
                Мы применяем современные методы защиты информации, включая шифрование данных,
                ограничение доступа и регулярное обновление систем безопасности. Персональные
                данные хранятся только в течение необходимого периода.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Передача данных третьим лицам</h2>
              <p className="text-gray-700 mb-6">
                Мы не передаем ваши персональные данные третьим лицам без вашего согласия,
                за исключением случаев, предусмотренных законодательством или необходимых
                для выполнения услуг (например, службы доставки).
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Ваши права</h2>
              <p className="text-gray-700 mb-4">Вы имеете право:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Получать информацию об обработке ваших данных</li>
                <li>Исправлять неточные данные</li>
                <li>Удалять ваши персональные данные</li>
                <li>Ограничивать обработку данных</li>
                <li>Отозвать согласие на обработку данных</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Файлы cookie</h2>
              <p className="text-gray-700 mb-6">
                Наш сайт использует файлы cookie для улучшения пользовательского опыта,
                анализа трафика и персонализации контента. Вы можете управлять настройками
                cookie в вашем браузере.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Изменения в политике</h2>
              <p className="text-gray-700 mb-6">
                Мы оставляем за собой право изменять данную политику конфиденциальности.
                О значительных изменениях мы уведомим вас заранее.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Контактная информация</h2>
              <p className="text-gray-700 mb-2">
                По вопросам обработки персональных данных обращайтесь:
              </p>
              <div className="text-gray-700">
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
                <p>Адрес: г. Москва, ул. Федора Полетаева, д. 15, корпус 3</p>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Последнее обновление: 22 сентября 2025 года
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}