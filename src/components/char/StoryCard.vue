<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CharRecord } from '@/types'
import { getStory } from '@/content'
import { useSpeech } from '@/composables/useSpeech'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const props = defineProps<{ record: CharRecord }>()

const story = computed(() => getStory(props.record))
const charCount = computed(() => [...story.value.text].length)
const seconds = computed(() => story.value.seconds)
const inRange = computed(() => seconds.value >= 50 && seconds.value <= 70)

const { supported, speaking, speak, stop } = useSpeech()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(story.value.text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    copied.value = false
  }
}

function toggleSpeak() {
  if (speaking.value) {
    stop()
  } else {
    speak(story.value.text)
  }
}
</script>

<template>
  <section>
    <SectionHeading
      id="story"
      eyebrow="60-second script"
      title="六十秒，讲完这个字的一生"
      lead="按字形、构形、义项、读音四段组织，可直接用于口播或导览。"
    />

    <div class="story panel">
      <div class="story__meta">
        <div class="story__gauge">
          <span class="story__seconds serif">{{ seconds }}</span>
          <span class="story__unit">秒</span>
        </div>
        <div class="story__meter">
          <div class="story__meter-track">
            <span
              class="story__meter-fill"
              :class="{ 'story__meter-fill--warn': !inRange }"
              :style="{ width: `${Math.min(100, (seconds / 70) * 100)}%` }"
            />
            <span class="story__meter-range" />
          </div>
          <p>{{ charCount }} 字 · 按 4.2 字/秒估算 · {{ inRange ? '落在 50–70 秒区间' : '超出 50–70 秒区间' }}</p>
        </div>
        <span v-if="story.generated" class="chip chip--blue">据数据自动成文</span>
      </div>

      <div class="story__text serif">
        <p>{{ story.text }}</p>
      </div>

      <footer class="story__actions">
        <button
          v-if="supported"
          class="btn"
          :class="{ 'btn--primary': !speaking }"
          @click="toggleSpeak"
        >
          <span aria-hidden="true">{{ speaking ? '■' : '▶' }}</span>
          {{ speaking ? '停止朗读' : '试听朗读' }}
        </button>
        <span v-else class="story__unsupported">当前浏览器不支持语音合成，可直接朗读下方文案。</span>

        <button class="btn btn--ghost" @click="copy">
          {{ copied ? '已复制' : '复制文案' }}
        </button>

        <p class="story__disclaimer">
          文案由 AI 辅助起草并逐条对照数据包核验；书证与释义均以数据包为准。
        </p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.story {
  padding: 30px 34px;
  overflow: hidden;
}

.story::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(500px 260px at 88% 10%, rgba(216, 180, 106, 0.07), transparent 62%),
    radial-gradient(420px 260px at 8% 96%, rgba(200, 90, 63, 0.05), transparent 62%);
  pointer-events: none;
}

.story__meta {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  padding-bottom: 22px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}

.story__gauge {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.story__seconds {
  font-size: 44px;
  line-height: 1;
  color: var(--gold-bright);
}

.story__unit {
  font-size: 13px;
  color: var(--muted);
}

.story__meter {
  flex: 1;
  min-width: 180px;
}

.story__meter-track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.story__meter-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(216, 180, 106, 0.5), var(--gold));
  transition: width 0.8s var(--ease-out);
}

.story__meter-fill--warn {
  background: linear-gradient(90deg, rgba(200, 90, 63, 0.5), var(--vermillion));
}

.story__meter-range {
  position: absolute;
  left: 71.4%;
  right: 0;
  top: -4px;
  bottom: -4px;
  border-left: 1px dashed rgba(255, 255, 255, 0.14);
}

.story__meter p {
  margin-top: 7px;
  font-size: 11.5px;
  color: var(--muted);
}

.story__text {
  position: relative;
  margin: 26px 0;
}

.story__text p {
  font-size: 17.5px;
  line-height: 2.15;
  letter-spacing: 0.015em;
  color: var(--text);
  text-indent: 2em;
}

.story__text p::first-letter {
  font-size: 1.15em;
  color: var(--gold-bright);
}

.story__actions {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.story__disclaimer {
  flex: 1;
  min-width: 220px;
  font-size: 11px;
  line-height: 1.7;
  color: var(--muted);
  text-align: right;
}

.story__unsupported {
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 720px) {
  .story {
    padding: 22px;
  }

  .story__text p {
    font-size: 16px;
  }

  .story__disclaimer {
    text-align: left;
  }
}
</style>
