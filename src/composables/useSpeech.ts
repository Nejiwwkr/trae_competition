import { onBeforeUnmount, ref } from 'vue'

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const speaking = ref(false)

  function stop() {
    if (!supported) return
    window.speechSynthesis.cancel()
    speaking.value = false
  }

  function speak(text: string) {
    if (!supported) return
    stop()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onend = () => {
      speaking.value = false
    }
    utterance.onerror = () => {
      speaking.value = false
    }
    speaking.value = true
    window.speechSynthesis.speak(utterance)
  }

  onBeforeUnmount(stop)

  return { supported, speaking, speak, stop }
}
