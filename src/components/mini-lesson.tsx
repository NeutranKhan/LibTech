'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowUpRight } from 'lucide-react';
const questions = [
  {
    tag: 'PROMPT BASICS',
    title: (
      <>
        A better question.
        <br />A better answer.
      </>
    ),
    question: 'You want AI to help write an email. Which prompt gives it a clearer starting point?',
    options: [
      'Write me an email.',
      'Write a friendly, 100-word email inviting my team to a Friday project review.',
    ],
    correct: 1,
    feedback: 'Exactly! A task, audience, tone, and length give AI a clear brief.',
    hint: 'A little more detail helps. Look for a task, audience, tone, and length.',
  },
  {
    tag: 'THINK CRITICALLY',
    title: (
      <>
        Confident doesn’t
        <br />
        always mean correct.
      </>
    ),
    question: 'An AI assistant shares a statistic with no source. What’s your next move?',
    options: [
      'Use it because the answer sounds confident.',
      'Check the statistic against a reliable original source.',
    ],
    correct: 1,
    feedback: 'That’s it. A useful answer still needs evidence you can verify.',
    hint: 'Confidence is not evidence. Check important facts before using them.',
  },
  {
    tag: 'WORK RESPONSIBLY',
    title: (
      <>
        Useful context.
        <br />
        Private details protected.
      </>
    ),
    question:
      'You want to summarize customer feedback. What should you share with an approved AI tool?',
    options: [
      'Anonymized feedback with private details removed.',
      'The full customer list, including passwords.',
    ],
    correct: 0,
    feedback: 'Well done. Share only the information the task needs, and protect personal details.',
    hint: 'Remove private details and check that you have permission to use the data.',
  },
];
export function MiniLesson() {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number>();
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const q = questions[step];
  const correct = choice === q.correct;
  return (
    <>
      <div className="lesson-topline">
        <span>
          <span className="sample-dot" /> YOUR FIRST SMALL WIN
        </span>
        <span>{finished ? 'COMPLETE' : String(step + 1).padStart(2, '0') + ' / 03'}</span>
      </div>
      <div className="sample-progress">
        <span style={{ width: (finished ? 100 : (step / 3) * 100) + '%' }} />
      </div>
      {finished ? (
        <div className="mini-content sample-complete">
          <span className="sample-success">
            <Check size={32} />
          </span>
          <span className="badge">3 SMALL WINS</span>
          <h2>
            You’ve already
            <br />
            started learning.
          </h2>
          <p>
            Clear prompts. Critical thinking. Responsible use. There’s a lot more you can do with
            these basics.
          </p>
          <Link href="/courses" className="button wide">
            Explore the full course
            <ArrowUpRight size={17} />
          </Link>
          <button
            className="sample-restart"
            onClick={() => {
              setStep(0);
              setChoice(undefined);
              setChecked(false);
              setFinished(false);
            }}
          >
            Try the practice again
          </button>
        </div>
      ) : (
        <div className="mini-content">
          <span className="badge orange">
            <Sparkles size={12} />
            {q.tag}
          </span>
          <h2>{q.title}</h2>
          <p>{q.question}</p>
          <div className="choices">
            {q.options.map((text, i) => (
              <button
                key={text}
                aria-pressed={choice === i}
                className={
                  'choice ' +
                  (choice === i ? 'selected ' : '') +
                  (checked && choice === i ? (correct ? 'correct' : 'incorrect') : '')
                }
                onClick={() => {
                  setChoice(i);
                  setChecked(false);
                }}
              >
                <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
                <span>{text}</span>
                {checked && choice === i && <strong>{correct ? '✓' : '×'}</strong>}
              </button>
            ))}
          </div>
          {checked && (
            <div className={'feedback ' + (correct ? 'success' : '')} role="status">
              {correct ? q.feedback : q.hint}
            </div>
          )}
          {checked && correct ? (
            <button
              className="button wide"
              onClick={() => {
                if (step === 2) setFinished(true);
                else {
                  setStep(step + 1);
                  setChoice(undefined);
                  setChecked(false);
                }
              }}
            >
              {step === 2 ? 'Finish free practice' : 'Next question'}
            </button>
          ) : (
            <button
              className="button wide"
              disabled={choice === undefined}
              onClick={() => setChecked(true)}
            >
              Check my answer
            </button>
          )}
        </div>
      )}
    </>
  );
}
