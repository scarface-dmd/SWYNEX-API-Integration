import Icon from "./Icon.jsx";

export default function PersonCard({ user, index }) {
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  // Only allow web links, even if a future API returns a different URL scheme.
  let websiteUrl = null;
  try {
    const url = new URL(
      /^https?:\/\//i.test(user.website)
        ? user.website
        : `https://${user.website}`,
    );
    if (["http:", "https:"].includes(url.protocol)) websiteUrl = url.href;
  } catch {
    // Keep the website text visible if it cannot be turned into a valid link.
  }

  return (
    <article className="person-card" aria-labelledby={`person-${user.id}`}>
      <div className="card-topline">
        <div className={`avatar avatar-${index % 5}`} aria-hidden="true">
          {initials}
        </div>
        <span className="person-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 id={`person-${user.id}`}>{user.name}</h3>
      <p className="company">{user.company.name}</p>
      <dl className="person-details">
        <div>
          <dt>
            <Icon name="mail" />
            <span className="sr-only">Email</span>
          </dt>
          <dd>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </dd>
        </div>
        <div>
          <dt>
            <Icon name="pin" />
            <span className="sr-only">City</span>
          </dt>
          <dd>{user.address.city}</dd>
        </div>
        <div>
          <dt>
            <Icon name="globe" />
            <span className="sr-only">Website</span>
          </dt>
          <dd>{user.website}</dd>
        </div>
      </dl>
      <div className="card-bottom">
        <span className="location-tag">
          <span />
          {user.address.city}
        </span>
        {websiteUrl && (
          <a
            className="website-link"
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit website for ${user.name} (opens in a new tab)`}
          >
            Visit website <Icon name="arrow" size={15} />
          </a>
        )}
      </div>
    </article>
  );
}
