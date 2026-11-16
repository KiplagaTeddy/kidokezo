import type { Lesson } from "../src/lesson"

// Every limit lives here, so the app and the API can never disagree.
export const LIMITS = {
  id: 60,
  title: 100,
  summary: 300,
  sections: 20,
  sectionTitle: 100,
  sectionText: 2000,
  questions: 20,
  question: 300,
  options: 6,
  option: 150,
  explanation: 500,
  totalChars: 60_000,
}

export type LessonCheck =
  | { ok: true; lesson: Lesson }
  | { ok: false; error: string }

const fail = (error: string): LessonCheck => ({ ok: false, error })

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isText(v: unknown, max: number, allowEmpty = false): v is string {
  return (
    typeof v === "string" &&
    v.length <= max &&
    (allowEmpty || v.trim().length > 0)
  )
}

export function validateLesson(value: unknown): LessonCheck {
  if (!isRecord(value)) return fail("A lesson must be an object.")

  const { id, title, summary, sections, questions } = value
  if (!isText(id, LIMITS.id)) return fail("The lesson id is missing or too long.")
  if (!isText(title, LIMITS.title)) return fail("The lesson title is missing or too long.")
  if (!isText(summary, LIMITS.summary, true)) return fail("The lesson summary is too long.")

  if (!Array.isArray(sections) || sections.length < 1 || sections.length > LIMITS.sections) {
    return fail(`A lesson needs between 1 and ${LIMITS.sections} sections.`)
  }
  const cleanSections: Lesson["sections"] = []
  for (const s of sections) {
    if (!isRecord(s)) return fail("A section is not valid.")
    const { id: sid, title: stitle, text } = s
    if (!Number.isInteger(sid)) return fail("A section id is not valid.")
    if (!isText(stitle, LIMITS.sectionTitle)) return fail("A section title is missing or too long.")
    if (!isText(text, LIMITS.sectionText)) return fail("A section's text is missing or too long.")
    cleanSections.push({ id: sid as number, title: stitle, text })
  }

  if (!Array.isArray(questions) || questions.length < 1 || questions.length > LIMITS.questions) {
    return fail(`A lesson needs between 1 and ${LIMITS.questions} questions.`)
  }
  const cleanQuestions: Lesson["questions"] = []
  for (const q of questions) {
    if (!isRecord(q)) return fail("A question is not valid.")
    const { id: qid, question, options, answer, explanation } = q
    if (!Number.isInteger(qid)) return fail("A question id is not valid.")
    if (!isText(question, LIMITS.question)) return fail("A question is missing or too long.")
    if (!isText(explanation, LIMITS.explanation, true)) return fail("An explanation is too long.")
    if (!Array.isArray(options) || options.length < 2 || options.length > LIMITS.options) {
      return fail(`Each question needs between 2 and ${LIMITS.options} options.`)
    }
    if (!options.every((o) => isText(o, LIMITS.option))) {
      return fail("An answer option is empty or too long.")
    }
    if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= options.length) {
      return fail("A question's correct answer is not one of its options.")
    }
    cleanQuestions.push({
      id: qid as number,
      question,
      options: options as string[],
      answer: answer as number,
      explanation,
    })
  }

  const lesson: Lesson = { id, title, summary, sections: cleanSections, questions: cleanQuestions }
  if (JSON.stringify(lesson).length > LIMITS.totalChars) {
    return fail("This lesson is too large to share.")
  }
  return { ok: true, lesson }
}

