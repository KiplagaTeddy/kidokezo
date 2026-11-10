import { useEffect, useState } from "react"
import { lessons } from "./lesson"
import LessonView from "./LessonView"

const SIZES = [1.1, 1.25, 1.5, 1.75, 2]

const SPEEDS = [
  { label: "Very slow", rate: 0.6 },
  { label: "Slow", rate: 0.75 },
  { label: "Normal", rate: 0.9 },
  { label: "Fast", rate: 1.1 },
  { label: "Very fast", rate: 1.3 },
]

const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "contrast", label: "High contrast" },
]

const STORAGE_KEY = "kidokezo-settings"
const DEFAULTS = { sizeIndex: 1, theme: "light", speedIndex: 2 }

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const saved = JSON.parse(raw)

    const sizeOk =
      Number.isInteger(saved.sizeIndex) &&
      saved.sizeIndex >= 0 &&
      saved.sizeIndex < SIZES.length
    const themeOk = THEMES.some((t) => t.id === saved.theme)
    const speedOk =
      Number.isInteger(saved.speedIndex) &&
      saved.speedIndex >= 0 &&
      saved.speedIndex < SPEEDS.length

    return {
      sizeIndex: sizeOk ? saved.sizeIndex : DEFAULTS.sizeIndex,
      theme: themeOk ? saved.theme : DEFAULTS.theme,
      speedIndex: speedOk ? saved.speedIndex : DEFAULTS.speedIndex,
    }
  } catch {
    return DEFAULTS
  }
}

const PROGRESS_KEY = "kidokezo-progress"

type Progress = Record<string, { best: number; total: number }>

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const saved = JSON.parse(raw)
    const clean: Progress = {}
    for (const l of lessons) {
      const p = saved[l.id]
      if (
        p &&
        Number.isInteger(p.best) &&
        Number.isInteger(p.total) &&
        p.total > 0 &&
        p.best >= 0 &&
        p.best <= p.total
      ) {
        clean[l.id] = { best: p.best, total: p.total }
      }
    }
    return clean
  } catch {
    return {}
  }
}

function App() {
  const [initial] = useState(loadSettings)
  const [sizeIndex, setSizeIndex] = useState(initial.sizeIndex)
  const [theme, setTheme] = useState(initial.theme)
  const [speedIndex, setSpeedIndex] = useState(initial.speedIndex)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [progress, setProgress] = useState(loadProgress)

  const lesson = lessons.find((l) => l.id === lessonId)

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-size",
      `${SIZES[sizeIndex]}rem`
    )
  }, [sizeIndex])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

   useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sizeIndex, theme, speedIndex })
      )
    } catch {
      // storage unavailable: settings just won't be remembered
    }
  }, [sizeIndex, theme, speedIndex])

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    } catch {
      // storage unavailable: progress just won't be remembered
    }
  }, [progress])


  function resetSettings() {
    setSizeIndex(DEFAULTS.sizeIndex)
    setTheme(DEFAULTS.theme)
    setSpeedIndex(DEFAULTS.speedIndex)
  }

  function recordScore(id: string, score: number, total: number) {
  setProgress((prev) => ({
    ...prev,
    [id]: { best: Math.max(prev[id]?.best ?? 0, score), total },
  }))
}

function clearProgress() {
  if (window.confirm("Clear all lesson progress on this device?")) {
    setProgress({})
  }
}

const finishedCount = Object.keys(progress).length

  return (
    <main>
      <h1>Kidokezo</h1>

      <details className="settings-panel">
        <summary>Settings</summary>

        <div className="settings" role="group" aria-label="Text size">
          <button
            onClick={() => setSizeIndex(Math.max(0, sizeIndex - 1))}
            aria-disabled={sizeIndex === 0}
            aria-label="Make text smaller"
          >
            A−
          </button>
          <button
            onClick={() =>
              setSizeIndex(Math.min(SIZES.length - 1, sizeIndex + 1))
            }
            aria-disabled={sizeIndex === SIZES.length - 1}
            aria-label="Make text larger"
          >
            A+
          </button>
        </div>

        <div className="settings" role="group" aria-label="Colour theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="settings" role="group" aria-label="Reading speed">
          <button
            onClick={() => setSpeedIndex(Math.max(0, speedIndex - 1))}
            aria-disabled={speedIndex === 0}
            aria-label="Read slower"
          >
            Slower
          </button>
          <button
            onClick={() =>
              setSpeedIndex(Math.min(SPEEDS.length - 1, speedIndex + 1))
            }
            aria-disabled={speedIndex === SPEEDS.length - 1}
            aria-label="Read faster"
          >
            Faster
          </button>
        </div>
        <p className="progress">Reading speed: {SPEEDS[speedIndex].label}</p>

        <button className="reset" onClick={resetSettings}>
          Reset settings
        </button>

        <button className="reset" onClick={clearProgress}>
  Clear my progress
</button>
      </details>

      {lesson ? (
        <LessonView
  key={lesson.id}
  lesson={lesson}
  rate={SPEEDS[speedIndex].rate}
  onBack={() => setLessonId(null)}
  onQuizFinish={(score) =>
    recordScore(lesson.id, score, lesson.questions.length)
  }
/>
      ) : (
        <>
  <h2>Choose a lesson</h2>
  <p className="progress">
    {finishedCount} of {lessons.length} lessons finished
  </p>
  <ul className="lesson-list">
    {lessons.map((l) => {
      const p = progress[l.id]
      return (
        <li key={l.id}>
          <button className="lesson-card" onClick={() => setLessonId(l.id)}>
            <strong>{l.title}</strong>
            <span>{l.summary}</span>
            <span className="status">
              {p ? `Best score: ${p.best} of ${p.total}` : "Not tried yet"}
            </span>
          </button>
        </li>
      )
    })}
  </ul>
</>
      )}
    </main>
  )
}

export default App