import { useEffect, useState } from 'react';

/** Tiny client-side router: the path is the page. */
export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    window.addEventListener('navigate', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('navigate', onChange);
    };
  }, []);
  return path;
}

export function navigate(path: string): void {
  if (path === window.location.pathname) return;
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('navigate'));
  window.scrollTo(0, 0);
}

/** Link that navigates without reloading the page. */
export function linkProps(path: string) {
  return {
    href: path,
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(path);
    },
  };
}
