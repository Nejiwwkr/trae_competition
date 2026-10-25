<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { CharRecord } from '@/types'
import { findChar } from '@/data/buildStore'
import { normalizeCharInput, normalizePinyin } from '@/data/normalize'
import { useData } from '@/data/useData'

const props = withDefaults(
  defineProps<{
    size?: 'lg' | 'md'
    placeholder?: string
  }>(),
  {
    size: 'lg',
    placeholder: '输入一个汉字或拼音，如「明」／ ming',
  },
)

const router = useRouter()
const { store, loading } = useData()

const query = ref('')
const focused = ref(false)
const active = ref(0)
const error = ref('')

const suggestions = computed<CharRecord[]>(() => {
  const raw = query.value.trim()
  if (!raw || !store.value) return []
  const results: CharRecord[] = []

  const add = (record: CharRecord | null | undefined) => {
    if (record && !results.includes(record)) results.push(record)
  }

  add(findChar(store.value, normalizeCharInput(raw)))

  const pinyin = normalizePinyin(raw)
  if (pinyin) {
    for (const [key, chars] of store.value.pinyinIndex) {
      if (results.length >= 8) break
      if (!key.startsWith(pinyin)) continue
      for (const char of chars) add(store.value.byTraditional.get(char))
    }
  }

  return results.slice(0, 8)
})

const panelOpen = computed(() => focused.value && query.value.trim().length > 0)

function go(record: CharRecord) {
  router.push({ name: 'char', params: { char: record.char } })
  query.value = ''
  focused.value = false
}

function submit() {
  error.value = ''
  const raw = query.value.trim()
  if (!raw) return

  const single = normalizeCharInput(raw)
  if (single) {
    const record = findChar(store.value, single)
    if (record) {
      go(record)
      return
    }
    router.push({ name: 'char', params: { char: single } })
    query.value = ''
    focused.value = false
    return
  }

  if (suggestions.value.length > 0) {
    go(suggestions.value[Math.min(active.value, suggestions.value.length - 1)])
    return
  }

  error.value = loading.value ? '正在载入字形数据…' : '暂未收录，请输入单个汉字或拼音'
}

function onKeydown(event: KeyboardEvent) {
  if (!panelOpen.value || suggestions.value.length === 0) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = (active.value + 1) % suggestions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = (active.value - 1 + suggestions.value.length) % suggestions.value.length
  } else if (event.key === 'Escape') {
    focused.value = false
  } else if (event.key === 'Enter' && active.value > 0) {
    event.preventDefault()
    go(suggestions.value[active.value])
  }
}

function onBlur(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (next && (event.currentTarget as HTMLElement).contains(next)) return
  focused.value = false
}
</script>

<template>
  <form
    class="search"
    :class="`search--${props.size}`"
    role="search"
    @submit.prevent="submit"
    @focusout="onBlur"
  >
    <div class="search__field" :class="{ 'search__field--focus': focused }">
      <span class="search__icon serif" aria-hidden="true">字</span>
      <input
        v-model="query"
        type="text"
        maxlength="24"
        :placeholder="props.placeholder"
        aria-label="输入汉字或拼音查询"
        role="combobox"
        :aria-expanded="panelOpen"
        autocomplete="off"
        @focus="focused = true"
        @input="active = 0"
        @keydown="onKeydown"
      />
      <button type="submit" class="search__submit">
        溯源
        <span aria-hidden="true">↗</span>
      </button>
    </div>

    <Transition name="drop">
      <ul v-if="panelOpen && suggestions.length" class="search__panel panel" role="listbox">
        <li
          v-for="(record, index) in suggestions"
          :key="record.char"
          class="search__item"
          :class="{ 'search__item--active': index === active }"
          role="option"
          :aria-selected="index === active"
          @mousedown.prevent="go(record)"
          @mouseenter="active = index"
        >
          <span class="search__char serif">{{ record.simp }}</span>
          <span class="search__meta">
            <span class="search__name">
              {{ record.char !== record.simp ? `${record.char} · ` : '' }}{{ record.structure?.method }}
            </span>
            <span class="search__gloss">{{ record.senses[0]?.gloss }}</span>
          </span>
          <span class="search__reading">{{ record.readings.map((r) => r.modern).join(' / ') }}</span>
        </li>
      </ul>
    </Transition>

    <p v-if="panelOpen && !suggestions.length && !loading" class="search__hint">
      「{{ query }}」不在 60 字数据包内，试试上方推荐字或批量生词本。
    </p>
    <p v-if="error" class="search__hint search__hint--error">{{ error }}</p>
  </form>
</template>

<style scoped>
.search {
  position: relative;
  width: 100%;
}

.search__field {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 8px 8px 22px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent),
    rgba(14, 17, 22, 0.86);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  transition:
    border-color 0.35s var(--ease-out),
    box-shadow 0.35s var(--ease-out);
}

.search__field--focus {
  border-color: var(--line-strong);
  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.35),
    0 0 0 4px rgba(216, 180, 106, 0.07),
    0 0 50px rgba(216, 180, 106, 0.1);
}

.search__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--gold);
  font-size: 17px;
}

.search__field input {
  flex: 1;
  min-width: 0;
  height: 44px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 17px;
  letter-spacing: 0.02em;
}

.search__field input::placeholder {
  color: #6f6c64;
  font-size: 15px;
}

.search__submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #d8b46a, #b8904a);
  color: #1a1408;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  transition:
    transform 0.3s var(--ease-out),
    background 0.3s var(--ease-out);
}

.search__submit:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #f0d9a4, #d8b46a);
}

.search--md .search__field {
  padding-left: 16px;
}

.search--md .search__field input {
  height: 38px;
  font-size: 15px;
}

.search--md .search__submit {
  height: 38px;
  padding: 0 18px;
  font-size: 13px;
}

.search__panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  z-index: 50;
  padding: 8px;
  border-radius: var(--radius-md);
  background: rgba(15, 19, 25, 0.96);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.search__item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.search__item--active {
  background: rgba(216, 180, 106, 0.08);
}

.search__char {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 9px;
  font-size: 22px;
  color: var(--text);
}

.search__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  line-height: 1.4;
}

.search__name {
  font-size: 13px;
  color: var(--gold-bright);
}

.search__gloss {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search__reading {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.search__hint {
  margin-top: 10px;
  padding-left: 22px;
  font-size: 12.5px;
  color: var(--muted);
}

.search__hint--error {
  color: var(--danger);
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.2s var(--ease-out),
    transform 0.2s var(--ease-out);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .search__field {
    padding-left: 14px;
    gap: 10px;
  }

  .search__field input {
    font-size: 15px;
  }

  .search__submit {
    padding: 0 16px;
  }

  .search__icon {
    display: none;
  }

  .search__reading {
    display: none;
  }
}
</style>
