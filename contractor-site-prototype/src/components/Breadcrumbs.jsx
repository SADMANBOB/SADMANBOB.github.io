export function Breadcrumbs({ currentLabel, homeHref = "/contracting/" }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href={homeHref}>Contracting home</a></li><li aria-current="page">{currentLabel}</li></ol></nav>;
}
