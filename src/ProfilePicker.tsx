import { useState } from "react"
import type { FormEvent } from "react"
import { lessons } from "./lesson"
import type { Profile } from "./storage"

type Props = {
  profiles: Profile[]
  onChoose: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}

function ProfilePicker({ profiles, onChoose, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(profiles.length === 0)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  function submit(e: FormEvent) {
    e.preventDefault()
    const clean = name.trim()
    if (clean.length === 0) {
      setError("Please type a name.")
      return
    }
    if (profiles.some((p) => p.name.toLowerCase() === clean.toLowerCase())) {
      setError("That name is already used. Please choose another.")
      return
    }
    onAdd(clean)
  }

  return (
    <>
      <h2>Who is learning?</h2>

      {profiles.length > 0 && (
        <ul className="lesson-list">
          {profiles.map((p) => {
            const done = Object.keys(p.progress).length
            return (
              <li key={p.id} className="profile-row">
                <button className="lesson-card" onClick={() => onChoose(p.id)}>
                  <strong>{p.name}</strong>
                  <span className="status">
                    {done} of {lessons.length} lessons finished
                  </span>
                </button>
                <button
                  className="delete"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete ${p.name} and all their progress? This cannot be undone.`
                      )
                    ) {
                      onDelete(p.id)
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {adding ? (
        <form onSubmit={submit}>
          <label htmlFor="learner-name">Name or nickname</label>
          <input
            id="learner-name"
            value={name}
            maxLength={20}
            onChange={(e) => {
              setName(e.target.value)
              setError("")
            }}
          />
          <p className="progress">
            Saved on this device only. A nickname is fine.
          </p>
          <div role="alert" className="form-error">
            {error}
          </div>
          <div className="nav">
            <button type="submit">Start learning</button>
            {profiles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAdding(false)
                  setName("")
                  setError("")
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <button className="listen" onClick={() => setAdding(true)}>
          Add a learner
        </button>
      )}
    </>
  )
}

export default ProfilePicker