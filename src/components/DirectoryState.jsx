import Icon from "./Icon.jsx";

export default function DirectoryState({ type, onAction }) {
  if (type === "loading") {
    return (
      <div aria-busy="true">
        <p role="status" className="loading-label">
          <span className="spinner" /> Fetching the directory...
        </p>
        <div className="people-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="person-card skeleton" key={index}>
              <div className="skeleton-avatar" />
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
              <div className="skeleton-divider" />
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isError = type === "error";
  const isEmptyDirectory = type === "empty-directory";
  return (
    <div className="directory-state" role={isError ? "alert" : "status"}>
      <span className={`state-icon ${isError ? "state-error" : ""}`}>
        <Icon
          name={isError ? "alert" : isEmptyDirectory ? "people" : "search"}
          size={29}
        />
      </span>
      <h3>
        {isError
          ? "A little connection trouble."
          : isEmptyDirectory
            ? "No people here just yet."
            : "No people found."}
      </h3>
      <p>
        {isError
          ? "We couldn't load the directory. Check your connection and try again."
          : isEmptyDirectory
            ? "The API returned an empty directory. Try refreshing in a moment."
            : "Try another name, email, company, or city. You can also clear your filters and start fresh."}
      </p>
      <button className="button button-dark" onClick={onAction}>
        <Icon
          name={isError || isEmptyDirectory ? "refresh" : "close"}
          size={17}
        />
        {isError
          ? "Retry"
          : isEmptyDirectory
            ? "Refresh directory"
            : "Clear filters"}
      </button>
    </div>
  );
}
