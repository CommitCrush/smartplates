import { getCachedResults, setCachedResults, cache } from '../src/lib/cache/spoonacularCache';

describe('spoonacularCache', () => {
  it('should cache and retrieve results', () => {
    const key = 'test-key';
    const value = [{ id: 1, title: 'Test', image: 'test.jpg' }];
    setCachedResults(key, value);
    const cached = getCachedResults(key);
    expect(cached).toEqual(value);
  });

  it('should expire cache after 1 hour', () => {
    const key = 'expire-key';
    const value = [{ id: 2, title: 'Expire', image: 'expire.jpg' }];
    setCachedResults(key, value);
    // Manipulate expires for test
  cache[key].expires = Date.now() - 1000;
  const cached = getCachedResults(key);
  expect(cached).toBeNull();
  });
});
