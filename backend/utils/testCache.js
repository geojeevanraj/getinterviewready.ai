/**
 * Cache Testing Utility
 * Quick tests to verify in-memory cache functionality
 */

import cache from './cache.js';

console.log('🧪 Testing In-Memory Cache...\n');

// Test 1: Basic Set/Get
console.log('Test 1: Basic Set/Get');
cache.set('test-key', { data: 'test-value' }, 5000);
const value = cache.get('test-key');
console.log('✓ Set and Get:', value?.data === 'test-value' ? 'PASSED' : 'FAILED');

// Test 2: Has key
console.log('\nTest 2: Has Key');
console.log('✓ Has key:', cache.has('test-key') ? 'PASSED' : 'FAILED');

// Test 3: Non-existent key
console.log('\nTest 3: Non-existent Key');
const nullValue = cache.get('non-existent');
console.log('✓ Returns null:', nullValue === null ? 'PASSED' : 'FAILED');

// Test 4: Delete key
console.log('\nTest 4: Delete Key');
cache.delete('test-key');
console.log('✓ Key deleted:', !cache.has('test-key') ? 'PASSED' : 'FAILED');

// Test 5: TTL expiration
console.log('\nTest 5: TTL Expiration (2 seconds)...');
cache.set('expire-key', { data: 'will-expire' }, 2000);
console.log('  - Set with 2s TTL');
setTimeout(() => {
  const expired = cache.get('expire-key');
  console.log('  ✓ After 2s, key expired:', expired === null ? 'PASSED' : 'FAILED');
}, 2500);

// Test 6: Cache stats
setTimeout(() => {
  console.log('\nTest 6: Cache Statistics');
  const stats = cache.getStats();
  console.log('  - Total entries:', stats.totalEntries);
  console.log('  - Active entries:', stats.activeEntries);
  console.log('  - Memory usage:', (stats.memoryUsage / 1024 / 1024).toFixed(2), 'MB');
  console.log('  ✓ Stats retrieved: PASSED');
  
  console.log('\n✅ All cache tests completed!\n');
  process.exit(0);
}, 3000);
