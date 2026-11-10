import { useEffect, useRef, useState } from "react"
import type { Lesson } from "./lesson"
import Quiz from "./quiz"

type Props = {
  lesson: Lesson
  rate: number
  onBack: () => void
  onQuizFinish: (score: number) => void
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  return parts.map((s) => s.trim()).filter((s) => s.length > 0)
}

function LessonView({ lesson, rate, onBack, onQuizFinish }: Props) {  const [index, setIndex] = useState(0)
  const [current, setCurrent] = useState<number | null>(null)
  const runId = useRef(0)

  const supported = "speechSynthesis" in window

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const total = lesson.sections.length
  const section = lesson.sections[index]
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
      utterance.rate = rate
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

  const isReading = current !== null

  return (
    <>
      <button className="back" onClick={onBack}>
        ← All lessons
      </button>

      <h2>{lesson.title}</h2>
      <p className="progress">
        Section {index + 1} of {total}
      </p>

      {supported && (
        <button className="listen" onClick={isReading ? stop : listen}>
          {isReading ? "Stop" : "Listen"}
        </button>
      )}

      <section aria-live="polite">
        <h3>{section.title}</h3>
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

      {index === total - 1 && (
  <Quiz questions={lesson.questions} onFinish={onQuizFinish} />
)}
    </>
  )
}

export default LessonView