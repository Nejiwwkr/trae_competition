import { ref } from 'vue'
import { toPng } from 'html-to-image'

export function useShareImage() {
  const exporting = ref(false)
  const error = ref<string | null>(null)

  async function waitForImages(node: HTMLElement) {
    const images = [...node.querySelectorAll('img')]
    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          })
        }
        if (typeof image.decode === 'function') {
          await image.decode().catch(() => undefined)
        }
      }),
    )
  }

  async function exportNode(
    node: HTMLElement,
    filename: string,
    options: { pixelRatio?: number } = {},
  ) {
    exporting.value = true
    error.value = null
    try {
      if (document.fonts?.ready) await document.fonts.ready
      await waitForImages(node)
      const dataUrl = await toPng(node, {
        pixelRatio: options.pixelRatio ?? 2,
        backgroundColor: '#0a0c10',
        cacheBust: true,
        skipAutoScale: true,
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      throw cause
    } finally {
      exporting.value = false
    }
  }

  return { exporting, error, exportNode }
}
