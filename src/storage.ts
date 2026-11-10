import type { Lesson } from "./lesson"
export const SIZES = [1.1, 1.25, 1.5, 1.75, 2]

export const SPEEDS = [
  { label: "Very slow", rate: 0.6 },
  { label: "Slow", rate: 0.75 },
  { label: "Normal", rate: 0.9 },
  { label: "Fast", rate: 1.1 },
  { label: "Very fast", rate: 1.3 },
]

export const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "contrast", label: "High contrast" },
]

export type Settings = { sizeIndex: number; theme: string; speedIndex: number }
export type Progress = Record<string, { best: number; total: number }>
export type Profile = {
  id: string
  name: string
  settings: Settings
  progress: Progress
}

export const DEFAULT_SETTINGS: Settings = {
  sizeIndex: 1,
  theme: "light",
  speedIndex: 2,
}

const PROFILES_KEY = "kidokezo-profiles"
const OLD_SETTINGS_KEY = "kidokezo-settings"
const OLD_PROGRESS_KEY = "kidokezo-progress"

function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function validIndex(n: unknown, length: number): n is number {
  return Number.isInteger(n) && (n as number) >= 0 && (n as number) < length
}

function cleanSettings(saved: unknown): Settings {
  const s = (saved ?? {}) as Partial<Settings>
  return {
    sizeIndex: validIndex(s.sizeIndex, SIZES.length)
      ? s.sizeIndex
      : DEFAULT_SETTINGS.sizeIndex,
    theme: THEMES.some((t) => t.id === s.theme)
      ? (s.theme as string)
      : DEFAULT_SETTINGS.theme,
    speedIndex: validIndex(s.speedIndex, SPEEDS.length)
      ? s.speedIndex
      : DEFAULT_SETTINGS.speedIndex,
  }
}

function cleanProgress(saved: unknown): Progress {
  const source = (saved ?? {}) as Record<string, { best?: number; total?: number }>
  const clean: Progress = {}
  for (const id of Object.keys(source)) {
    const p = source[id]
    if (
      p &&
      Number.isInteger(p.best) &&
      Number.isInteger(p.total) &&
      (p.total as number) > 0 &&
      (p.best as number) >= 0 &&
      (p.best as number) <= (p.total as number)
    ) {
      clean[id] = { best: p.best as number, total: p.total as number }
    }
  }
  return clean
}


export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadProfiles(): Profile[] {
  const saved = readJSON(PROFILES_KEY)

  if (Array.isArray(saved)) {
    return saved
      .filter((p) => p && typeof p.id === "string" && typeof p.name === "string")
      .map((p) => ({
        id: p.id,
        name: p.name,
        settings: cleanSettings(p.settings),
        progress: cleanProgress(p.progress),
      }))
  }

  // First run after this update: turn the old single-learner data into a profile
  const oldSettings = readJSON(OLD_SETTINGS_KEY)
  const oldProgress = readJSON(OLD_PROGRESS_KEY)
  if (oldSettings || oldProgress) {
    return [
      {
        id: newId(),
        name: "Learner",
        settings: cleanSettings(oldSettings),
        progress: cleanProgress(oldProgress),
      },
    ]
  }

  return []
}

export function saveProfiles(profiles: Profile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  } catch {
    // storage unavailable: profiles just won't be remembered
  }
}

const LESSONS_KEY = "kidokezo-custom-lessons"

function isLesson(value: unknown): value is Lesson {
  const l = value as Lesson | null
  return (
    !!l &&
    typeof l.id === "string" &&
    typeof l.title === "string" &&
    typeof l.summary === "string" &&
    Array.isArray(l.sections) &&
    l.sections.length > 0 &&
    l.sections.every(
      (s) =>
        s &&
        typeof s.id === "number" &&
        typeof s.title === "string" &&
        typeof s.text === "string"
    ) &&
    Array.isArray(l.questions) &&
    l.questions.length > 0 &&
    l.questions.every(
      (q) =>
        q &&
        typeof q.id === "number" &&
        typeof q.question === "string" &&
        typeof q.explanation === "string" &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.every((o) => typeof o === "string") &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < q.options.length
    )
  )
}

export function loadCustomLessons(): Lesson[] {
  const saved = readJSON(LESSONS_KEY)
  return Array.isArray(saved) ? saved.filter(isLesson) : []
}

export function saveCustomLessons(list: Lesson[]) {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(list))
  } catch {
    // storage unavailable: lessons just won't be remembered
  }
}