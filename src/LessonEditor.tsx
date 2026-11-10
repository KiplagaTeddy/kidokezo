import { useState } from "react"
import type { Lesson } from "./lesson"
import { parseLesson } from "./parseLesson"

type Props = {
  customLessons: Lesson[]
  onAdd: (lesson: Lesson) => void
  onDelete: (id: string) => void
  onDone: () => void
}

const EXAMPLE = `Title: Healthy hands
Summary: Why we wash our hands.

# Why wash?
Germs are tiny living things. They hide on our hands. Washing removes them.

# How to wash
Wet your hands with clean water. Rub them with soap for twenty seconds. Rinse and dry.

? What do we use to remove germs?
- *Soap and water
- Mud
- Sand
Explanation: Soap and water wash germs away.

? How long should we rub our hands with soap?
- Two seconds
- *Twenty seconds
- Two minutes
Explanation: Twenty seconds is long enough to remove germs.
`

function LessonEditor({ customLessons, onAdd, onDelete, onDone }: Props) {
  const [text, setText] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState("")

  function save() {
    const result = parseLesson(text)
    if (!result.ok) {
      setErrors(result.errors)
      setMessage("")
      return
    }
    onAdd(result.lesson)
    setText("")
    setErrors([])
    setMessage(`Saved "${result.lesson.title}". It is now in the lesson list.`)
  }

  return (
    <>
      <button className="back" onClick={onDone}>
        ← All lessons
      </button>

      <h2>Add a lesson</h2>
      <p>
        Write the lesson in plain text. End every sentence with a full stop, so
        the voice can read it one sentence at a time.
      </p>

      <details className="settings-panel">
        <summary>How to write a lesson</summary>
        <ul>
          <li>Start with Title: and Summary: lines.</li>
          <li>Start each section with # and a heading, then its text.</li>
          <li>Start each question with ?</li>
          <li>Start each answer with -, and put * before the correct one.</li>
          <li>Optionally add an Explanation: line after the answers.</li>
        </ul>
        <button className="reset" onClick={() => setText(EXAMPLE)}>
          Fill with an example
        </button>
      </details>

      <label htmlFor="lesson-text">Lesson text</label>
      <textarea
        id="lesson-text"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setErrors([])
          setMessage("")
        }}
      />

      <div role="alert" className="form-error">
        {errors.length > 0 && (
          <>
            <p>Please fix these:</p>
            <ul>
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div role="status" className="form-error">
        {message}
      </div>

      <button className="listen" onClick={save}>
        Save lesson
      </button>

      {customLessons.length > 0 && (
        <>
          <h2>Lessons you added</h2>
          <ul className="lesson-list">
            {customLessons.map((l) => (
              <li key={l.id} className="profile-row">
                <div className="lesson-card added">
                  <strong>{l.title}</strong>
                  <span>{l.summary}</span>
                </div>
                <button
                  className="delete"
                  aria-label={`Delete ${l.title}`}
                  onClick={() => {
                    if (window.confirm(`Delete the lesson "${l.title}"?`)) {
                      onDelete(l.id)
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default LessonEditor