export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Политика конфиденциальности</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Мы заботимся о защите ваших персональных данных</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-sm text-gray-600 leading-relaxed">

            <div className="bg-blue-50 rounded-xl p-4 text-blue-800 text-sm">
              Настоящая Политика конфиденциальности регулирует порядок обработки и использования персональных данных пользователей сервиса ВозьмиМеня (ИП Алхимова С.В.). Используя наш сервис, вы соглашаетесь с условиями данной политики.
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Какие данные мы собираем</h2>
              <p className="mb-2">Для оформления аренды нам необходимы следующие данные:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>ФИО</strong> — для идентификации арендатора</li>
                <li><strong>Номер телефона</strong> — для связи и подтверждения заявки</li>
                <li><strong>Скан первой страницы паспорта</strong> (фото, ФИО, дата рождения) — для проверки личности</li>
                <li><strong>Скан страницы с пропиской</strong> — для подтверждения места регистрации</li>
                <li>Контактный email (при наличии)</li>
              </ul>
              <div className="mt-3 bg-gray-50 rounded-xl p-4 text-gray-500 text-xs">
                На скане паспорта вы можете сделать пометку «Не для использования» — это абсолютно допустимо и не препятствует проверке. Данные запрашиваются исключительно для верификации личности и отправки оборудования.
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Цели обработки данных</h2>
              <p className="mb-2">Ваши персональные данные используются исключительно для:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Проверки личности арендатора перед выдачей оборудования</li>
                <li>Оформления договора аренды</li>
                <li>Связи с вами по вопросам текущего заказа</li>
                <li>Выдачи временного кода доступа к постамату и офису</li>
                <li>Соблюдения требований законодательства РФ</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Хранение и удаление данных</h2>
              <p>После окончания аренды и урегулирования всех вопросов ваши персональные данные <strong>удаляются из системы</strong>. Мы не храним копии документов дольше, чем это необходимо для выполнения договора аренды.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Защита данных</h2>
              <p>Мы применяем современные методы защиты информации: ограничение доступа, хранение данных в защищённых системах. Ни один сотрудник не передаёт ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законодательством.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Ваши права</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Получать информацию об обработке ваших данных</li>
                <li>Исправлять неточные данные</li>
                <li>Требовать удаления персональных данных</li>
                <li>Отозвать согласие на обработку в любой момент</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Файлы cookie</h2>
              <p>Наш сайт использует файлы cookie для улучшения пользовательского опыта и анализа трафика. Вы можете управлять настройками cookie в вашем браузере.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Контактная информация</h2>
              <p className="mb-2">По вопросам обработки персональных данных обращайтесь:</p>
              <div className="space-y-1">
                <p><strong>ИП Алхимова Софья Вадимовна</strong></p>
                <p>ОГРНИП: 326670000005031, ИНН: 672403445744</p>
                <p>Email: alkhimovmv@yandex.ru</p>
                <p>Телефон: +7 (993) 363-64-64</p>
                <p>Адрес: 216400, Смоленская обл., г. Десногорск, мкр. 4, д. 18, сек. 2, кв. 81</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Последнее обновление: 9 мая 2026 года</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
