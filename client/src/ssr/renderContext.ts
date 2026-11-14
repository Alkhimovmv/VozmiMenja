import { createContext, useContext } from 'react'

export interface RenderEnvironment {
  nowIso: string
}

export const RenderEnvironmentContext = createContext<RenderEnvironment>({
  nowIso: '1970-01-01T00:00:00.000Z',
})

export const useRenderEnvironment = () => useContext(RenderEnvironmentContext)
