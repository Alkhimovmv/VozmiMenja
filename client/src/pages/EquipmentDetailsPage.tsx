import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEquipment, useEquipmentById } from '../hooks/useEquipment'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BookingForm from '../components/equipment/BookingForm'
import RelatedCard from '../components/equipment/RelatedCard'
import SEO from '../components/SEO'
import { ArrowLeft, Check, ChevronRight, Shield, Clock } from 'lucide-react'
import { getImageUrl } from '../lib/utils'
import { trackEvent } from '../lib/analytics'
import { getMinimumDailyPrice, getPricingRows } from '../utils/pricing'
import { CONTACT_PHONE, CONTACT_PHONE_LABEL, getTelegramUrl, getWhatsAppUrl } from '../lib/contactLinks'

function getEquipmentModelFaq(name: string) {
  const normalizedName = name.toLowerCase()

  if (normalizedName.includes('partybox 320')) {
    return [
      {
        question: 'Для какой вечеринки подойдет JBL PartyBox 320?',
        answer: 'PartyBox 320 чаще выбирают для квартиры, дачи, дня рождения и небольшой встречи. Если планируются танцы в большом зале, лучше сравнить с PartyBox 710.',
      },
      {
        question: 'Можно ли подключить телефон к PartyBox 320?',
        answer: 'Да, обычно колонку используют с телефоном или ноутбуком. Перед арендой лучше уточнить источник звука и нужен ли микрофон для речи.',
      },
      {
        question: 'На сколько дней брать PartyBox 320?',
        answer: 'Для домашней вечеринки обычно достаточно одного дня. Для дачи, праздника с подготовкой или мероприятия за городом удобнее брать на выходные.',
      },
    ]
  }

  if (normalizedName.includes('partybox 710')) {
    return [
      {
        question: 'Когда лучше взять JBL PartyBox 710?',
        answer: 'PartyBox 710 стоит брать для большого помещения, дачи, танцевальной вечеринки или события, где музыка должна звучать громко и с запасом.',
      },
      {
        question: 'PartyBox 710 подойдет для квартиры?',
        answer: 'Подойдет, но для обычной квартиры часто достаточно PartyBox 320. PartyBox 710 разумнее, когда важен большой запас громкости или помещение крупнее стандартной комнаты.',
      },
      {
        question: 'Что уточнить перед арендой PartyBox 710?',
        answer: 'Напишите площадь, число гостей, будет ли музыка фоном или для танцев, и нужна ли помощь с микрофоном или подключением источника звука.',
      },
    ]
  }

  if (normalizedName.includes('gopro')) {
    return [
      {
        question: 'Для чего лучше взять GoPro?',
        answer: 'GoPro хорошо подходит для активной съемки: поездки, спорт, вода, прогулки, крепления на шлем, велосипед или руку.',
      },
      {
        question: 'GoPro подойдет новичку?',
        answer: 'Да, если нужен простой формат для движения и понятный кадр от первого лица. Для спокойного влога и разговорных видео можно сравнить с DJI Osmo Pocket.',
      },
      {
        question: 'Какие аксессуары нужны к GoPro?',
        answer: 'Зависит от съемки: часто полезны крепления, карта памяти, запасная батарея и внешний микрофон, если нужна речь в кадре.',
      },
    ]
  }

  if (normalizedName.includes('insta360')) {
    return [
      {
        question: 'Когда лучше взять Insta360?',
        answer: 'Insta360 берут для необычных ракурсов, 360-видео, съемки себя в поездке и кадров, где ракурс удобно выбрать уже после съемки.',
      },
      {
        question: 'Insta360 сложнее GoPro?',
        answer: 'Для быстрого простого ролика GoPro обычно понятнее. Insta360 интереснее, если готовы потратить чуть больше времени на выбор ракурса и монтаж.',
      },
      {
        question: 'Подойдет ли Insta360 для путешествия?',
        answer: 'Да, особенно если хочется показать дорогу, окружение и себя без постоянного наведения камеры. Для разговорного влога можно добавить микрофон.',
      },
    ]
  }

  if (normalizedName.includes('osmo')) {
    return [
      {
        question: 'Для чего лучше подходит DJI Osmo Pocket?',
        answer: 'Osmo Pocket удобен для спокойного влога, прогулок, обзоров, мероприятий и разговорных видео, где важна плавная картинка без большой камеры.',
      },
      {
        question: 'Osmo Pocket лучше GoPro для влога?',
        answer: 'Для прогулок, речи и плавной съемки с рук Osmo Pocket часто удобнее. Для спорта, воды и креплений обычно практичнее GoPro.',
      },
      {
        question: 'Нужен ли микрофон к Osmo Pocket?',
        answer: 'Если важна речь, интервью или блог на улице, микрофон лучше добавить сразу. Так звук будет надежнее, чем только со встроенного микрофона.',
      },
    ]
  }

  if (normalizedName.includes('puzzi 8')) {
    return [
      {
        question: 'Для чего подойдет Karcher Puzzi 8/1?',
        answer: 'Puzzi 8/1 чаще берут для одного дивана, кресел, небольшого ковра, матраса или салона автомобиля. Он удобен для домашней химчистки без крупной техники.',
      },
      {
        question: 'Puzzi 8/1 хватит для квартиры?',
        answer: 'Для одной-двух мягких зон обычно хватает. Если нужно пройти много ковров, большой диван или несколько комнат, лучше сравнить с Puzzi 10/1.',
      },
      {
        question: 'Можно ли чистить Puzzi сразу после ремонта?',
        answer: 'Сначала лучше убрать сухую строительную пыль строительным пылесосом. Puzzi нужен для текстиля, а не для сбора гипса или цементной пыли.',
      },
    ]
  }

  if (normalizedName.includes('puzzi 10')) {
    return [
      {
        question: 'Когда лучше взять Karcher Puzzi 10/1?',
        answer: 'Puzzi 10/1 удобнее для большого дивана, нескольких ковров, офиса, клининга квартиры или салона автомобиля, когда работы больше одной-двух зон.',
      },
      {
        question: 'Puzzi 10/1 не будет избыточным для дома?',
        answer: 'Для одного небольшого дивана чаще достаточно Puzzi 8/1. Puzzi 10/1 имеет смысл брать, если нужен запас по объему и длительной работе.',
      },
      {
        question: 'Что написать в заявке на Puzzi 10/1?',
        answer: 'Укажите, что чистите, сколько зон, есть ли сильные пятна и нужна ли подсказка по химии. Так менеджер быстрее подскажет комплект и срок.',
      },
    ]
  }

  if (normalizedName.includes('wd5')) {
    return [
      {
        question: 'Для чего нужен Karcher WD5?',
        answer: 'WD5 берут для сухой строительной пыли, мусора после ремонта, пыли после сверления, шлифовки и уборки твердых поверхностей до влажной уборки.',
      },
      {
        question: 'Можно ли WD5 чистить диван или ковер?',
        answer: 'Нет, для текстиля нужен моющий Puzzi. WD5 собирает сухую пыль и мусор, но не делает экстракционную химчистку ткани.',
      },
      {
        question: 'На сколько дней брать WD5 после ремонта?',
        answer: 'Для небольшой уборки часто хватает одного дня. Для квартиры после ремонта или уборки в несколько этапов лучше планировать 1–2 дня.',
      },
    ]
  }

  if (normalizedName.includes('sc4') || normalizedName.includes('паро')) {
    return [
      {
        question: 'Для чего подойдет Karcher SC4?',
        answer: 'SC4 подходит для кухни, плитки, швов, сантехники и твердых поверхностей, где нужен пар и насадки, а не сбор сухой пыли.',
      },
      {
        question: 'Пароочиститель SC4 заменяет Puzzi?',
        answer: 'Нет. SC4 работает по твердым поверхностям, а Puzzi нужен для диванов, ковров, матрасов и другого текстиля.',
      },
      {
        question: 'Что уточнить перед арендой SC4?',
        answer: 'Напишите поверхности, тип загрязнения, площадь или число помещений. Если задача смешанная, менеджер подскажет, нужен ли еще WD5 или Puzzi.',
      },
    ]
  }

  return null
}

