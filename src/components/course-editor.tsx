'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import { blockTypes, type Course, type Lesson, type Block } from '@/lib/domain';
const blankBlock = (): Block => ({
  id: crypto.randomUUID(),
  type: 'TEXT',
  text: '',
  options: [],
  answer: '',
  explanation: '',
  rubric: [],
  required: true,
});
const blankCourse = (): Course => ({
  id: crypto.randomUUID(),
  slug: 'new-course-' + Date.now(),
  title: 'New course',
  description: 'Describe the practical skills learners will develop in this course.',
  category: 'AI foundations',
  difficulty: 'Beginner',
  priceCents: 0,
  duration: '2 hours',
  instructor: 'LibTech Learning Team',
  ownerId: 'platform',
  status: 'DRAFT',
  order: 0,
  revision: 0,
  thumbnail: '',
  outcomes: [],
  requirements: 'A browser and internet connection.',
  passingPercent: 80,
  modules: [],
});
function reorder<T>(list: T[], index: number, direction: number) {
  const a = [...list];
  [a[index], a[index + direction]] = [a[index + direction], a[index]];
  return a;
}
export function CourseEditor({ id }: { id: string }) {
  const [course, setCourse] = useState<Course>();
  const [selected, setSelected] = useState<{ module: number; lesson: number }>();
  const [tab, setTab] = useState('details');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (id === 'new') {
      queueMicrotask(() => setCourse(blankCourse()));
    } else
      api<Course>('admin/course?id=' + id)
        .then(setCourse)
        .catch((e) => setMessage(e.message));
  }, [id]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  function update(value: Course) {
    setCourse(value);
    setDirty(true);
  }
  function field<K extends keyof Course>(key: K, value: Course[K]) {
    if (course) update({ ...course, [key]: value });
  }
  function updateLesson(value: Lesson) {
    if (!course || !selected) return;
    update({
      ...course,
      modules: course.modules.map((m, mi) =>
        mi === selected.module
          ? { ...m, lessons: m.lessons.map((l, li) => (li === selected.lesson ? value : l)) }
          : m,
      ),
    });
  }
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const next = await api<Course>('admin/course', course);
      setCourse(next);
      setDirty(false);
      setMessage(
        'Course saved. ' +
          (next.status === 'PUBLISHED'
            ? 'It is now in the public catalog.'
            : 'It is not visible in the public catalog.'),
      );
      if (id === 'new') window.history.replaceState(null, '', '/admin/courses/' + next.id);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!course) return <div>{message || 'Loading course editor…'}</div>;
  const lesson = selected ? course.modules[selected.module]?.lessons[selected.lesson] : undefined;
  return (
    <>
      <Link className="muted" href="/admin">
        ← Manage LibTech
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">COURSE STUDIO</span>
          <h1>{course.title}</h1>
          <p>
            {dirty ? 'You have unsaved changes.' : 'All changes saved.'} · Course ID: {course.id}
          </p>
        </div>
        <button className="button" disabled={busy} onClick={save}>
          {busy ? 'Saving…' : 'Save course'}
        </button>
      </div>
      {message && (
        <div className="alert" role="status">
          {message}
        </div>
      )}
      <div className="admin-tabs">
        <button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>
          Course details
        </button>
        <button
          className={tab === 'curriculum' ? 'active' : ''}
          onClick={() => setTab('curriculum')}
        >
          Modules & lessons
        </button>
      </div>
      {tab === 'details' ? (
        <div className="card card-body form-stack">
          <div className="two-grid">
            <label>
              Course title
              <input
                value={course.title}
                maxLength={150}
                onChange={(e) => field('title', e.target.value)}
              />
            </label>
            <label>
              Course address (slug)
              <input
                value={course.slug}
                pattern="[a-z0-9-]+"
                onChange={(e) => field('slug', e.target.value)}
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              rows={4}
              value={course.description}
              maxLength={2000}
              onChange={(e) => field('description', e.target.value)}
            />
          </label>
          <div className="three-grid">
            <label>
              Difficulty
              <select
                value={course.difficulty}
                onChange={(e) => field('difficulty', e.target.value as Course['difficulty'])}
              >
                {['Beginner', 'Intermediate', 'Advanced'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <input value={course.category} onChange={(e) => field('category', e.target.value)} />
            </label>
            <label>
              Future price in USD (all courses are currently free)
              <input
                type="number"
                step=".01"
                min={0}
                max={1000}
                value={course.priceCents / 100}
                onChange={(e) => field('priceCents', Math.round(Number(e.target.value) * 100))}
              />
            </label>
            <label>
              Estimated duration
              <input value={course.duration} onChange={(e) => field('duration', e.target.value)} />
            </label>
            <label>
              Instructor
              <input
                value={course.instructor}
                onChange={(e) => field('instructor', e.target.value)}
              />
            </label>
            <label>
              Publication status
              <select
                value={course.status}
                onChange={(e) => field('status', e.target.value as Course['status'])}
              >
                {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Display order
              <input
                type="number"
                min={0}
                value={course.order}
                onChange={(e) => field('order', Number(e.target.value))}
              />
            </label>
            <label>
              Final passing percentage
              <input
                type="number"
                min={50}
                max={100}
                value={course.passingPercent}
                onChange={(e) => field('passingPercent', Number(e.target.value))}
              />
            </label>
            <label>
              Thumbnail URL (HTTPS)
              <input
                type="url"
                value={course.thumbnail}
                onChange={(e) => field('thumbnail', e.target.value)}
              />
            </label>
          </div>
          <label>
            Learning outcomes (one per line)
            <textarea
              value={course.outcomes.join('\n')}
              onChange={(e) => field('outcomes', e.target.value.split('\n'))}
            />
          </label>
          <label>
            Requirements
            <textarea
              value={course.requirements}
              onChange={(e) => field('requirements', e.target.value)}
            />
          </label>
          <div className="callout">
            Courses with enrollments keep a fixed curriculum to protect existing progress and
            certificates. Create a new course edition for curriculum changes.
          </div>
        </div>
      ) : (
        <div className="editor-layout">
          <aside className="card card-body">
            <h3>Learning path</h3>
            {course.modules.map((m, mi) => (
              <div key={m.id} className="module-editor">
                <label>
                  Module {mi + 1}
                  <input
                    value={m.title}
                    onChange={(e) =>
                      field(
                        'modules',
                        course.modules.map((v, i) =>
                          i === mi ? { ...v, title: e.target.value } : v,
                        ),
                      )
                    }
                  />
                </label>
                <div className="mini-actions">
                  <button
                    disabled={mi === 0}
                    onClick={() => {
                      field('modules', reorder(course.modules, mi, -1));
                      setSelected(undefined);
                    }}
                  >
                    Move up
                  </button>
                  <button
                    disabled={mi === course.modules.length - 1}
                    onClick={() => {
                      field('modules', reorder(course.modules, mi, 1));
                      setSelected(undefined);
                    }}
                  >
                    Move down
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this module and its lessons?')) {
                        field(
                          'modules',
                          course.modules.filter((_, i) => i !== mi),
                        );
                        setSelected(undefined);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
                {m.lessons.map((l, li) => (
                  <button
                    key={l.id}
                    className={
                      'editor-lesson ' +
                      (selected?.module === mi && selected.lesson === li ? 'active' : '')
                    }
                    onClick={() => setSelected({ module: mi, lesson: li })}
                  >
                    {li + 1}. {l.title}
                    <small>{l.published ? 'Published' : 'Draft'}</small>
                  </button>
                ))}
                <button
                  className="button secondary small wide"
                  onClick={() => {
                    const l: Lesson = {
                      id: crypto.randomUUID(),
                      title: 'New lesson',
                      minutes: 8,
                      published: false,
                      final: false,
                      blocks: [blankBlock()],
                    };
                    field(
                      'modules',
                      course.modules.map((v, i) =>
                        i === mi ? { ...v, lessons: [...v.lessons, l] } : v,
                      ),
                    );
                    setSelected({ module: mi, lesson: m.lessons.length });
                  }}
                >
                  Add lesson
                </button>
              </div>
            ))}
            <button
              className="button secondary wide"
              onClick={() =>
                field('modules', [
                  ...course.modules,
                  { id: crypto.randomUUID(), title: 'New module', lessons: [] },
                ])
              }
            >
              Add module
            </button>
          </aside>
          <section>
            {lesson && selected ? (
              <div className="card card-body form-stack">
                <label>
                  Lesson title
                  <input
                    value={lesson.title}
                    onChange={(e) => updateLesson({ ...lesson, title: e.target.value })}
                  />
                </label>
                <div className="two-grid">
                  <label>
                    Minutes
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={lesson.minutes}
                      onChange={(e) => updateLesson({ ...lesson, minutes: Number(e.target.value) })}
                    />
                  </label>
                  <div>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={lesson.published}
                        onChange={(e) => updateLesson({ ...lesson, published: e.target.checked })}
                      />
                      Published
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={lesson.final}
                        onChange={(e) => updateLesson({ ...lesson, final: e.target.checked })}
                      />
                      Final assessment
                    </label>
                  </div>
                </div>
                <div className="mini-actions">
                  <button
                    disabled={selected.lesson === 0}
                    onClick={() => {
                      field(
                        'modules',
                        course.modules.map((m, i) =>
                          i === selected.module
                            ? { ...m, lessons: reorder(m.lessons, selected.lesson, -1) }
                            : m,
                        ),
                      );
                      setSelected({ ...selected, lesson: selected.lesson - 1 });
                    }}
                  >
                    Move lesson up
                  </button>
                  <button
                    disabled={
                      selected.lesson === course.modules[selected.module].lessons.length - 1
                    }
                    onClick={() => {
                      field(
                        'modules',
                        course.modules.map((m, i) =>
                          i === selected.module
                            ? { ...m, lessons: reorder(m.lessons, selected.lesson, 1) }
                            : m,
                        ),
                      );
                      setSelected({ ...selected, lesson: selected.lesson + 1 });
                    }}
                  >
                    Move lesson down
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this lesson?')) {
                        field(
                          'modules',
                          course.modules.map((m, i) =>
                            i === selected.module
                              ? {
                                  ...m,
                                  lessons: m.lessons.filter((_, li) => li !== selected.lesson),
                                }
                              : m,
                          ),
                        );
                        setSelected(undefined);
                      }
                    }}
                  >
                    Delete lesson
                  </button>
                </div>
                {lesson.blocks.map((b, bi) => (
                  <BlockEditor
                    key={b.id}
                    block={b}
                    index={bi}
                    count={lesson.blocks.length}
                    change={(value) =>
                      updateLesson({
                        ...lesson,
                        blocks: lesson.blocks.map((v, i) => (i === bi ? value : v)),
                      })
                    }
                    move={(direction) =>
                      updateLesson({ ...lesson, blocks: reorder(lesson.blocks, bi, direction) })
                    }
                    remove={() => {
                      if (window.confirm('Delete this block?'))
                        updateLesson({
                          ...lesson,
                          blocks: lesson.blocks.filter((_, i) => i !== bi),
                        });
                    }}
                  />
                ))}
                <button
                  className="button secondary"
                  onClick={() =>
                    updateLesson({ ...lesson, blocks: [...lesson.blocks, blankBlock()] })
                  }
                >
                  Add interactive block
                </button>
              </div>
            ) : (
              <div className="empty">
                <h3>Build a learning experience.</h3>
                <p>
                  Add a module, then a lesson. Select a lesson to create its interactive blocks.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
function BlockEditor({
  block,
  index,
  count,
  change,
  move,
  remove,
}: {
  block: Block;
  index: number;
  count: number;
  change: (b: Block) => void;
  move: (d: number) => void;
  remove: () => void;
}) {
  const interactive = [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'SHORT_ANSWER',
    'MATCHING',
    'ORDERING',
    'SCENARIO',
    'PRACTICE_EXERCISE',
    'AI_EXERCISE',
    'CHECKPOINT',
  ].includes(block.type);
  return (
    <div className="block-editor">
      <div className="block-heading">
        <strong>Block {index + 1}</strong>
        <div className="mini-actions">
          <button aria-label="Move block up" disabled={index === 0} onClick={() => move(-1)}>
            ↑
          </button>
          <button
            aria-label="Move block down"
            disabled={index === count - 1}
            onClick={() => move(1)}
          >
            ↓
          </button>
          <button onClick={remove}>Delete</button>
        </div>
      </div>
      <label>
        Block type
        <select
          value={block.type}
          onChange={(e) => change({ ...block, type: e.target.value as Block['type'] })}
        >
          {blockTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        {block.type === 'IMAGE' ? 'Image URL (HTTPS)' : 'Content / question'}
        <textarea
          rows={3}
          maxLength={6000}
          value={block.text}
          onChange={(e) => change({ ...block, text: e.target.value })}
        />
      </label>
      {interactive && (
        <>
          <label>
            Choices / ordering items (one per line)
            <textarea
              rows={3}
              value={block.options.join('\n')}
              onChange={(e) =>
                change({ ...block, options: e.target.value.split('\n').filter(Boolean) })
              }
            />
          </label>
          <label>
            Accepted answer or example
            <input
              value={block.answer}
              onChange={(e) => change({ ...block, answer: e.target.value })}
            />
            <small>
              Alternatives: separate with |. Ordering: join items with “ → ”. Matching: use “Item =
              partner; Item = partner”.
            </small>
          </label>
          <label>
            Practice rubric keywords (one per line)
            <textarea
              rows={2}
              value={block.rubric.join('\n')}
              onChange={(e) =>
                change({ ...block, rubric: e.target.value.split('\n').filter(Boolean) })
              }
            />
            <small>
              Practice answers pass when they include at least 70% of these keywords. Explain the
              criteria in the question.
            </small>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={block.required}
              onChange={(e) => change({ ...block, required: e.target.checked })}
            />
            Required for completion
          </label>
        </>
      )}
      <label>
        {block.type === 'IMAGE' ? 'Alt text' : 'Explanation / feedback'}
        <textarea
          rows={2}
          value={block.explanation}
          onChange={(e) => change({ ...block, explanation: e.target.value })}
        />
      </label>
    </div>
  );
}
