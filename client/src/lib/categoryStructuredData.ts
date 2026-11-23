import type { Equipment } from '../types'
import { getImageUrl } from './utils'

export const buildCategoryItemList = (equipment: Equipment[] = []) => ({
  '@type': 'ItemList',
  itemListElement: equipment.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: item.name,
      url: `https://vozmimenya.ru/equipment/${item.slug || item.id}`,
      image: item.images[0] ? getImageUrl(item.images[0]) : undefined,
      offers: {
        '@type': 'Offer',
        price: item.pricePerDay,
        priceCurrency: 'RUB',
      },
    },
  })),
})