function getEquipmentGuidance(category: string, name: string) {
  const normalizedName = name.toLowerCase()
  const modelFaq = getEquipmentModelFaq(name)

  if (category.includes('Пылесос') || category.includes('клининг')) {
    const isPuzzi = normalizedName.includes('puzzi')
    const isSteam = normalizedName.includes('sc') || normalizedName.includes('паро')
    const isConstruction = normalizedName.includes('wd') || normalizedName.includes('стро')

    return {
      scenarios: isPuzzi
        ? ['Химчистка дивана и кресел', 'Чистка ковров и матрасов', 'Салон автомобиля']
        : isSteam
        ? ['Кухня, плитка и швы', 'Санузел и твердые поверхности', 'Финальная уборка без агрессивной химии']
        : ['Уборка после ремонта', 'Сбор строительной пыли', 'Сухой мусор и крупная грязь'],
      rentalHints: isPuzzi
        ? ['Один диван или салон авто — часто 1 день', 'Квартира с коврами и мебелью — 1–2 дня', 'Клининг нескольких объектов — от 2 дней']
        : isSteam
        ? ['Кухня или санузел — обычно 1 день', 'Квартира целиком — 1–2 дня', 'Сильные загрязнения лучше планировать с запасом времени']
        : isConstruction
        ? ['Небольшая уборка после работ — 1 день', 'Квартира после ремонта — 1–2 дня', 'Большая площадь или несколько этапов — 2–3 дня']
        : ['Разовая уборка — 1 день', 'Несколько зон — 1–2 дня', 'Регулярная задача — выгоднее от недели'],
      included: isPuzzi
        ? ['Проверенный моющий пылесос', 'Шланг и основные насадки', 'Короткая инструкция по запуску', 'Подскажем по химии и порядку чистки']
        : isSteam
        ? ['Проверенный пароочиститель', 'Базовые насадки по комплекту', 'Инструкция по безопасному использованию', 'Поможем понять, подойдет ли пар под поверхность']
        : ['Проверенный строительный пылесос', 'Шланг и базовая насадка', 'Фильтр/мешок — уточним под задачу', 'Инструкция по сбору строительной пыли'],
      questions: isPuzzi
        ? ['Что чистите: диван, ковер, матрас или авто?', 'Сколько зон и есть ли сильные пятна?', 'Нужна ли подсказка по моющему средству?']
        : isSteam
        ? ['Какая поверхность: плитка, кухня, санузел, швы?', 'Есть ли деликатные материалы?', 'Нужна ли доставка в тот же день?']
        : ['Какая пыль: бетон, гипс, дерево или обычный мусор?', 'Какая площадь уборки?', 'Нужен ли сбор крупного мусора или только пыль?'],
      faq: modelFaq || [
        {
          question: `Подойдет ли ${name} для уборки после ремонта?`,
          answer: 'Да, если задача связана со строительной пылью, влажной уборкой или чисткой мебели. Если сомневаетесь, напишите нам: подберем модель под площадь и тип загрязнения.',
        },
        {
          question: 'Что входит в комплект?',
          answer: 'Перед выдачей комплект проверяется. Обычно в аренду входят основные насадки, шланг и инструкция по использованию.',
        },
        {
          question: 'Можно ли взять на один день?',
          answer: 'Да, можно оформить аренду на один календарный день и выбрать одинаковые даты начала и окончания.',
        },
      ],
    }
  }

  if (category.includes('Камер')) {
    return {
      scenarios: ['Путешествия и влоги', 'Съемка мероприятий', 'Reels, Shorts и YouTube-контент'],
      rentalHints: ['Тест перед покупкой — 1 день', 'Поездка или мероприятие — выходные', 'Отпуск и съемочный проект — от недели'],
      included: ['Проверенная камера', 'Зарядка или кабель по комплекту', 'Базовая консультация по сценарию съемки', 'Подскажем крепления и звук под задачу'],
      questions: ['Что снимаете: поездку, спорт, блог или мероприятие?', 'Нужны ли крепления, карта памяти или микрофон?', 'Сколько часов камера должна работать без подзарядки?'],
      faq: modelFaq || [
        {
          question: `Для чего лучше всего подходит ${name}?`,
          answer: 'Камера подходит для съемки видео, поездок, мероприятий и контента для соцсетей. Конкретный формат зависит от модели и условий съемки.',
        },
        {
          question: 'Нужны ли аксессуары?',
          answer: 'Для поездки или съемки на целый день обычно полезны карта памяти, крепления, запасные аккумуляторы и внешний микрофон.',
        },
        {
          question: 'Можно ли получить консультацию перед арендой?',
          answer: 'Да, расскажите задачу, локацию и формат ролика, а мы подскажем камеру и комплект.',
        },
      ],
    }
  }

  if (category.includes('Аудио')) {
    const isPartyBox = normalizedName.includes('partybox') || normalizedName.includes('jbl')

    return {
      scenarios: isPartyBox
        ? ['Домашняя вечеринка', 'Дача и небольшой праздник', 'Музыка для зала или танцев']
        : ['Интервью и подкасты', 'Вечеринки и мероприятия', 'Съемка видео с чистым звуком'],
      rentalHints: isPartyBox
        ? ['Вечеринка дома — обычно 1 день', 'Дача или праздник — выходные', 'Мероприятие с монтажом — лучше взять с запасом на день']
        : ['Интервью или съемка — 1 день', 'Мероприятие — 1–2 дня', 'Серия съемок — выгоднее от недели'],
      included: isPartyBox
        ? ['Проверенная колонка JBL', 'Кабель питания', 'Поможем с подключением телефона или ноутбука', 'Подскажем, нужна ли вторая колонка или микрофон']
        : ['Проверенное аудиооборудование', 'Базовые кабели по комплекту', 'Инструкция по подключению', 'Подскажем комплект под речь, музыку или съемку'],
      questions: isPartyBox
        ? ['Сколько гостей и какая площадь?', 'Музыка нужна фоном или для танцев?', 'Будет ли розетка рядом и нужен ли микрофон?']
        : ['Что записываете: речь, музыку или мероприятие?', 'К чему подключаем: телефон, камера, ноутбук?', 'Будет ли шумная локация?'],
      faq: modelFaq || [
        {
          question: `Хватит ли ${name} для моего мероприятия?`,
          answer: 'Зависит от помещения, количества гостей и задачи: фон, речь или танцы. Опишите формат, и мы поможем выбрать комплект.',
        },
        {
          question: 'Можно ли подключить телефон или ноутбук?',
          answer: 'Для большинства аудиосценариев подключение возможно, но лучше заранее уточнить устройство и нужный формат подключения.',
        },
        {
          question: 'Что проверить перед мероприятием?',
          answer: 'Проверьте питание, место установки, подключение источника звука и нужен ли микрофон для речи.',
        },
      ],
    }
  }

  return {
    scenarios: ['Разовая задача', 'Тест перед покупкой', 'Проект без лишних затрат'],
    rentalHints: ['Разовая задача — 1 день', 'Проект на выходные — 2 дня', 'Долгий тест — от недели'],
    included: ['Проверенное оборудование', 'Базовый комплект для запуска', 'Инструкция по использованию', 'Поддержка при вопросах'],
    questions: ['Для какой задачи берете?', 'На сколько дней нужна техника?', 'Нужны ли доставка и помощь с комплектом?'],
    faq: [
      {
        question: `Можно ли взять ${name} на один день?`,
        answer: 'Да, можно оформить краткосрочную аренду и вернуть оборудование после выполнения задачи.',
      },
      {
        question: 'Поможете выбрать комплект?',
        answer: 'Да, расскажите задачу и срок аренды, а мы предложим подходящий вариант.',
      },
    ],
  }
}

