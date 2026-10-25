import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runChecks, type ContentBundle } from '@/data/checks'
import stories from '@/content/stories.json'
import examples from '@/content/examples.json'
import families from '@/content/families.json'
import components from '@/content/components.json'
import type { ComponentAnnotation, ExampleContent, FamilyGroup, StoryContent } from '@/types'
import { assetRoot, loadFixtureStore } from './helpers/loadFixture'

const store = loadFixtureStore()
const content: ContentBundle = {
  stories: stories as Record<string, StoryContent>,
  examples: examples as Record<string, ExampleContent>,
  families: families as FamilyGroup[],
  components: components as Record<string, ComponentAnnotation>,
}

describe('全量数据自检', () => {
  it('除真值文件缺失外，所有检查项通过', () => {
    const results = runChecks(store, content)
    const failures = results.filter((result) => result.status === 'fail')
    expect(failures, failures.map((result) => `${result.label}: ${result.detail}`).join('\n')).toEqual(
      [],
    )
    expect(results.find((result) => result.id === 'truth')?.status).toBe('warn')
  })

  it('每个非空帧的图像文件都存在', () => {
    const missingFiles: string[] = []
    for (const record of store.chars) {
      for (const frame of record.frames) {
        if (frame.missing || !frame.relPath) continue
        const file = join(assetRoot, 'glyph_evolution', frame.relPath)
        if (!existsSync(file)) missingFiles.push(`${record.char}/${frame.relPath}`)
      }
    }
    expect(missingFiles).toEqual([])
  })

  it('所有故事时长落在 50–70 秒', () => {
    const outOfRange = store.chars
      .map((record) => {
        const story = content.stories[record.char]
        const seconds = Math.round([...story.text].length / 4.2)
        return { char: record.char, seconds }
      })
      .filter((item) => item.seconds < 50 || item.seconds > 70)
    expect(outOfRange).toEqual([])
  })

  it('字族分组成员均可在数据包中找到', () => {
    const unknown = content.families.flatMap((group) =>
      group.members.filter((member) => !store.byTraditional.has(member)),
    )
    expect(unknown).toEqual([])
  })

  it('部件标注均指向已收录汉字', () => {
    const unknown = Object.keys(content.components).filter(
      (char) => !store.byTraditional.has(char),
    )
    expect(unknown).toEqual([])
  })
})
