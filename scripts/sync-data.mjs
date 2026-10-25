import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'assets', '【发放给参赛队伍】汉字形音义溯源数据包')
const target = join(root, 'public', 'data')

const required = [
  'meaning_evolution.csv',
  'phonology.csv',
  join('glyph_evolution', '字形帧清单.csv'),
  join('glyph_evolution', '构形解析.csv'),
  join('glyph_evolution', 'images'),
]

if (!existsSync(source)) {
  console.error(`[sync-data] 数据包不存在：${source}`)
  process.exit(1)
}

const missing = required.filter((file) => !existsSync(join(source, file)))
if (missing.length > 0) {
  console.error(`[sync-data] 数据包缺少必要文件：\n  ${missing.join('\n  ')}`)
  process.exit(1)
}

// 使用逐文件复制：Windows 中文路径下 fs.cpSync 会触发 Node 崩溃。
function copyDirectory(from, to) {
  mkdirSync(to, { recursive: true })
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const fromPath = join(from, entry.name)
    const toPath = join(to, entry.name)
    if (entry.isDirectory()) copyDirectory(fromPath, toPath)
    else copyFileSync(fromPath, toPath)
  }
}

rmSync(target, { recursive: true, force: true })
copyDirectory(source, target)

console.log(`[sync-data] 已同步数据包 → ${target}`)
