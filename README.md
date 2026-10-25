# SWYNEX API Integration - People Directory

A standalone SWYNEX Task 3 project built with React 19 and Vite. A responsive, searchable people directory with a warm ivory palette, navy typography, pastel initial avatars, and reusable profile cards.

This is a standalone Task 3 project containing the People Directory source, tests, demo video, and setup documentation.

## Demo Video

[Watch the Task 3 People Directory demo (MP4, 25 seconds)](docs/demo/swynex-api-integration-demo.mp4)

The recording shows real API users loading, search, city filtering, the no-results state, and clearing filters. It was captured in an isolated browser with live API data and network throttling to make loading visible. The silent, 24.88-second MP4 was verified to play from start to finish.

## Setup

Use Node.js 22.12 or newer and npm. Development and verification were performed with Node.js 24.15.0 and npm 11.12.1.

Run these commands from this project folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally **http://127.0.0.1:5173**. The server binds to the local machine only. No environment variables, API keys, account, paid service, or backend are needed.

## Production Preview

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

The production files are generated in `dist/`. The preview URL is **http://127.0.0.1:4173**. This is a local preview, not a deployed website. If the port is already in use, stop the existing preview before starting another one. Use `Ctrl+C` to stop a foreground server.

## API Source

The app fetches users directly in the browser with the native Fetch API:

```text
GET https://jsonplaceholder.typicode.com/users
```

Source: [JSONPlaceholder](https://jsonplaceholder.typicode.com/). The live endpoint returned 10 sample users during verification. These are fictional profiles, not a real employee database. Email links open the device's configured mail client; website links open a new tab. The sample email addresses and external websites are not verified contact destinations.

Internet access is required to fetch the directory. Google Fonts supplies DM Sans and Manrope for the visual design; local font fallbacks keep the app usable if the font service is unavailable. Icons and initial avatars are rendered locally, without a photo or icon API.

## Features

- Fetches and displays each person's name, email, city, company, and website.
- Loading message and six skeleton cards while fetching.
- Clear error message and a working Retry button for failed requests.
- Handles non-success HTTP responses, network failures, invalid JSON, unexpected response shapes, and a 15-second request timeout.
- Aborts requests when the component unmounts or a request is replaced.
- Case-insensitive partial search across name, email, city, and company, ignoring surrounding search whitespace.
- Alphabetically sorted city filter built from the fetched users.
- Search and city filter work together; clear actions reset both.
- Result count, no-match state, and a separate empty-directory state.
- Refresh button refetches data while preserving search and city selections.
- One-column mobile, two-column tablet, and three-column desktop card layouts.
- Accessible input labels, semantic headings, status announcements, skip link, visible focus outlines, native keyboard-friendly controls, and reduced-motion support.
- External links use `noopener noreferrer` and announce that they open a new tab.

## Project Structure

```text
public/
  favicon.svg
src/
  components/
    DirectoryState.jsx  # Reusable loading, empty, and error views
    Icon.jsx            # Local SVG icons
    PersonCard.jsx      # Reusable profile card
  App.jsx               # Fetching, search/filter state, and page layout
  main.jsx              # React entry point
  styles.css            # Visual design, breakpoints, and focus states
tests/
  directory.spec.js     # Browser interaction and accessibility tests
index.html
playwright.config.js
vite.config.js
```

The app uses React state and effects without a routing library, global state manager, or additional data-fetching framework. Ten sample users are filtered locally; typing does not generate extra API requests.

## Run the Tests

Install the browser once:

```sh
npx playwright install chromium
```

Run the suite:

```sh
npm test
```

`npm test` builds the production bundle, starts a local Vite preview on port 4173 if needed, and runs Playwright in Chromium against that build. An existing preview on this port must serve this project. The test-managed preview is stopped automatically afterward; an independently started preview remains running.

For the interactive Playwright runner:

```sh
npm run test:ui
```

Most tests intercept the API with controlled fixtures so failure and loading scenarios are reproducible. One separate test uses the actual public API without interception and therefore requires internet access and API availability. The displayed app does not use the test fixtures or a hardcoded user list.

Screenshots from the responsive checks and the live directory are generated under `test-results/`. Failure traces are retained there when a test fails. Generated artifacts, dependencies, and production output are ignored by Git.

## Checks Actually Run

Final verification on October 23, 2026:

| Check              | Actual result                                                                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`    | Passed; production assets generated successfully. Also rerun by the final `npm test`.                                                                                                                                                               |
| `npm test`         | **22 tests passed** in Chromium against the production build.                                                                                                                                                                                       |
| Loading            | Delayed API response showed loading text and six skeletons; cards appeared after release.                                                                                                                                                           |
| Successful display | Required profile fields, email links, website URLs, and result count passed assertions.                                                                                                                                                             |
| Search             | Name, email, city, and company searches passed, including case-insensitivity and whitespace handling.                                                                                                                                               |
| City filtering     | Sorted options, city selection, combined search/filter behavior, and clearing both controls passed.                                                                                                                                                 |
| Empty results      | No-match message, zero result count, and clear actions passed.                                                                                                                                                                                      |
| Empty API          | Empty-directory state and refresh recovery passed.                                                                                                                                                                                                  |
| Error/retry        | HTTP 503, network failure, invalid JSON, and invalid response shape each showed an error and recovered through Retry.                                                                                                                               |
| Timeout/retry      | Simulated elapsed time triggered the 15-second timeout; Retry recovered.                                                                                                                                                                            |
| Refresh            | A new request was made and existing search/city selections were preserved.                                                                                                                                                                          |
| Keyboard           | Tab navigation, skip link, typing into search, and keyboard city selection passed.                                                                                                                                                                  |
| Responsive layout  | 320px, 390px, 768px, and 1440px viewport checks passed with expected column counts and no page-level horizontal overflow. Screenshots were captured.                                                                                                |
| Accessibility      | Axe scans for WCAG 2 A/AA and WCAG 2.1 A/AA rules found zero violations in success, empty, and error states, and in the full live directory. Initial contrast and accessible-name issues were fixed before the final passing run.                   |
| Live API           | Actual endpoint loaded 10 users and 10 city options plus All cities, with no browser runtime exceptions.                                                                                                                                            |
| Dependency audit   | `npm audit --registry=https://registry.npmjs.org` reported **0 vulnerabilities**. The initially configured npm mirror did not support the audit endpoint, so the public registry was used for this check without changing global npm configuration. |

Additional verification: Prettier's formatting check passed for the source, tests, configuration, HTML, JSON, and README. The independently started production preview at `http://127.0.0.1:4173` returned HTTP 200.

## Limits

- Browser automation was run in Chromium only. Firefox, WebKit, physical devices, and manual screen-reader testing were not performed.
- Automated accessibility scans are useful checks, not a guarantee of full accessibility conformance.
- The app intentionally shows an error when the public API cannot be reached. It does not contain an offline cache or a backend proxy.
- External sample websites and email delivery were not tested. They are outside this project's control.
- No known outstanding functional failures in the checks above. The local preview is not a hosted deployment.
