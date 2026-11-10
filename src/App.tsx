import { useEffect, useRef, useState } from "react"
import { photosynthesis } from "./lesson"
import Quiz from "./quiz"

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

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  return parts.map((s) => s.trim()).filter((s) => s.length > 0)
}

function App() {
  const [initial] = useState(loadSettings)
  const [index, setIndex] = useState(0)
  const [sizeIndex, setSizeIndex] = useState(initial.sizeIndex)
  const [theme, setTheme] = useState(initial.theme)
  const [speedIndex, setSpeedIndex] = useState(initial.speedIndex)
  const [current, setCurrent] = useState<number | null>(null)
  const runId = useRef(0)

  const supported = "speechSynthesis" in window

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
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const total = photosynthesis.sections.length
  const section = photosynthesis.sections[index]
  const sentences = splitSentences(section.text)

  function stop() {
    runId.current++
    window.speechSynthesis.cancel()
    setCurrent(null)
  }

  function listen() {
    window.speechSynthesis.cancel()
    const id = ++runId.current

    const next = (i: number) => {
      if (id !== runId.current) return
      if (i >= sentences.length) {
        setCurrent(null)
        return
      }
      setCurrent(i)
      const utterance = new SpeechSynthesisUtterance(sentences[i])
      utterance.rate = SPEEDS[speedIndex].rate
      utterance.onend = () => next(i + 1)
      window.speechSynthesis.speak(utterance)
    }

    next(0)
  }

  function goTo(i: number) {
    if (i < 0 || i >= total) return
    stop()
    setIndex(i)
  }

  function resetSettings() {
    setSizeIndex(DEFAULTS.sizeIndex)
    setTheme(DEFAULTS.theme)
    setSpeedIndex(DEFAULTS.speedIndex)
  }

  const isReading = current !== null

  return (
    <main>
      <h1>{photosynthesis.title}</h1>

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
      </details>

      <p className="progress">
        Section {index + 1} of {total}
      </p>

      {supported && (
        <button className="listen" onClick={isReading ? stop : listen}>
          {isReading ? "Stop" : "Listen"}
        </button>
      )}

      <section aria-live="polite">
        <h2>{section.title}</h2>
        <p>
          {sentences.map((s, i) => (
            <span key={i} className={i === current ? "reading" : undefined}>
              {s}{" "}
            </span>
          ))}
        </p>
      </section>

      <div className="nav">
        <button onClick={() => goTo(index - 1)} aria-disabled={index === 0}>
          Back
        </button>
        <button
          onClick={() => goTo(index + 1)}
          aria-disabled={index === total - 1}
        >
          Next
        </button>
      </div>
            {index === total - 1 && <Quiz questions={photosynthesis.questions} />}
    </main>
  )
}

export default App