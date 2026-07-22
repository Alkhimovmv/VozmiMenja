import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
})

const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    lineHeight: 1.5,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 36,
    color: '#1a1a1a',
  },
  center: { textAlign: 'center' },
  small: { fontSize: 8, color: '#666' },
  bold: { fontWeight: 700 },
  title: { fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 2 },
  sectionTitle: { fontSize: 9.5, fontWeight: 700, marginBottom: 4, marginTop: 10 },
  p: { marginBottom: 3 },
  row: { flexDirection: 'row', gap: 4 },
  label: { color: '#555', width: 90 },
  line: { borderBottomWidth: 0.5, borderBottomColor: '#999', flex: 1, marginBottom: 1 },
  lineFixed: { borderBottomWidth: 0.5, borderBottomColor: '#999', width: 100 },
  lineShort: { borderBottomWidth: 0.5, borderBottomColor: '#999', width: 60 },
  ul: { marginLeft: 10, marginBottom: 2 },
  li: { marginBottom: 2 },
  grid2: { flexDirection: 'row', gap: 20 },
  col: { flex: 1 },
  sigRow: { flexDirection: 'row', gap: 20, marginTop: 14 },
  sigBlock: { flex: 1 },
  sigLabel: { fontSize: 7.5, color: '#666', marginBottom: 2 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: '#555', height: 18 },
  footer: { fontSize: 7, color: '#aaa', marginTop: 12, textAlign: 'center' },
  divider: { borderTopWidth: 0.5, borderTopColor: '#e0e0e0', marginVertical: 6 },
  infoBox: { backgroundColor: '#f5f5f5', padding: 6, borderRadius: 3, marginBottom: 6 },
})

