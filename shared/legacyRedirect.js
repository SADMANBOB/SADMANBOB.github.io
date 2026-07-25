const target = document.body.dataset.redirectTarget;

if (target?.startsWith("/") && !target.startsWith("//")) {
  window.location.replace(`${target}${window.location.search}${window.location.hash}`);
}
