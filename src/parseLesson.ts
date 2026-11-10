import type { Lesson } from "./lesson"
import { newId } from "./storage"

export type ParseResult =
  | { ok: true; lesson: Lesson }
  | { ok: false; errors: string[] }

type Mode = "none" | "section" | "question"

export function parseLesson(source: string): ParseResult {
  const errors: string[] = []
  let title = ""
  let summary = ""
  let mode: Mode = "none"

  const sections: { title: string; lines: string[]; line: number }[] = []
  const questions: {
    text: string
    options: { text: string; correct: boolean }[]
    explanation: string
    line: number
  }[] = []

  const lines = source.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const n = i + 1
    if (line === "") continue

    const titleMatch = line.match(/^title:\s*(.*)$/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
      continue
    }

    const summaryMatch = line.match(/^summary:\s*(.*)$/i)
    if (summaryMatch) {
      summary = summaryMatch[1].trim()
      continue
    }

    if (line.startsWith("#")) {
      mode = "section"
      sections.push({ title: line.replace(/^#+\s*/, ""), lines: [], line: n })
      continue
    }

    if (line.startsWith("?")) {
      mode = "question"
      questions.push({
        text: line.slice(1).trim(),
        options: [],
        explanation: "",
        line: n,
      })
      continue
    }

    if (mode === "section") {
      sections[sections.length - 1].lines.push(line)
      continue
    }

    if (mode === "question") {
      const q = questions[questions.length - 1]
      if (line.startsWith("-")) {
        let text = line.slice(1).trim()
        const correct = text.startsWith("*")
        if (correct) text = text.slice(1).trim()
        q.options.push({ text, correct })
        continue
      }
      const explanationMatch = line.match(/^explanation:\s*(.*)$/i)
      if (explanationMatch) {
        q.explanation = explanationMatch[1].trim()
        continue
      }
    }

    errors.push(`Line ${n}: I did not understand "${line}".`)
  }

  if (!title) errors.push("Add a title, for example: Title: Healthy hands")
  if (sections.length === 0) {
    errors.push("Add at least one section: a line starting with # and a heading.")
  }
  if (questions.length === 0) {
    errors.push("Add at least one question: a line starting with ?")
  }

  for (const s of sections) {
    if (!s.title) errors.push(`Line ${s.line}: this section has no heading.`)
    if (s.lines.join("").length === 0) {
      errors.push(`Line ${s.line}: the section "${s.title}" has no text.`)
    }
  }

  for (const q of questions) {
    if (!q.text) errors.push(`Line ${q.line}: this question has no text.`)
    if (q.options.length < 2) {
      errors.push(`Line ${q.line}: a question needs at least 2 options, each starting with -`)
    }
    if (q.options.some((o) => o.text === "")) {
      errors.push(`Line ${q.line}: one of the options is empty.`)
    }
    if (q.options.filter((o) => o.correct).length !== 1) {
      errors.push(`Line ${q.line}: mark exactly one correct option with * (for example - *Oxygen).`)
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    lesson: {
      id: "custom-" + newId(),
      title,
      summary: summary || "A lesson added by your teacher.",
      sections: sections.map((s, i) => ({
        id: i + 1,
        title: s.title,
        text: s.lines.join(" "),
      })),
      questions: questions.map((q, i) => ({
        id: i + 1,
        question: q.text,
        options: q.options.map((o) => o.text),
        answer: q.options.findIndex((o) => o.correct),
        explanation: q.explanation,
      })),
    },
  }
}