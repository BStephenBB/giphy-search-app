const apiKey = process.env.REACT_APP_GIPHY_KEY;

export const pageSize = 10; // set desired page size
const searchUrl = `https://api.giphy.com/v1/gifs/search?lang=en&limit=${pageSize}&rating=g&api_key=${apiKey}`;

// see https://developers.giphy.com/docs/api/endpoint#search for api docs

// basic helper function to return gifs based on a search term, and offset
export async function searchForGifs(searchTerm, offSet) {
  return await fetch(
    `${searchUrl}&q=${searchTerm}&offset=${offSet}`
  ).then(res => res.json());
}

/* --- Cache implementation --- */

/* Going to make a basic least recently used cache (LRU) to store the api responses. A doublely linked list 
with a hashmap is a good way to do this and be able to both read and write to/from the cache in linear time.
The cache is also going to make requests when something that isn't already cached is asked for 
(and the response will get cached). */

// response class, which will be the the "nodes" in our linked list
class GifResponse {
  constructor(urlId, imageUrls, previousResponse = null, nextResponse = null) {
    this.urlId = urlId;
    this.imageUrls = imageUrls;
    this.previousResponse = previousResponse;
    this.nextResponse = nextResponse;
  }
}

// cache can be instantiated with any arbitrary size limit
export class GiphyCache {
  constructor(maxSize = 10) {
    this.size = 0;
    this.maxSize = maxSize;
    this.head = null;
    this.tail = null;
    this.cache = {};
    this.totalCount = null;
  }

  addResponse(urlId, imageUrls) {
    // make sure cache has space for a new entry
    this.guaranteeLimit();

    // if the list is empty, initialize the head and tail with the response
    if (!this.head) {
      this.head = this.tail = new GifResponse(urlId, imageUrls);
      this.cache[urlId] = imageUrls;
    } else {
      // otherwise add the new response to the front of the list
      const gifResponse = new GifResponse(urlId, imageUrls, this.head);
      this.head.nextResponse = gifResponse;
      this.head = gifResponse;
    }
    // update our map & increase the size
    this.cache[urlId] = this.head;
    this.size++;
  }

  // remove an entry from the cache
  removeResponse(urlId) {
    // get the response to remove from the map
    const responseToRemove = this.cache[urlId];

    // deal with the left side of the "hole" that the removed response is going to leave
    if (responseToRemove.previousResponse !== null) {
      responseToRemove.previousResponse.nextResponse =
        responseToRemove.nextResponse;
    } else {
      this.tail = responseToRemove.nextResponse;
    }

    // and then the right side
    if (responseToRemove.nextResponse !== null) {
      responseToRemove.nextResponse.previousResponse =
        responseToRemove.previousResponse;
    } else {
      this.head = responseToRemove.previousResponse;
    }

    // finally remove the response from the map and reduce the current size
    delete this.cache[urlId];
    this.size--;
  }

  // get a response from the cache given the `urlId`, and if not, make a request to get needed response and then add that response to the cache
  async getResponse(urlId, callback) {
    if (this.cache[urlId]) {
      const { imageUrls } = this.cache[urlId];
      // make sure to remove and re-add the response so that it's back at the start of the line and doesn't get removed before it's supposed to
      this.removeResponse(urlId);
      this.addResponse(urlId, imageUrls);
      return imageUrls;
    } else {
      // otherwise, get the response with the provided callback function, and then cache is
      const {
        data,
        pagination: { total_count }
      } = await callback();
      this.addResponse(urlId, {
        images: data,
        totalCount: total_count
      });
      return this.cache[urlId].imageUrls;
    }
  }

  // if we are at the limit, remove the LRU item to make space for the next item
  guaranteeLimit() {
    if (this.size === this.maxSize) {
      this.removeResponse(this.tail.urlId);
    }
  }
}
