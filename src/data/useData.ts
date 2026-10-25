import { ref, shallowRef } from 'vue'
import type { CharStore } from '@/types'
import { loadCharStore } from './loadData'

const store = shallowRef<CharStore | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
let pending: Promise<CharStore> | null = null

async function run(): Promise<CharStore> {
  loading.value = true
  error.value = null
  try {
    const data = await loadCharStore()
    store.value = data
    return data
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
    throw cause
  } finally {
    loading.value = false
  }
}

export function ensureData(): Promise<CharStore> {
  if (store.value) return Promise.resolve(store.value)
  if (!pending) {
    pending = run().catch((cause) => {
      pending = null
      throw cause
    })
  }
  return pending
}

export function reloadData(): Promise<CharStore> {
  pending = null
  return ensureData()
}

export function useData() {
  if (!store.value && !pending) {
    ensureData().catch(() => {
      /* 错误通过 error 暴露 */
    })
  }
  return {
    store,
    loading,
    error,
    reload: reloadData,
  }
}
