/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: channel('bg'),
        plate: channel('plate'),
        'plate-hi': channel('plate-hi'),
        line: channel('line'),
        ink: channel('ink'),
        muted: channel('muted'),
        accent: channel('accent'),
        'accent-hi': channel('accent-hi'),
        'accent-deep': channel('accent-deep'),
        'accent-ink': channel('accent-ink'),
        ok: channel('ok'),
        bad: channel('bad'),
        warn: channel('warn'),
        panel: channel('panel'),
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        num: ['Oswald', '"Arial Narrow"', 'sans-serif'],
        hero: ['Anton', 'Oswald', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
