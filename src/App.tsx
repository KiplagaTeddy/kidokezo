import { useEffect, useState } from "react"
import { lessons } from "./lesson"
import LessonEditor from "./LessonEditor"
import LessonView from "./LessonView"
import ProfilePicker from "./ProfilePicker"
import {
  DEFAULT_SETTINGS,
  SIZES,
  SPEEDS,
  THEMES,
  loadCustomLessons,
  loadProfiles,
  newId,
  saveCustomLessons,
  saveProfiles,
} from "./storage"
import type { Lesson } from "./lesson"
import type { Profile, Settings } from "./storage"

function App() {
  const [profiles, setProfiles] = useState(loadProfiles)
  const [customLessons, setCustomLessons] = useState(loadCustomLessons)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const allLessons: Lesson[] = [...lessons, ...customLessons]
  const active = profiles.find((p) => p.id === activeId)
  const settings = active ? active.settings : DEFAULT_SETTINGS

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-size",
      `${SIZES[settings.sizeIndex]}rem`
    )
  }, [settings.sizeIndex])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    saveProfiles(profiles)
  }, [profiles])

  useEffect(() => {
    saveCustomLessons(customLessons)
  }, [customLessons])

  function addProfile(name: string) {
    const profile: Profile = {
      id: newId(),
      name,
      settings: DEFAULT_SETTINGS,
      progress: {},
    }
    setProfiles((prev) => [...prev, profile])
    setActiveId(profile.id)
  }

  function deleteProfile(id: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  if (!active) {
    return (
      <main>
        <h1>Kidokezo</h1>
        <ProfilePicker
          profiles={profiles}
          lessonIds={allLessons.map((l) => l.id)}
          onChoose={setActiveId}
          onAdd={addProfile}
          onDelete={deleteProfile}
        />
      </main>
    )
  }

  const lesson = allLessons.find((l) => l.id === lessonId)
  const finishedCount = allLessons.filter((l) => active.progress[l.id]).length

  function updateActive(change: (p: Profile) => Profile) {
    setProfiles((prev) => prev.map((p) => (p.id === activeId ? change(p) : p)))
  }

  function updateSettings(patch: Partial<Settings>) {
    updateActive((p) => ({ ...p, settings: { ...p.settings, ...patch } }))
  }

  function recordScore(id: string, score: number, total: number) {
    updateActive((p) => ({
      ...p,
      progress: {
        ...p.progress,
        [id]: { best: Math.max(p.progress[id]?.best ?? 0, score), total },
      },
    }))
  }

  function clearProgress() {
    if (window.confirm("Clear all lesson progress for this learner?")) {
      updateActive((p) => ({ ...p, progress: {} }))
    }
  }

  function addLesson(newLesson: Lesson) {
    setCustomLessons((prev) => [...prev, newLesson])
  }

  function deleteLesson(id: string) {
    setCustomLessons((prev) => prev.filter((l) => l.id !== id))
  }

  function switchLearner() {
    setLessonId(null)
    setEditing(false)
    setActiveId(null)
  }

  return (
    <main>
      <h1>Kidokezo</h1>

      <button className="back" onClick={switchLearner}>
        Learner: {active.name} · Switch
      </button>

      <details className="settings-panel">
        <summary>Settings</summary>

        <div className="settings" role="group" aria-label="Text size">
          <button
            onClick={() =>
              updateSettings({ sizeIndex: Math.max(0, settings.sizeIndex - 1) })
            }
            aria-disabled={settings.sizeIndex === 0}
            aria-label="Make text smaller"
          >
            A−
          </button>
          <button
            onClick={() =>
              updateSettings({
                sizeIndex: Math.min(SIZES.length - 1, settings.sizeIndex + 1),
              })
            }
            aria-disabled={settings.sizeIndex === SIZES.length - 1}
            aria-label="Make text larger"
          >
            A+
          </button>
        </div>

        <div className="settings" role="group" aria-label="Colour theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ theme: t.id })}
              aria-pressed={settings.theme === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="settings" role="group" aria-label="Reading speed">
          <button
            onClick={() =>
              updateSettings({
                speedIndex: Math.max(0, settings.speedIndex - 1),
              })
            }
            aria-disabled={settings.speedIndex === 0}
            aria-label="Read slower"
          >
            Slower
          </button>
          <button
            onClick={() =>
              updateSettings({
                speedIndex: Math.min(SPEEDS.length - 1, settings.speedIndex + 1),
              })
            }
            aria-disabled={settings.speedIndex === SPEEDS.length - 1}
            aria-label="Read faster"
          >
            Faster
          </button>
        </div>
        <p className="progress">
          Reading speed: {SPEEDS[settings.speedIndex].label}
        </p>

        <button
          className="reset"
          onClick={() => updateSettings(DEFAULT_SETTINGS)}
        >
          Reset settings
        </button>
        <button className="reset" onClick={clearProgress}>
          Clear my progress
        </button>
      </details>

      {editing ? (
        <LessonEditor
          customLessons={customLessons}
          onAdd={addLesson}
          onDelete={deleteLesson}
          onDone={() => setEditing(false)}
        />
      ) : lesson ? (
        <LessonView
          key={lesson.id}
          lesson={lesson}
          rate={SPEEDS[settings.speedIndex].rate}
          onBack={() => setLessonId(null)}
          onQuizFinish={(score) =>
            recordScore(lesson.id, score, lesson.questions.length)
          }
        />
      ) : (
        <>
          <h2>Choose a lesson</h2>
          <p className="progress">
            {finishedCount} of {allLessons.length} lessons finished
          </p>
          <ul className="lesson-list">
            {allLessons.map((l) => {
              const p = active.progress[l.id]
              return (
                <li key={l.id}>
                  <button
                    className="lesson-card"
                    onClick={() => setLessonId(l.id)}
                  >
                    <strong>{l.title}</strong>
                    <span>{l.summary}</span>
                    <span className="status">
                      {p
                        ? `Best score: ${p.best} of ${p.total}`
                        : "Not tried yet"}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button className="reset" onClick={() => setEditing(true)}>
            Add or manage lessons
          </button>
        </>
      )}
    </main>
  )
}

export default App