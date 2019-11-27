import React, { useState, useRef } from 'react';
import { searchForGifs, GiphyCache, pageSize } from './helpers';

function App() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // initialize cache since we want it's value to persist for the full lifetime of the component
  // initilized with a very small size limit so it's easy to see it working. Can always be incrased.
  const cache = useRef(new GiphyCache(4));

  const searchAndSetImage = async pageNumber => {
    if (query.trim()) {
      // Using a closure here to create the request callback rather than having to pass a bunch more parameters
      const { images, totalCount } = await cache.current.getResponse(
        query + pageNumber.toString(),
        function() {
          return searchForGifs(query, pageNumber * pageSize);
        }
      );
      setImages(images);
      setTotalCount(totalCount);
    }
  };

  // for keyboard accessibility
  const handleSubmit = e => {
    e.preventDefault();
    searchAndSetImage(page);
  };

  // pagination controls
  const nextHandler = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchAndSetImage(nextPage);
  };

  const prevHandler = () => {
    const previousPage = page - 1;
    setPage(previousPage);
    searchAndSetImage(previousPage);
  };

  // calculate if there are no more pages (add 1 since pages start at 0)
  const noMoreImages = (page + 1) * pageSize >= totalCount;

  return (
    <>
      <form className="searchForm" onSubmit={handleSubmit}>
        <div role="search" className="searchContainer">
          <label className="title" htmlFor="search">
            Search for a GIF!
          </label>
          <div className="searchFieldWrapper">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              type="text"
              className="searchBar"
              placeholder="Search here..."
            />
            <input
              type="button"
              className="searchButton"
              value="Search"
              onClick={searchAndSetImage}
            />
          </div>
        </div>
      </form>
      <div className="imageGrid">
        {images.map(({ images, title, id }) => (
          <figure key={id}>
            <img src={images.preview_gif.url} alt={title} className="gif" />
          </figure>
        ))}
      </div>
      {images.length > 0 ? (
        <div className="pageControlsWrapper">
          <button
            onClick={prevHandler}
            disabled={page === 0}
            className="searchButton"
          >
            prev
          </button>
          <button
            onClick={nextHandler}
            className="searchButton"
            disabled={noMoreImages}
          >
            next
          </button>
        </div>
      ) : null}
    </>
  );
}

export default App;
