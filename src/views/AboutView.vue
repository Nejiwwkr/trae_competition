<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const features = [
  { title: '五阶段字形演变', desc: '甲骨文、金文、小篆、隶书、楷书横向对照，标注年代、字体与逐帧来源。' },
  { title: '构形解析', desc: '造字法、构形一句话、《说文》依据与数据来源；争议处标「一说」。' },
  { title: '义项时间轴', desc: '本义、引申义、假借义按年代排列，附书证原句、出处与白话翻译。' },
  { title: '读音流变', desc: '广韵反切、中古声母韵目声调、郑张上古拟音与现代读音，多音字按义项分列。' },
  { title: '六十秒口播', desc: '每字一条可朗读、可复制的文案，按 4.2 字/秒估算时长。' },
  { title: '可分享字源卡', desc: '1080 像素宽 PNG，含字形序列、义项、读音、来源与许可。' },
  { title: '批量生词本', desc: '一次 10 字，自动去重、逐字核对、批量导出。' },
  { title: '字族与部件动画', desc: '形旁/声旁字族树，及经过人工标注的构形部件演示。' },
  { title: '生活例句与谜题', desc: '三条现代用例与易错提醒；看古文字形四选一猜字。' },
]

const boundaries = [
  {
    title: '只做可核验的 60 字',
    text: '数据包覆盖 60 字。未收录的字会明确提示，不拼接其他来源的释义或字形来充数。',
  },
  {
    title: '缺帧就显示缺帧',
    text: '8 个字（漢、湛、環、賜、賞、道、過、城）没有甲骨文图像，界面显示「未见著录」，不以金文或小篆顶替。',
  },
  {
    title: '争议不隐藏',
    text: '构形解析中有争议的条目均保留「一说」，不把一家之言写成定论。',
  },
  {
    title: '不做推测性拆字',
    text: '部件动画只覆盖人工核验过的字；其余字明确说明暂未标注，避免把错误拆解包装成知识。',
  },
  {
    title: '真值文件缺失如实说明',
    text: '赛题 char_truth.json 未随数据包提供，无法复算官方一致率。数据核验页以全量一致性自检代替，并在 README 中说明。',
  },
]
</script>