function getCategoryLandingHref(category: string) {
  if (category.includes('Пылесос') || category.includes('клининг')) {
    return '/arenda-pylesosov-moskva'
  }

  if (category.includes('Камер')) {
    return '/arenda-gopro-moskva'
  }

  if (category.includes('Аудио')) {
    return '/arenda-audiooborudovaniya-moskva'
  }

  return '/'
}

function getCategoryGuideHref(category: string, name: string) {
  const normalizedName = name.toLowerCase()

  if (category.includes('Пылесос') || category.includes('клининг')) {
    if (normalizedName.includes('wd5')) {
      return '/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta'
    }

    if (normalizedName.includes('puzzi')) {
      return '/blog/puzzi-8-1-ili-puzzi-10-1-kakoj-moyushchij-pylesos-vzyat'
    }

    return '/blog/kak-pochistit-divan-i-kover-moyushchim-pylesosom'
  }

  if (category.includes('Камер')) {
    if (normalizedName.includes('gopro')) {
      return '/blog/gopro-dlya-nachinayushchih-polnoe-rukovodstvo'
    }

    if (normalizedName.includes('osmo') || normalizedName.includes('insta360')) {
      return '/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360'
    }

    return '/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360'
  }

  if (category.includes('Аудио')) {
    if (normalizedName.includes('mic')) {
      return '/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2'
    }

    if (normalizedName.includes('partybox')) {
      return '/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu'
    }

    return '/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu'
  }

  return '/blog'
}

