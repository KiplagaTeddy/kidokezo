import { useState } from "react"
import type { Question } from "./lesson"

type Props = {
  questions: Question[]
  onFinish: (score: number) => void
}

function Quiz({ questions, onFinish }: Props) {  const [q, setQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)

  const finished = q >= questions.length

  if (finished) {
    return (
      <section className="quiz">
        <h2>Well done!</h2>
        <p role="status">
          You got {score} of {questions.length} right.
        </p>
        <button
          onClick={() => {
            setQ(0)
            setSelected(null)
            setChecked(false)
            setScore(0)
          }}
        >
          Try again
        </button>
      </section>
    )
  }

  const question = questions[q]
  const correct = selected === question.answer

  function check() {
    if (selected === null || checked) return
    setChecked(true)
    if (selected === question.answer) setScore(score + 1)
  }

  function nextQuestion() {
  if (q === questions.length - 1) onFinish(score)
  setQ(q + 1)
  setSelected(null)
  setChecked(false)
}

  return (
    <section className="quiz">
      <h2>Check what you learned</h2>
      <p className="progress">
        Question {q + 1} of {questions.length}
      </p>

      <fieldset>
        <legend>{question.question}</legend>
        {question.options.map((option, i) => (
          <label key={i} className="option">
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={selected === i}
              onChange={() => {
                if (!checked) setSelected(i)
              }}
            />
            {option}
          </label>
        ))}
      </fieldset>

      <div role="status" className="feedback">
        {checked &&
          (correct
            ? `Correct! ${question.explanation}`
            : `Not quite. The answer is "${question.options[question.answer]}". ${question.explanation}`)}
      </div>

      {!checked ? (
        <button onClick={check} aria-disabled={selected === null}>
          Check answer
        </button>
      ) : (
        <button onClick={nextQuestion}>
          {q === questions.length - 1 ? "See my result" : "Next question"}
        </button>
      )}
    </section>
  )
}

export default Quiz