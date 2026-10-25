<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { normalizeCharInput } from '@/data/normalize'

const router = useRouter()
const query = ref('')

const links = [
  { to: '/', label: '字源', exact: true },
  { to: '/batch', label: '批量生词本' },
  { to: '/family', label: '字族' },
  { to: '/puzzle', label: '谜题' },
  { to: '/validate', label: '数据核验' },
  { to: '/about', label: '关于' },
]

function submit() {
  const char = normalizeCharInput(query.value)
  if (!char) return
  router.push({ name: 'char', params: { char } })
  query.value = ''
}
</script>

<template>
  <header class="nav">
    <div class="nav__inner container">
      <RouterLink to="/" class="brand" aria-label="字源首页">
        <span class="brand__mark serif">字</span>
        <span class="brand__text">
          <strong class="serif">字源</strong>
          <small>形 · 音 · 义</small>
        </span>
      </RouterLink>

      <nav class="nav__links" aria-label="主导航">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav__link"
          :class="{ 'nav__link--home': link.exact }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <form class="nav__search" role="search" @submit.prevent="submit">
        <input
          v-model="query"
          type="search"
          maxlength="4"
          placeholder="查字"
          aria-label="输入一个汉字查询"
        />
        <button type="submit" aria-label="查询">↵</button>
      </form>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 60;
  height: var(--nav-h);
  border-bottom: 1px solid rgba(216, 180, 106, 0.12);
  background: rgba(10, 12, 16, 0.72);
  backdrop-filter: blur(18px) saturate(120%);
}

.nav__inner {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  color: var(--gold-bright);
  font-size: 22px;
  line-height: 1;
  box-shadow: inset 0 0 18px rgba(216, 180, 106, 0.12);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__text strong {
  font-size: 19px;
  letter-spacing: 0.18em;
  font-weight: 600;
}

.brand__text small {
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--muted);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.nav__link {
  position: relative;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13.5px;
  color: var(--text-soft);
  transition:
    color 0.25s var(--ease-out),
    background 0.25s var(--ease-out);
  white-space: nowrap;
}

.nav__link:hover {
  color: var(--gold-bright);
  background: rgba(216, 180, 106, 0.06);
}

.nav__link.router-link-active:not(.nav__link--home) {
  color: var(--gold-bright);
  background: var(--gold-dim);
}

.nav__link--home.router-link-exact-active {
  color: var(--gold-bright);
  background: var(--gold-dim);
}

.nav__search {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav__search input {
  width: 118px;
  height: 36px;
  padding: 0 34px 0 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
  transition:
    width 0.35s var(--ease-out),
    border-color 0.3s var(--ease-out),
    background 0.3s var(--ease-out);
}

.nav__search input:focus {
  width: 168px;
  outline: none;
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, 0.05);
}

.nav__search input::placeholder {
  color: var(--muted);
}

.nav__search button {
  position: absolute;
  right: 4px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--muted);
  transition: color 0.2s;
}

.nav__search button:hover {
  color: var(--gold);
}

@media (max-width: 1080px) {
  .nav__link {
    padding: 8px 9px;
    font-size: 13px;
  }

  .nav__search input {
    width: 92px;
  }
}

@media (max-width: 860px) {
  .nav__links {
    display: none;
  }

  .nav__search {
    margin-left: auto;
  }
}
</style>
