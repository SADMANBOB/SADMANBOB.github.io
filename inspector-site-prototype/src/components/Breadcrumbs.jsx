export function Breadcrumbs({ items, linkFor, onNavigate }) {
  if (!items?.length) return null;
  const crumbs = [{ label: "Home", path: "/" }, ...items];
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((item, index) => (
          <li key={`${item.path}-${item.label}`}>
            {index < crumbs.length - 1 ? (
              <a href={linkFor(item.path)} onClick={(event) => onNavigate(event, item.path)}>{item.label}</a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
