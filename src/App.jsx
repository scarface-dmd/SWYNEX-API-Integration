import { useEffect, useState } from "react";
import Icon from "./components/Icon.jsx";
import PersonCard from "./components/PersonCard.jsx";
import DirectoryState from "./components/DirectoryState.jsx";

const API_URL = "https://jsonplaceholder.typicode.com/users";

export default function App() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [requestId, setRequestId] = useState(0);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    // A timeout keeps a stalled connection from leaving the page loading forever.
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;

    async function loadUsers() {
      setStatus("loading");
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        const isValid =
          Array.isArray(data) &&
          data.every(
            (user) =>
              user &&
              (typeof user.id === "number" || typeof user.id === "string") &&
              [
                user.name,
                user.email,
                user.address?.city,
                user.company?.name,
                user.website,
              ].every(
                (value) => typeof value === "string" && value.trim().length > 0,
              ),
          );
        if (!isValid) throw new Error("Unexpected API response");
        if (active) {
          setUsers(data);
          setStatus("success");
        }
      } catch {
        if (active) setStatus("error");
      } finally {
        clearTimeout(timeout);
      }
    }

    loadUsers();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [requestId]);

  const cities = [...new Set(users.map((user) => user.address.city))].sort(
    (a, b) => a.localeCompare(b),
  );
  const query = search.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch = [
      user.name,
      user.email,
      user.address.city,
      user.company.name,
    ].some((value) => value.toLowerCase().includes(query));
    return matchesSearch && (!city || user.address.city === city);
  });
  const hasFilters = search !== "" || city !== "";

  function clearFilters() {
    setSearch("");
    setCity("");
  }

  function refreshDirectory() {
    setStatus("loading");
    setRequestId((current) => current + 1);
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#directory">
        Skip to directory
      </a>
      <header className="site-header">
        <a className="brand" href="./">
          <span className="brand-mark" aria-hidden="true">
            s<span />
          </span>
          SWYNEX
          <span className="brand-divider" />
          <span className="brand-product">the directory</span>
        </a>
        <a
          className="source-link"
          href={API_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="live-dot" />
          Public API <Icon name="arrow" size={14} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> GOOD PEOPLE. ONE PLACE.
            </p>
            <h1 id="page-title">
              Big ideas start
              <br />
              with <span>good people.</span>
              <span className="hero-asterisk" aria-hidden="true">
                *
              </span>
            </h1>
            <p className="hero-description">
              A small directory. A world of connections.
              <br />
              Find the people and companies you're looking for.
            </p>
          </div>
          <aside className="hero-note" aria-label="About this directory">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar-0">LG</span>
              <span className="avatar-1">EH</span>
              <span className="avatar-2">CB</span>
              <span className="stack-plus">+</span>
            </div>
            <p>
              A few new faces.
              <br />
              <strong>Endless possibilities.</strong>
            </p>
            <span className="note-caption">EXPLORE. CONNECT. REPEAT.</span>
          </aside>
        </section>

        <section
          id="directory"
          className="directory"
          aria-labelledby="directory-title"
          tabIndex={-1}
        >
          <div className="section-heading">
            <div className="section-title">
              <span className="section-icon">
                <Icon name="people" size={20} />
              </span>
              <h2 id="directory-title">People directory</h2>
              <span
                className="count-badge"
                aria-label={
                  status === "success"
                    ? `${users.length} people total`
                    : "Total unavailable"
                }
              >
                {status === "success" ? users.length : "--"}
              </span>
            </div>
            <button
              className="refresh-button"
              onClick={refreshDirectory}
              disabled={status === "loading"}
            >
              <Icon name="refresh" size={16} />
              Refresh<span className="desktop-only"> directory</span>
            </button>
          </div>

          <div className="filter-bar">
            <div className="search-field">
              <Icon name="search" />
              <label className="sr-only" htmlFor="people-search">
                Search by name, email, city, or company
              </label>
              <input
                id="people-search"
                type="search"
                placeholder="Search by name, email, city, or company..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoComplete="off"
              />
              <span className="search-hint" aria-hidden="true">
                SEARCH
              </span>
            </div>
            <div className="city-field">
              <Icon name="pin" size={19} />
              <label className="sr-only" htmlFor="city-filter">
                Filter by city
              </label>
              <select
                id="city-filter"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                disabled={status !== "success"}
              >
                <option value="">All cities</option>
                {cities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="results-toolbar">
            <p role="status" aria-live="polite">
              {status === "success" ? (
                <>
                  Showing <strong>{filteredUsers.length}</strong> of{" "}
                  {users.length} people
                  {city && (
                    <>
                      {" "}
                      in <strong>{city}</strong>
                    </>
                  )}
                </>
              ) : status === "loading" ? (
                "Getting everyone together"
              ) : (
                "Directory unavailable"
              )}
            </p>
            {hasFilters ? (
              <button className="clear-button" onClick={clearFilters}>
                Clear filters <Icon name="close" size={14} />
              </button>
            ) : (
              <span className="results-note">
                A little discovery goes a long way.
              </span>
            )}
          </div>

          {status === "loading" ? (
            <DirectoryState type="loading" />
          ) : status === "error" ? (
            <DirectoryState type="error" onAction={refreshDirectory} />
          ) : users.length === 0 ? (
            <DirectoryState
              type="empty-directory"
              onAction={refreshDirectory}
            />
          ) : filteredUsers.length === 0 ? (
            <DirectoryState type="empty" onAction={clearFilters} />
          ) : (
            <div className="people-grid">
              {filteredUsers.map((user) => (
                <PersonCard
                  key={user.id}
                  user={user}
                  index={users.indexOf(user)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="bottom-note" aria-label="Keep exploring">
          <span className="bottom-symbol" aria-hidden="true">
            *
          </span>
          <div>
            <h2>Real connections start with a hello.</h2>
            <p>Explore a profile. Drop an email. See where it goes.</p>
          </div>
          <span className="sample-label">
            SAMPLE PEOPLE.
            <br />
            REAL POSSIBILITIES.
          </span>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          <strong>SWYNEX</strong>
          <span className="footer-separator">/</span>API Integration{" "}
          <span className="task-label">TASK 03</span>
        </p>
        <p>
          Sample data from{" "}
          <a
            href="https://jsonplaceholder.typicode.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            JSONPlaceholder
            <span className="sr-only"> (opens in a new tab)</span>
            <Icon name="arrow" size={12} />
          </a>
        </p>
      </footer>
    </div>
  );
}
