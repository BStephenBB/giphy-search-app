import { GiphyCache } from './helpers';

// Just a crude test to make sure the cache is working at a basic level

const dummyResponse = {
  data: 'dummy data',
  pagination: { total_count: 100 }
};
async function mockApiCall() {
  return new Promise(resolve => resolve(dummyResponse));
}

it('basic LRU cache methods work', async () => {
  const maxSize = 5;
  const gifCache = new GiphyCache(maxSize);
  // fill up the cache
  gifCache.addResponse('request1', 'response1');
  gifCache.addResponse('request2', 'response2');
  gifCache.addResponse('request3', 'response3');
  gifCache.addResponse('request4', 'response4');
  gifCache.addResponse('request5', 'response5');
  // this should cause the 1st request to be removed
  gifCache.addResponse('request6', 'response6');
  // make sure we can remove from the tail, head, and middle of the linked list
  expect(gifCache.size).toBe(maxSize);
  gifCache.removeResponse('request2');
  expect(gifCache.size).toBe(4);
  gifCache.removeResponse('request4');
  expect(gifCache.size).toBe(3);
  gifCache.removeResponse('request5');
  expect(gifCache.size).toBe(2);
  // make sure we access something in the cache properly
  const existingResponse = await gifCache.getResponse('request3', () => {});
  expect(existingResponse).toBe('response3');
  // make sure requesting something not in the cache works properly
  const newResponse = await gifCache.getResponse('request999', mockApiCall);
  console.log(newResponse);
  expect(newResponse).toEqual({ images: 'dummy data', totalCount: 100 });
});
