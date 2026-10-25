<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="serif footer__glyph">字</span>
        <div>
          <p class="serif footer__title">字源</p>
          <p class="footer__sub">一个汉字的形 · 音 · 义溯源</p>
        </div>
      </div>

      <div class="footer__meta">
        <p>
          字形图像：Wikimedia Commons 公有领域字形系列，逐帧来源与许可见字源卡；楷书字形：Klee One（OFL）。
        </p>
        <p>
          义项与构形数据：赛题官方数据包（《說文解字》及古文字学通行考释）。争议处均标注「一说」。
        </p>
        <p>
          文案与部件标注由 AI 辅助生成并经人工对照数据核验。本工具用于学习展示，不作学术定论。
        </p>
      </div>

      <nav class="footer__nav" aria-label="页脚导航">
        <RouterLink to="/about">数据来源与 AI 说明</RouterLink>
        <RouterLink to="/validate">数据核验</RouterLink>
        <span>AI x 文学 · 第四题「字源」</span>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 96px;
  padding: 56px 0 40px;
  border-top: 1px solid rgba(216, 180, 106, 0.12);
  background: rgba(8, 10, 13, 0.5);
}

.footer__inner {
  display: grid;
  grid-template-columns: 1fr 1.6fr 1fr;
  gap: 40px;
  align-items: start;
}

.footer__brand {
  display: flex;
  gap: 14px;
  align-items: center;
}

.footer__glyph {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 26px;
  color: var(--gold);
}

.footer__title {
  font-size: 17px;
  letter-spacing: 0.2em;
}

.footer__sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--muted);
}

.footer__meta {
  display: grid;
  gap: 8px;
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--muted);
}

.footer__nav {
  display: grid;
  gap: 8px;
  justify-items: start;
  font-size: 13px;
  color: var(--text-soft);
}

.footer__nav a {
  transition: color 0.2s;
}

.footer__nav a:hover {
  color: var(--gold-bright);
}

.footer__nav span {
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 900px) {
  .footer__inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
