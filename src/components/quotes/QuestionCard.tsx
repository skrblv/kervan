import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { findWorkshop } from '../../data/workshops'
import type { WorkshopQuestion } from '../../types/quote'
import type { Clarification } from '../../types/spec'
import { Button } from '../ui/Button'
import { TextArea } from '../ui/fields'

interface QuestionCardProps {
  question: WorkshopQuestion
  answer: Clarification | undefined
  onAnswer: (text: string) => void
}

/** A workshop's question, tied to one passport field. The answer becomes part of the next version. */
export function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const workshop = findWorkshop(question.workshopId)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 2) {
      setError('Write a short answer for the workshop.')
      return
    }
    onAnswer(text.trim())
  }

  return (
    <article className="animate-arrive grid gap-6 border-t-2 border-ink pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
      <div>
        <p className="kicker">
          Question · field <span className="text-accent-strong normal-case">{question.fieldPath}</span>
        </p>
        <p className="mt-2 font-display text-xl">
          {workshop.name} <span className="font-mono text-xs text-ink-3">{workshop.id}</span>
        </p>
        <blockquote className="mt-2 border-l-2 border-rule-2 pl-3 text-ink-2">{question.text}</blockquote>
        <p className="mt-3 text-sm text-ink-3">
          They will quote once the answer is part of the passport, so every workshop prices the same specification.
        </p>
      </div>

      <div aria-live="polite">
        {answer ? (
          <div className="text-sm">
            <p className="font-medium">Answer recorded against {question.fieldLabel.toLowerCase()}</p>
            <p className="mt-2 border-l-2 border-accent pl-3 text-ink">{answer.answer}</p>
            <p className="mt-3 text-ink-2">
              It is now a change in your draft passport.{' '}
              <Link to="/passport" className="text-ink underline underline-offset-4">
                Lock the next version
              </Link>{' '}
              to share it with all workshops.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3">
            <TextArea
              id="question-answer"
              label="Your answer"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (error) setError(null)
              }}
              error={error}
              hint="Sent as written. It is added to the passport as a clarification on this field."
              rows={3}
            />
            <Button type="submit" variant="secondary" size="sm">
              Send answer
            </Button>
          </form>
        )}
      </div>
    </article>
  )
}
