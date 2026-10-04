import { afterEach, describe, expect, it } from 'vitest';
import { getChecklistTicks, getCompletedLessons, markLessonCompleted, saveChecklistTicks } from '../src/lib/progress';
import { readStored, writeStored } from '../src/lib/storage';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

function useStorage(storage: Storage | 'blocked') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      if (storage === 'blocked') throw new Error('SecurityError: storage blocked');
      return storage;
    },
  });
}

afterEach(() => {
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

describe('with working storage', () => {
  it('remembers completed lessons once each', () => {
    useStorage(memoryStorage());
    markLessonCompleted('investing/israeli-funds-trap');
    markLessonCompleted('investing/israeli-funds-trap');
    expect([...getCompletedLessons()]).toEqual(['investing/israeli-funds-trap']);
  });

  it('remembers checklist ticks per lesson', () => {
    useStorage(memoryStorage());
    saveChecklistTicks('a/b', [true, false, true]);
    expect(getChecklistTicks('a/b', 3)).toEqual([true, false, true]);
    expect(getChecklistTicks('a/other', 2)).toEqual([false, false]);
  });

  it('fits saved ticks to the current number of items', () => {
    useStorage(memoryStorage());
    saveChecklistTicks('a/b', [true, true, true]);
    expect(getChecklistTicks('a/b', 2)).toEqual([true, true]);
    expect(getChecklistTicks('a/b', 4)).toEqual([true, true, true, false]);
  });

  it('ignores corrupt stored values', () => {
    const storage = memoryStorage();
    useStorage(storage);
    storage.setItem('dualpath:completed', '{not json');
    storage.setItem('dualpath:checklist:a/b', '"oops"');
    expect(getCompletedLessons().size).toBe(0);
    expect(getChecklistTicks('a/b', 2)).toEqual([false, false]);
  });
});

describe('with blocked storage', () => {
  it('never throws and falls back to empty state', () => {
    useStorage('blocked');
    expect(() => writeStored('x', 1)).not.toThrow();
    expect(readStored('x', 'fallback')).toBe('fallback');
    expect(() => markLessonCompleted('a/b')).not.toThrow();
    expect(getCompletedLessons().size).toBe(0);
    expect(() => saveChecklistTicks('a/b', [true])).not.toThrow();
    expect(getChecklistTicks('a/b', 1)).toEqual([false]);
  });
});
