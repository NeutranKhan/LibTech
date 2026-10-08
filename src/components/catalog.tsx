'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/lib/domain';
export function Catalog({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All levels');
  const [category, setCategory] = useState('All categories');
  const filtered = courses.filter(
    (c) =>
      (c.title + ' ' + c.description).toLowerCase().includes(search.toLowerCase()) &&
      (difficulty === 'All levels' || c.difficulty === difficulty) &&
      (category === 'All categories' || c.category === category),
  );
  return (
    <>
      <div className="filter-bar">
        <label className="grow">
          Find your next skill
          <input
            type="search"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          Level
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {['All levels', 'Beginner', 'Intermediate', 'Advanced'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {['All categories', ...new Set(courses.map((c) => c.category))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted">
        {filtered.length} {filtered.length === 1 ? 'course' : 'courses'} to explore
      </p>
      <div className="catalog-grid">
        {filtered.map((c) => (
          <article className="card course-card" key={c.id}>
            <div className="course-cover">
              {c.thumbnail && (
                <picture>
                  <img src={c.thumbnail} alt="" loading="lazy" className="course-thumbnail" />
                </picture>
              )}
              <span>{c.category}</span>
              <strong>
                AI<span>✳</span>
              </strong>
              <span>LEARN · PRACTICE · GROW</span>
            </div>
            <div className="card-body">
              <span className="badge">{c.difficulty}</span>
              <h2>{c.title}</h2>
              <p>{c.description}</p>
              <div className="muted small-text">
                {c.duration} · {c.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons
              </div>
              <div className="course-bottom">
                <strong className="price">${(c.priceCents / 100).toFixed(0)}</strong>
                <Link className="button small" href={'/courses/' + c.slug}>
                  View course
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <h3>No courses match just yet.</h3>
          <p>Try another search or choose all levels.</p>
          <button
            className="button secondary"
            onClick={() => {
              setSearch('');
              setDifficulty('All levels');
              setCategory('All categories');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
