This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project Requirements

Build a React app that...

1. has a search input field and a 'Search' button.

2. queries the giphy API 'search' endpoint (https://developers.giphy.com/docs/) using the term in the input field when the user clicks Search.

3. displays the results from the search in a grid. You'll need to figure out which url from giphy can be used in your results - the API returns a lot of options and some are not useable as img src's.

4. caches search results and re-uses them if the same query happens twice.

5. has pagination controls for search results below the grid.

## Project Notes / Summary / Thoughts

I decided to implement an in-memory least recently used cache to cache the responses. While a LFU cache might be good for users that keep coming back for their go-to cat gif, since this is just done in memory, the chances of that happening are low. The main reason I went with a LRU cache replacement policy is because the pagination buttons will likely cause users to go back and forth between results on each search, and we wouldn't want to clear page 1 of a new query when the user goes to page 2 etc. just because its the first time the user has searched a term. In practice, a persistent cache would probably be better for an app like this; see things to add section.

The rest of the app is pretty standard React code. I didn't feel the need to componetize too much since given the scope of the project and did all the stlying with css; a CSS-in-JSS solution doesn't seem worth it for a project of this scale. The styles are pretty basic; I used a bit of flexbox to position things, css grid for the image grid, and a couple style adjustments with a media query to make the page responsive. I also used css custom properties for variables.

I made sure to make this app accessible; semantic elements, appropriate color contrast, and all neccessary states on the input/buttons are included. It should be keyboard accessible, easy to understand w/ a screen-reader, and usable for people with poor vision.

### Things to add / Improvements

- Error handling / messaging
- A persistent caching solution over the basic in-memory solution using something like [indexDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) or the [browser's built in cache interface](https://developer.mozilla.org/en-US/docs/Web/API/Cache) w/ a worker would make more sense for an app like this
- I regret coupling the cache with making requests. I think it's a bit to "cute" of a solution, and separating concerns would make for a more functional and testable implementation.
- Would be fun to play around with react suspense to render as we fetch (rather than fetching on render)
- Realistically, gifs are terribly inefficient, so we should use some of the video formats provided by Giphy and simulate "gif-like" behavior to reduce request size and speed up loading time, [explained here](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/replace-animated-gifs-with-video/?utm_source=lighthouse&utm_medium=devtools#replacing_animated_gif_img_elements_with_video). Would probably make even more sense to just show images, and then load the "gifs" on hover or click.
- To properly conceal the api key, should make a backend that makes the requests so they're not client-side
- A hybrid LFU and LRU caching system might be cool. Also would want to add some time-expiration for the cache if we implemented a persistent solution
- I just forced all the gifs to be the same size, which messes up the aspect ratio, and cuts of parts of them. Ideally this would be styled in a way so avoid this. I also only displayed the preview gif, would probably want to show the longer one, but for testing/developing it was easier to not have to load nearly as much data

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

**Make sure you create an `.env.local` file in the root of your project with the giphy api key in it to run properly.** See `.env.config` for the exact formatting. Your env file should have `REACT_APP_GIPHY_KEY=api_key_here` in it. CRA also supports adding in api keys in the CLI, if desired.

The page will reload if you make edits.<br />

### `npm run test`

Launches the test runner in the interactive watch mode.<br />

Currently there's only a basic test to make sure the cache behaves properly.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
