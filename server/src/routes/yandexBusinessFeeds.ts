import { Router } from 'express'
import type { Equipment } from '../models/Equipment'
import { equipmentModel } from '../models/Equipment'
import type { RentalEquipment } from '../models/RentalEquipment'
import { rentalEquipmentModel } from '../models/RentalEquipment'
import {
  buildYandexBusinessFeed,
  getYandexBusinessLocation,
} from '../services/yandexBusinessFeed'

interface YandexBusinessFeedDependencies {
  loadEquipment: () => Promise<Equipment[]>
  loadInventory: (officeId: number) => Promise<RentalEquipment[]>
}

const defaultDependencies: YandexBusinessFeedDependencies = {
  loadEquipment: async () => (await equipmentModel.findAll({ page: 1, limit: 10000 })).data,
  loadInventory: async (officeId) => rentalEquipmentModel.findAll(officeId),
}

export const createYandexBusinessFeedsRouter = (
  dependencies: YandexBusinessFeedDependencies = defaultDependencies,
): Router => {
  const router = Router()

  router.get('/:slug.yml', async (req, res) => {
    let location
    try {
      location = getYandexBusinessLocation(req.params.slug)
    } catch {
      return res.status(404).json({ success: false, message: 'Feed not found' })
    }

    try {
      const [equipment, inventory] = await Promise.all([
        dependencies.loadEquipment(),
        dependencies.loadInventory(location.officeId),
      ])
      const feed = buildYandexBusinessFeed({
        location,
        equipment,
        inventory,
        onDiagnostic: (diagnostic) => console.warn(
          `Excluded equipment ${diagnostic.equipmentId} from Yandex Business feed ${location.slug}: ${diagnostic.reason}`
        ),
      })

      return res
        .set('Cache-Control', 'public, max-age=300')
        .type('application/xml')
        .send(feed)
    } catch (error) {
      console.error(`Failed to generate Yandex Business feed for ${location.slug}:`, error)
      return res.status(500).json({ success: false, message: 'Feed generation failed' })
    }
  })

  return router
}

export default createYandexBusinessFeedsRouter()
