import type { ReactNode } from 'react'
import { RenderEnvironmentContext, type RenderEnvironment } from './renderContext'

export function RenderEnvironmentProvider({
  value,
  children,
}: {
  value: RenderEnvironment
  children: ReactNode
}) {
  return (
    <RenderEnvironmentContext.Provider value={value}>
      {children}
    </RenderEnvironmentContext.Provider>
  )
}
