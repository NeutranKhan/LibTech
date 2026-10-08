import test from 'node:test';
import assert from 'node:assert/strict';
import { seedCourse } from '../src/lib/seed';
import { courseSchema, grade, isExercise, lessons } from '../src/lib/domain';
test('expanded curriculum is publishable and every activity has a passing reference answer', () => {
  courseSchema.parse(seedCourse);
  assert.ok(Buffer.byteLength(JSON.stringify(seedCourse)) < 300000);
  const all = lessons(seedCourse);
  assert.equal(all.length, 19);
  assert.equal(new Set(all.map((l) => l.id)).size, all.length);
  for (const lesson of all) {
    assert.equal(new Set(lesson.blocks.map((b) => b.id)).size, lesson.blocks.length);
    assert.ok(
      lesson.blocks
        .filter((b) => b.type === 'TEXT')
        .map((b) => b.text)
        .join(' ')
        .split(/\s+/).length >= 250,
      lesson.id,
    );
    for (const b of lesson.blocks.filter(isExercise)) {
      assert.equal(grade(b, b.answer).score, 10, lesson.id + '/' + b.id);
      assert.equal(grade(b, '').score, 0, lesson.id + '/' + b.id);
      if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKPOINT'].includes(b.type)) {
        assert.ok(b.options.includes(b.answer));
        for (const wrong of b.options.filter((o) => o !== b.answer))
          assert.equal(grade(b, wrong).score, 0);
      }
    }
  }
  assert.equal(all.flatMap((l) => l.blocks.filter(isExercise)).length, 66);
  assert.equal(all.at(-1)!.blocks.filter((b) => isExercise(b) && b.required).length, 10);
});