export default function RentalAgreementPDF() {
  return (
    <Document title="Договор аренды оборудования">
      <Page size="A4" style={s.page}>

        {/* Шапка */}
        <Text style={[s.small, s.center]}>г. Москва</Text>
        <Text style={s.title}>ДОГОВОР АРЕНДЫ ОБОРУДОВАНИЯ № ______</Text>
        <Text style={[s.small, s.center, { marginBottom: 8 }]}>«______» ________________ 20____ г.</Text>

        <View style={s.divider} />

        {/* Преамбула */}
        <Text style={[s.p, { marginTop: 6 }]}>
          Индивидуальный предприниматель <Text style={s.bold}>Алхимова Софья Вадимовна</Text>, ОГРНИП 326670000005031, ИНН 672403445744, именуемая в дальнейшем <Text style={s.bold}>«Арендодатель»</Text>, с одной стороны, и{' '}
          <Text>_________________________________________________________________________________________</Text>,{' '}
          именуемый(-ая) в дальнейшем <Text style={s.bold}>«Арендатор»</Text>, с другой стороны, вместе именуемые <Text style={s.bold}>«Стороны»</Text>, заключили настоящий Договор о нижеследующем.
        </Text>

        {/* 1. Предмет */}
        <Text style={s.sectionTitle}>1. ПРЕДМЕТ ДОГОВОРА</Text>
        <Text style={s.p}>1.1. Арендодатель передаёт Арендатору во временное пользование следующее оборудование (далее — <Text style={s.bold}>Оборудование</Text>):</Text>
        <View style={[s.infoBox]}>
          <View style={s.row}>
            <Text style={s.label}>Наименование:</Text>
            <View style={s.line} />
          </View>
        </View>
        <Text style={s.p}>1.2. Оборудование используется Арендатором строго по назначению.</Text>

        {/* 2. Срок */}
        <Text style={s.sectionTitle}>2. СРОК АРЕНДЫ</Text>
        <Text style={s.p}>
          2.1. Срок аренды: с «____» __________ 20__ г.{'   '}по «____» __________ 20__ г.
        </Text>
        <View style={[s.row, { marginBottom: 3 }]}>
          <Text>2.2. Время возврата Оборудования: </Text>
          <View style={s.lineShort} />
          <Text> ч. </Text>
          <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#999', width: 30 }} />
          <Text> мин.</Text>
        </View>
        <Text style={s.p}>2.3. Срок может быть продлён по письменному согласию Сторон до истечения первоначального срока.</Text>

        {/* 3. Стоимость */}
        <Text style={s.sectionTitle}>3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ</Text>
        <View style={[s.row, { marginBottom: 3 }]}>
          <Text>3.1. Итоговая сумма за весь срок: </Text>
          <View style={s.lineFixed} />
          <Text> руб.</Text>
        </View>
        <Text style={s.p}>3.2. Оплата производится наличными, банковским переводом или по ссылке картой в момент получения Оборудования.</Text>
        <View style={[s.row, { marginBottom: 3 }]}>
          <Text>3.3. Залог: </Text>
          <View style={s.lineShort} />
          <Text> руб. Возвращается при возврате Оборудования в исправном и чистом состоянии.</Text>
        </View>

        {/* 4. Обязанности */}
        <Text style={s.sectionTitle}>4. ПРАВА И ОБЯЗАННОСТИ СТОРОН</Text>
        <Text style={[s.p, s.bold]}>Арендодатель обязуется:</Text>
        <View style={s.ul}>
          <Text style={s.li}>— передать Оборудование в исправном состоянии;</Text>
          <Text style={s.li}>— вернуть залог при соблюдении условий договора.</Text>
        </View>
        <Text style={[s.p, s.bold]}>Арендатор обязуется:</Text>
        <View style={s.ul}>
          <Text style={s.li}>— использовать Оборудование строго по назначению;</Text>
          <Text style={s.li}>— не передавать Оборудование третьим лицам без письменного согласия Арендодателя;</Text>
          <Text style={s.li}>— немедленно уведомить Арендодателя о неисправности или повреждении;</Text>
          <Text style={s.li}>— вернуть Оборудование в срок, в исправном и чистом состоянии, в полной комплектации.</Text>
        </View>

        {/* 5. Ответственность */}
        <Text style={s.sectionTitle}>5. ОТВЕТСТВЕННОСТЬ СТОРОН</Text>
        <Text style={s.p}>5.1. Арендатор несёт полную материальную ответственность за утрату, хищение или повреждение Оборудования с момента его получения до возврата.</Text>
        <Text style={s.p}>5.2. При возврате Оборудования в ненадлежащем <Text style={s.bold}>санитарном состоянии</Text> (загрязнённым) взимается штраф <Text style={s.bold}>5 000 (пять тысяч) рублей</Text>.</Text>
        <Text style={s.p}>5.3. При <Text style={s.bold}>просрочке возврата</Text> начисляется пеня в размере <Text style={s.bold}>двойной суточной ставки</Text> за каждые начатые сутки просрочки. Арендатору предоставляется 2 часа на форс-мажорные обстоятельства без штрафных санкций.</Text>
        <Text style={s.p}>5.4. При <Text style={s.bold}>отмене бронирования менее чем за 24 часа</Text> до начала аренды взимается штраф <Text style={s.bold}>50% от стоимости</Text> аренды.</Text>
        <Text style={s.p}>5.5. Уплата пени не освобождает Арендатора от исполнения обязательства по возврату Оборудования.</Text>
        <Text style={s.p}>5.6. Ответственность за вред, причинённый третьим лицам при использовании Оборудования, несёт Арендатор.</Text>

        {/* 6. Прочие */}
        <Text style={s.sectionTitle}>6. ПРОЧИЕ УСЛОВИЯ</Text>
        <Text style={s.p}>6.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.</Text>
        <Text style={s.p}>6.2. Споры разрешаются путём переговоров. При невозможности — в суде по месту нахождения Арендодателя.</Text>
        <Text style={s.p}>6.3. Во всём, что не предусмотрено настоящим Договором, Стороны руководствуются действующим законодательством РФ.</Text>
        <Text style={s.p}>6.4. Договор составлен в двух экземплярах, имеющих равную юридическую силу.</Text>

        {/* 7. Реквизиты */}
        <Text style={s.sectionTitle}>7. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</Text>
        <View style={s.grid2}>
          {/* Арендодатель */}
          <View style={s.col}>
            <Text style={[s.bold, { marginBottom: 3 }]}>Арендодатель:</Text>
            <Text style={s.p}>ИП Алхимова Софья Вадимовна</Text>
            <Text style={s.p}>ОГРНИП: 326670000005031</Text>
            <Text style={s.p}>ИНН: 672403445744</Text>
            <Text style={s.p}>Рег. орган: Межрайонная ИФНС России по Смоленской области</Text>
            <Text style={s.p}>Адрес: 216400, Смоленская обл., г. Десногорск, мкр. 4, д. 18, сек. 2, кв. 81</Text>
            <Text style={s.p}>Р/с: 40802810600009319726</Text>
            <Text style={s.p}>Банк: АО «ТБанк»</Text>
            <Text style={s.p}>БИК: 044525974</Text>
            <Text style={s.p}>К/с: 30101810145250000974</Text>
            <Text style={s.p}>Тел.: +7 (993) 363-64-64</Text>
            <Text style={s.p}>Email: alkhimovmv@yandex.ru</Text>
          </View>

          {/* Арендатор */}
          <View style={s.col}>
            <Text style={[s.bold, { marginBottom: 3 }]}>Арендатор:</Text>
            <View style={{ marginBottom: 5 }}>
              <Text style={s.sigLabel}>ФИО</Text>
              <View style={s.sigLine} />
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={s.sigLabel}>Паспорт: серия и номер</Text>
              <View style={s.sigLine} />
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={s.sigLabel}>Прописка</Text>
              <View style={s.sigLine} />
              <View style={[s.sigLine, { marginTop: 5 }]} />
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={s.sigLabel}>Телефон</Text>
              <View style={s.sigLine} />
            </View>
          </View>
        </View>

        {/* Подписи */}
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Подпись Арендодателя / Печать</Text>
            <View style={s.sigLine} />
          </View>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Подпись Арендатора</Text>
            <View style={s.sigLine} />
          </View>
        </View>

        <Text style={s.footer}>Типовая форма договора ИП Алхимовой С.В. Редакция от 9 мая 2026 года.</Text>
      </Page>
    </Document>
  )
}