export default function EquipmentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useEquipmentById(id!)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const equipment = data?.data
  const { data: relatedData } = useEquipment(
    equipment ? { limit: 3, category: equipment.category } : undefined
  )
  const related = (relatedData?.data || []).filter((e) => e.id !== equipment?.id).slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !data?.success || !equipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-lg">Ошибка загрузки</div>
        <div className="text-gray-500">Оборудование не найдено</div>
        <Link to="/" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Вернуться к каталогу
        </Link>
      </div>
    )
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const getMinPrice = () => getMinimumDailyPrice(equipment.pricing, equipment.pricePerDay)
  const pricingTiers = getPricingRows(equipment.pricing)

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Аренда ${equipment.name}`,
    description: equipment.description,
    image: equipment.images.map((img) => `https://vozmimenya.ru${getImageUrl(img)}`),
    category: equipment.category,
    brand: { '@type': 'Brand', name: equipment.name.split(' ')[0] },
    itemCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      url: `https://vozmimenya.ru/equipment/${equipment.id}`,
      priceCurrency: 'RUB',
      price: getMinPrice(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: equipment.availableQuantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/LimitedAvailability',
      seller: {
        '@type': 'LocalBusiness',
        name: 'ВозьмиМеня',
        telephone: '+79933636464',
        address: { '@type': 'PostalAddress', addressLocality: 'Москва', addressCountry: 'RU' },
        url: 'https://vozmimenya.ru',
      },
      areaServed: { '@type': 'City', name: 'Москва' },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: getMinPrice(),
        priceCurrency: 'RUB',
        unitText: 'сутки',
      },
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '412' },
  }

  const minPrice = getMinPrice()
  const guidance = getEquipmentGuidance(equipment.category, equipment.name)
  const categoryLandingHref = getCategoryLandingHref(equipment.category)
  const categoryGuideHref = getCategoryGuideHref(equipment.category, equipment.name)
  const quickMessage = `Здравствуйте! Хочу арендовать ${equipment.name}. Страница: https://vozmimenya.ru/equipment/${equipment.id}`
  const copyQuickMessage = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(quickMessage).catch(() => undefined)
  }
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guidance.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  const seoTitle = `Аренда ${equipment.name} в Москве | от ${formatPrice(minPrice)}/сутки | Доставка в день заказа | ВозьмиМеня`
  const seoDescription = `Аренда ${equipment.name} в Москве от ${formatPrice(minPrice)}/сутки | Доставка в день заказа | Постамат 24/7 | Подбор и бронь через Telegram`
  const seoKeywords = `аренда ${equipment.name}, прокат ${equipment.name}, ${equipment.name} аренда Москва, взять в аренду ${equipment.name}, ${equipment.category} аренда Москва, прокат ${equipment.category}`

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={equipment.images[0] ? `https://vozmimenya.ru${getImageUrl(equipment.images[0])}` : undefined}
        url={`https://vozmimenya.ru/equipment/${equipment.id}`}
        type="product"
        structuredData={[productStructuredData, faqStructuredData]}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-line">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Link to="/" className="hover:text-ink transition-colors">Главная</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={categoryLandingHref} className="hover:text-ink transition-colors">
              {equipment.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink truncate">{equipment.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Left: Images ── */}
          <div>
            <div className="bg-white rounded-2xl border border-line overflow-hidden mb-3 aspect-[4/3]">
              <img
                src={getImageUrl(equipment.images[selectedImage])}
                alt={equipment.name}
                className="w-full h-full object-contain bg-white"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
            {equipment.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {equipment.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-line hover:border-muted'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${equipment.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div>
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2">{equipment.name}</h1>

            {/* Status badge */}
            <div className="mb-6 text-sm text-muted">
              Доступность подтвердим после выбора дат
            </div>

            {/* Pricing card */}
            <div className="bg-white rounded-2xl border border-line p-5 mb-4">
              {/* Main price */}
              <div className="flex items-start justify-between mb-1">
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Цена за сутки</p>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-muted">ОТ</p>
                  <p className="text-primary font-bold text-sm">{formatPrice(getMinPrice())}/сут</p>
                  <p className="text-[10px] text-muted">при аренде на месяц</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-ink mb-5">{formatPrice(equipment.pricePerDay)}</p>

              {/* Pricing tiers */}
              {pricingTiers.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-ink uppercase tracking-widest">Тарифы</p>
                    <p className="text-xs text-muted">чем дольше — тем дешевле</p>
                  </div>
                  <div className="space-y-2">
                    {pricingTiers.map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted">{tier.label}</span>
                        <span className="font-bold text-ink">
                          {formatPrice(tier.value)}{tier.suffix}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Book button */}
              <button
                onClick={() => {
                  trackEvent('booking_open', { equipment_id: equipment.id, equipment_name: equipment.name, source: 'equipment_page' })
                  setShowBookingForm(true)
                }}
                className="w-full mt-5 py-4 px-6 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
              >
                Забронировать
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Гарантия чистоты
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Перезвоним за 15 мин
                </span>
              </div>

              {/* Conditions hint */}
              <div className="mt-3 text-center text-xs text-muted">
                Для получения потребуется фото паспорта.{' '}
                <a href="/delivery" className="text-[#2563EB] hover:underline">Условия аренды →</a>
              </div>
            </div>

            {/* Phone CTA */}
            <div className="rounded-2xl bg-ink p-5">
              <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">Быстро уточнить наличие</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  onClick={() => trackEvent('phone_click', { source: 'equipment_page', equipment_id: equipment.id })}
                  className="text-xl font-bold text-white transition-opacity hover:opacity-90"
                >
                  {CONTACT_PHONE_LABEL}
                </a>
                <div className="flex gap-2">
                  <a
                    href={getTelegramUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      copyQuickMessage()
                      trackEvent('telegram_click', { source: 'equipment_page', equipment_id: equipment.id })
                    }}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-slate-100"
                  >
                    Telegram
                  </a>
                  <a
                    href={getWhatsAppUrl(quickMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click', { source: 'equipment_page', equipment_id: equipment.id })}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                При клике на Telegram скопируем короткий текст заявки со ссылкой на эту страницу.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Для каких задач подходит</h2>
            <div className="space-y-3">
              {guidance.scenarios.map((scenario) => (
                <div key={scenario} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {scenario}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Обычно берут на</h2>
            <div className="space-y-3">
              {guidance.rentalHints.map((hint) => (
                <div key={hint} className="flex items-center gap-2 text-sm text-muted">
                  <Clock className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                  {hint}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Что уточнить менеджеру</h2>
            <div className="space-y-3">
              {guidance.questions.map((question) => (
                <div key={question} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {question}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Частые вопросы</h2>
            <div className="space-y-4">
              {guidance.faq.map((item) => (
                <div key={item.question}>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.question}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-line p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink mb-2">Не уверены, подойдет ли эта модель?</h2>
              <p className="text-sm text-muted leading-relaxed max-w-2xl">
                Посмотрите подборку по категории или откройте короткий гид: так проще выбрать оборудование под задачу и срок аренды.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={categoryLandingHref} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
                Все варианты
              </Link>
              <Link to={categoryGuideHref} className="px-4 py-2 bg-[#F8FAFC] text-gray-700 rounded-xl text-sm font-semibold border border-line hover:text-[#2563EB] transition-colors">
                Как выбрать
              </Link>
            </div>
          </div>
        </div>

        {/* ── Description + Specs below ── */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">Описание</h2>
            <p className="text-muted leading-relaxed">{equipment.description}</p>

            {/* What's included */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-ink mb-3">Что входит в аренду</h3>
              <div className="space-y-2">
                {guidance.included.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {Object.keys(equipment.specifications).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-ink mb-4">Характеристики</h2>
              <div className="space-y-1">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2.5 border-b border-line last:border-0 text-sm">
                    <span className="text-muted">{key}</span>
                    <span className="text-ink font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-ink mb-6">Похожие модели</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <RelatedCard key={item.id} equipment={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showBookingForm && (
        <BookingForm equipment={equipment} onClose={() => setShowBookingForm(false)} />
      )}

      <div
        className="fixed left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden"
        style={{ bottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex max-w-md gap-2">
          <button
            type="button"
            onClick={() => {
              trackEvent('booking_open', { equipment_id: equipment.id, equipment_name: equipment.name, source: 'equipment_sticky_bar' })
              setShowBookingForm(true)
            }}
            className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white active:scale-[0.99]"
          >
            Забронировать
          </button>
          <a
            href={getTelegramUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              copyQuickMessage()
              trackEvent('telegram_click', { source: 'equipment_sticky_bar', equipment_id: equipment.id })
            }}
            className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 active:scale-[0.99]"
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  )
}
