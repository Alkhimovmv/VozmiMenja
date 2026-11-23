import type { ReactNode } from 'react'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'

export interface BufferedRenderResult {
  html: string
  errors: Error[]
}

export function renderBufferedStream(node: ReactNode, timeoutMs = 8_000): Promise<BufferedRenderResult> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const errors: Error[] = []
    let finished = false

    const finishWithError = (error: unknown) => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      reject(error instanceof Error ? error : new Error(String(error)))
    }

    const { pipe, abort } = renderToPipeableStream(node, {
      onAllReady() {
        const output = new PassThrough()
        output.on('data', (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        output.on('error', finishWithError)
        output.on('end', () => {
          if (finished) return
          finished = true
          clearTimeout(timeout)
          resolve({ html: Buffer.concat(chunks).toString('utf8'), errors })
        })
        pipe(output)
      },
      onShellError: finishWithError,
      onError(error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
      },
    })

    const timeout = setTimeout(() => {
      abort()
      finishWithError(new Error(`SSR render timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })
}
