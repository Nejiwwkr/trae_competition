import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useTilt(element: Ref<HTMLElement | null>, maxDegrees = 7) {
  let reduced = false
  let frame = 0

  const reset = () => {
    const node = element.value
    if (!node) return
    cancelAnimationFrame(frame)
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')
    node.style.setProperty('--glow-x', '50%')
    node.style.setProperty('--glow-y', '50%')
  }

  const onMove = (event: PointerEvent) => {
    const node = element.value
    if (!node || reduced || event.pointerType === 'touch') return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      node.style.setProperty('--tilt-y', `${x * maxDegrees * 2}deg`)
      node.style.setProperty('--tilt-x', `${-y * maxDegrees * 2}deg`)
      node.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
      node.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`)
    })
  }

  onMounted(() => {
    const node = element.value
    if (!node) return
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', reset)
  })

  onBeforeUnmount(() => {
    const node = element.value
    if (node) {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', reset)
    }
    cancelAnimationFrame(frame)
  })

  return { reset }
}
