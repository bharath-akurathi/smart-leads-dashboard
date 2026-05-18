import '@testing-library/jest-dom';

// Mock window.matchMedia for ThemeContext
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL.createObjectURL for CSV download tests
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: () => 'blob:mock-url',
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: () => {},
});
