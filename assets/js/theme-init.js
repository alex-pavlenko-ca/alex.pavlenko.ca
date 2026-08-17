(() => {
  let saved = null;
  try { saved = localStorage.getItem('alex-theme'); } catch (_) {}
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (systemDark ? 'dark' : 'light');
})();
