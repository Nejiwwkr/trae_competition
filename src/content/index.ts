import type {
  CharRecord,
  ComponentAnnotation,
  ExampleContent,
  FamilyGroup,
  StoryContent,
} from '@/types'
import storiesRaw from './stories.json'
import examplesRaw from './examples.json'
import familiesRaw from './families.json'
import componentsRaw from './components.json'
import { buildExamples, buildStory } from './templates'

const stories = storiesRaw as Record<string, StoryContent>
const examples = examplesRaw as Record<string, ExampleContent>
const families = familiesRaw as FamilyGroup[]
const components = componentsRaw as Record<string, ComponentAnnotation>

export function getStory(record: CharRecord): StoryContent {
  return stories[record.char] ?? buildStory(record)
}

export function getExamples(record: CharRecord): ExampleContent {
  return examples[record.char] ?? buildExamples(record)
}

export function getFamiliesFor(char: string): FamilyGroup[] {
  return families.filter((group) => group.members.includes(char))
}

export function getFamilyGroups(kind?: FamilyGroup['kind']): FamilyGroup[] {
  return kind ? families.filter((group) => group.kind === kind) : families
}

export function getComponentAnnotation(char: string): ComponentAnnotation | null {
  return components[char] ?? null
}

export const componentAnnotations = components