<template>
  <div class="about container">
    <header class="about__hero">
      <p class="eyebrow">About</p>
      <h1 class="about__title serif">把「字源」做成可以核对的知识</h1>
      <p class="about__lead">
        「字源」是 AI x 文学赛题第四题的作品：输入一个汉字，展开它的形、音、义。我们更在意的不是把古字做得好看，
        而是每一个判断都能对回数据包里的出处。
      </p>
    </header>

    <section class="section-block">
      <SectionHeading
        eyebrow="What we built"
        title="赛题要求与对应实现"
        lead="基础六项与进阶四项均已落地，所有内容均为静态数据，不依赖后端或运行时大模型。"
      />
      <div class="feature-list">
        <article v-for="(feature, index) in features" :key="feature.title" class="feature-row panel">
          <span class="feature-row__no serif">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h3 class="feature-row__title serif">{{ feature.title }}</h3>
            <p class="feature-row__desc">{{ feature.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <SectionHeading
        eyebrow="Sources & licenses"
        title="数据来源与许可"
        lead="字形、义项与构形数据均有明确出处；界面中的每张字形卡都可点开来源链接。"
      />
      <div class="source-grid">
        <div class="source panel">
          <h3 class="source__title serif">字形图像</h3>
          <p>
            Wikimedia Commons 公有领域字形系列，逐帧来源页与许可见字形卡「来源」链接。该系列源数据主要溯自
            中央研究院小學堂字形演變資料庫等公有领域整理。
          </p>
        </div>
        <div class="source panel">
          <h3 class="source__title serif">楷书呈现</h3>
          <p>
            楷书字形采用开源字体 Klee One（SIL Open Font License）渲染，仅用于展示，不作为书法范本或文字学证据。
          </p>
        </div>
        <div class="source panel">
          <h3 class="source__title serif">义项与构形</h3>
          <p>
            《说文解字》原文与近代古文字学通行考释，整理自赛题官方《汉字形音义溯源数据包》。每条义项附书证原句与出处。
          </p>
        </div>
        <div class="source panel">
          <h3 class="source__title serif">中古与上古音</h3>
          <p>
            中古音采用《广韵》反切及声母、韵目、声调标注；上古音采用郑张尚芳拟音系统。拟音是学术构拟，不是可听的古音录音。
          </p>
        </div>
      </div>
    </section>

    <section class="section-block">
      <SectionHeading
        eyebrow="AI disclosure"
        title="AI 参与方式"
        lead="按照赛题对 AI 使用透明度的要求，明确区分机器生成与人工核验的部分。"
      />
      <div class="ai panel">
        <div class="ai__block">
          <span class="ai__tag">AI 辅助</span>
          <ul>
            <li>工程实现：Vue 3 + TypeScript 应用、数据解析、3D/动画与分享卡导出由 AI 编程助手协作完成。</li>
            <li>文案起草：60 条口播文案与现代例句由 AI 基于数据包字段起草，开发期预生成，运行时不调用大模型。</li>
            <li>部件标注：12–22 个会意/形声字的部件拆分由 AI 提出，逐条对照构形解析后写入。</li>
          </ul>
        </div>
        <div class="ai__block">
          <span class="ai__tag ai__tag--human">人工核验</span>
          <ul>
            <li>书证、释义、年代、读音与造字法一律以数据包字段为准，AI 不新增书证。</li>
            <li>争议条目保留「一说」，不将 AI 的合并叙述当成学术结论。</li>
            <li>未核验的字不提供部件动画，找不到出处的字不进入 60 字展示集。</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section-block">
      <SectionHeading eyebrow="Boundaries" title="方法与边界" />
      <div class="boundaries">
        <article v-for="item in boundaries" :key="item.title" class="boundary panel">
          <h3 class="boundary__title serif">{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="section-block">
      <SectionHeading
        eyebrow="Reproducible"
        title="如何复现"
        lead="仓库自带数据同步脚本；安装依赖后即可本地运行、测试与构建。"
      />
      <div class="repro panel">
        <pre><code>npm install
npm run dev        # 启动开发服务器，自动同步数据包到 public/data
npm run test       # 数据解析与全量一致性测试
npm run typecheck  # TypeScript / Vue 类型检查
npm run build      # 生产构建（含数据同步）
npm run preview    # 预览构建产物</code></pre>
        <div class="repro__meta">
          <span class="chip chip--gold">Vue 3</span>
          <span class="chip chip--gold">Vite</span>
          <span class="chip chip--gold">TypeScript</span>
          <span class="chip">Three.js</span>
          <span class="chip">html-to-image</span>
          <span class="chip">Vitest</span>
        </div>
      </div>
    </section>

    <section class="closing">
      <p class="closing__text serif">
        一个字的历史，不该只存在于专家的注释里。它也应该能被点开、被核对、被讲给下一个人听。
      </p>
      <div class="closing__actions">
        <RouterLink to="/" class="btn btn--primary">开始查一个字</RouterLink>
        <RouterLink to="/validate" class="btn">查看数据核验</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about {
  padding-top: 60px;
  padding-bottom: 60px;
}

.about__hero {
  max-width: 880px;
  margin-bottom: 34px;
}

.about__title {
  margin-top: 12px;
  font-size: clamp(34px, 4.6vw, 56px);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

.about__lead {
  margin-top: 20px;
  font-size: 16px;
  line-height: 2;
  color: var(--muted);
}

.section-block {
  margin-top: 64px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature-row {
  display: flex;
  gap: 14px;
  padding: 20px 22px;
  border-radius: var(--radius-md);
}

.feature-row__no {
  font-size: 19px;
  color: var(--gold);
  line-height: 1.4;
}

.feature-row__title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.feature-row__desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.source {
  padding: 24px 26px;
}

.source__title {
  font-size: 17px;
  margin-bottom: 8px;
}

.source p {
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--muted);
}

.ai {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  overflow: hidden;
}

.ai__block {
  padding: 28px 30px;
}

.ai__block + .ai__block {
  border-left: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.015);
}

.ai__tag {
  display: inline-block;
  margin-bottom: 14px;
  padding: 3px 10px;
  border: 1px solid rgba(107, 143, 179, 0.34);
  border-radius: 999px;
  background: var(--ink-blue-soft);
  color: #a9c4de;
  font-size: 11px;
  letter-spacing: 0.1em;
}

.ai__tag--human {
  border-color: rgba(134, 169, 150, 0.34);
  background: var(--jade-soft);
  color: #b7d2c3;
}

.ai__block ul {
  display: grid;
  gap: 10px;
  padding-left: 18px;
  list-style: disc;
}

.ai__block li {
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--muted);
}

.boundaries {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.boundary {
  padding: 22px 24px;
}

.boundary:first-child {
  grid-column: span 2;
}

.boundary__title {
  font-size: 16px;
  margin-bottom: 6px;
}

.boundary p {
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--muted);
}

.repro {
  padding: 26px 28px;
}

.repro pre {
  margin: 0;
  padding: 18px 20px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.3);
  overflow-x: auto;
}

.repro code {
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 12.5px;
  line-height: 2;
  color: var(--text-soft);
}

.repro__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}

.closing {
  display: grid;
  justify-items: center;
  gap: 22px;
  margin-top: 80px;
  padding: 52px 20px;
  text-align: center;
  border-top: 1px solid var(--line);
  background: radial-gradient(600px 200px at 50% 100%, rgba(216, 180, 106, 0.06), transparent 70%);
}

.closing__text {
  max-width: 700px;
  font-size: clamp(19px, 2.4vw, 26px);
  line-height: 1.9;
  color: var(--text-soft);
}

.closing__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 900px) {
  .feature-list,
  .source-grid,
  .boundaries {
    grid-template-columns: 1fr;
  }

  .boundary:first-child {
    grid-column: auto;
  }

  .ai {
    grid-template-columns: 1fr;
  }

  .ai__block + .ai__block {
    border-left: none;
    border-top: 1px solid var(--line);
  }
}
</style>
