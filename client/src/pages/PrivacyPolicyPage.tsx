export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Политика конфиденциальности</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Мы заботимся о защите ваших персональных данных</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            {[
              { title: '1. Общие положения', content: 'Настоящая Политика конфиденциальности регулирует порядок обработки и использования персональных данных пользователей сервиса ВозьмиМеня. Используя наш сервис, вы соглашаетесь с условиями данной политики.' },
              { title: '2. Сбор персональных данных', list: ['Контактная информация (имя, телефон, email)', 'Данные о бронированиях и предпочтениях', 'Техническая информация (IP-адрес, тип браузера)', 'Информация об использовании сервиса'], prefix: 'Мы собираем следующие категории персональных данных:' },
              { title: '3. Цели обработки данных', list: ['Обработки заявок на аренду оборудования', 'Связи с вами по вопросам заказов', 'Улучшения качества сервиса', 'Отправки уведомлений и информации', 'Соблюдения правовых требований'], prefix: 'Ваши персональные данные используются для:' },
              { title: '4. Хранение и защита данных', content: 'Мы применяем современные методы защиты информации, включая шифрование данных, ограничение доступа и регулярное обновление систем безопасности. Персональные данные хранятся только в течение необходимого периода.' },
              { title: '5. Передача данных третьим лицам', content: 'Мы не передаем ваши персональные данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законодательством или необходимых для выполнения услуг (например, службы доставки).' },
              { title: '6. Ваши права', list: ['Получать информацию об обработке ваших данных', 'Исправлять неточные данные', 'Удалять ваши персональные данные', 'Ограничивать обработку данных', 'Отозвать согласие на обработку данных'], prefix: 'Вы имеете право:' },
              { title: '7. Файлы cookie', content: 'Наш сайт использует файлы cookie для улучшения пользовательского опыта, анализа трафика и персонализации контента. Вы можете управлять настройками cookie в вашем браузере.' },
              { title: '8. Изменения в политике', content: 'Мы оставляем за собой право изменять данную политику конфиденциальности. О значительных изменениях мы уведомим вас заранее.' },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                {section.prefix && <p className="text-gray-600 text-sm mb-2">{section.prefix}</p>}
                {section.content && <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                    {section.list.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Контактная информация</h2>
              <p className="text-gray-600 text-sm mb-2">По вопросам обработки персональных данных обращайтесь:</p>
              <div className="text-gray-600 text-sm space-y-1">
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
                <p>Адрес: г. Москва, ул. Волжский бульвар, д. 51, строение 15</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Последнее обновление: 22 сентября 2025 года</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
