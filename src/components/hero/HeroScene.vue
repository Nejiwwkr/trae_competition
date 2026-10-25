<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'

const canvas = ref<HTMLCanvasElement | null>(null)
const reduced = useReducedMotion()
let cleanup: (() => void) | null = null

onMounted(async () => {
  if (reduced.value || !canvas.value) return
  const container = canvas.value.parentElement
  if (!container) return

  try {
    const THREE = await import('three')
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const count = 650
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#d8b46a'),
      new THREE.Color('#7f9db8'),
      new THREE.Color('#c85a3f'),
      new THREE.Color('#86a996'),
    ]

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 15
      positions[index * 3 + 1] = (Math.random() - 0.5) * 9
      positions[index * 3 + 2] = (Math.random() - 0.5) * 7 - 1

      const color = palette[Math.floor(Math.random() * palette.length)]
      const intensity = 0.35 + Math.random() * 0.65
      colors[index * 3] = color.r * intensity
      colors[index * 3 + 1] = color.g * intensity
      colors[index * 3 + 2] = color.b * intensity
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const ringGeometry = new THREE.RingGeometry(2.6, 2.62, 160)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8b46a,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI * 0.46
    scene.add(ring)

    const outerGeometry = new THREE.RingGeometry(3.4, 3.41, 160)
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0x6b8fb3,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const outerRing = new THREE.Mesh(outerGeometry, outerMaterial)
    outerRing.rotation.x = Math.PI * 0.52
    outerRing.rotation.z = 0.4
    scene.add(outerRing)

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    let visible = true
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0.02 },
    )
    intersection.observe(container)

    let pointerX = 0
    let pointerY = 0
    let targetX = 0
    let targetY = 0

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.9
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.7
    }

    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
    }

    container.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    const clock = new THREE.Clock()
    let frame = 0

    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!visible) return
      const elapsed = clock.getElapsedTime()
      pointerX += (targetX - pointerX) * 0.045
      pointerY += (targetY - pointerY) * 0.045

      points.rotation.y = elapsed * 0.018 + pointerX * 0.25
      points.rotation.x = -pointerY * 0.18
      ring.rotation.z = elapsed * 0.04
      ring.position.y = Math.sin(elapsed * 0.22) * 0.1
      outerRing.rotation.z = 0.4 - elapsed * 0.025
      outerRing.position.y = Math.cos(elapsed * 0.18) * 0.14

      camera.position.x = pointerX * 0.55
      camera.position.y = -pointerY * 0.4
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()
    canvas.value.classList.add('hero-scene__canvas--ready')

    cleanup = () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      container.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
      outerGeometry.dispose()
      outerMaterial.dispose()
      renderer.dispose()
    }
  } catch {
    // WebGL 不可用时静默降级为纯 CSS 首屏。
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <canvas ref="canvas" class="hero-scene" aria-hidden="true" />
</template>

<style scoped>
.hero-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.4s var(--ease-out);
}

.hero-scene__canvas--ready {
  opacity: 0.85;
}
</style>
