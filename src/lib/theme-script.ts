export const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('smartplates-theme') || 'system';
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      root.classList.remove(systemTheme === 'dark' ? 'light' : 'dark');
    }
  } catch (e) {
    console.warn('Theme script error:', e);
  }
})()`;