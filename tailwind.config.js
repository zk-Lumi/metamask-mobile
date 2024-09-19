const background = {
  default: 'var(--color-background-default)',
  'default-hover': 'var(--color-background-default-hover)',
  'default-pressed': 'var(--color-background-default-pressed)',
  alternative: 'var(--color-background-alternative)',
  'alternative-hover': 'var(--color-background-alternative-hover)',
  'alternative-pressed': 'var(--color-background-alternative-pressed)',
  hover: 'var(--color-background-hover)',
  pressed: 'var(--color-background-pressed)',
};

const text = {
  default: 'var(--color-text-default)',
  alternative: 'var(--color-text-alternative)',
  muted: 'var(--color-text-muted)',
};

const icon = {
  default: 'var(--color-icon-default)',
  alternative: 'var(--color-icon-alternative)',
  muted: 'var(--color-icon-muted)',
};

const border = {
  default: 'var(--color-border-default)',
  muted: 'var(--color-border-muted)',
};

const shadow = {
  default: 'var(--color-shadow-default)',
  primary: 'var(--color-shadow-primary)',
  error: 'var(--color-shadow-error)',
};

const primary = {
  default: 'var(--color-primary-default)',
  'default-hover': 'var(--color-primary-default-hover)',
  'default-pressed': 'var(--color-primary-default-pressed)',
  muted: 'var(--color-primary-muted)',
  inverse: 'var(--color-primary-inverse)',
};

const error = {
  default: 'var(--color-error-default)',
  'default-hover': 'var(--color-error-default-hover)',
  'default-pressed': 'var(--color-error-default-pressed)',
  muted: 'var(--color-error-muted)',
  inverse: 'var(--color-error-inverse)',
};

const warning = {
  default: 'var(--color-warning-default)',
  'default-hover': 'var(--color-warning-default-hover)',
  'default-pressed': 'var(--color-warning-default-pressed)',
  muted: 'var(--color-warning-muted)',
  inverse: 'var(--color-warning-inverse)',
};

const success = {
  default: 'var(--color-success-default)',
  'default-hover': 'var(--color-success-default-hover)',
  'default-pressed': 'var(--color-success-default-pressed)',
  muted: 'var(--color-success-muted)',
  inverse: 'var(--color-success-inverse)',
};

const info = {
  default: 'var(--color-info-default)',
  muted: 'var(--color-info-muted)',
  inverse: 'var(--color-info-inverse)',
};

const overlay = {
  default: 'var(--color-overlay-default)',
  alternative: 'var(--color-overlay-alternative)',
  inverse: 'var(--color-overlay-inverse)',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'index.js',
    './.storybook/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          ...background,
        },
        text: {
          ...text,
        },
        icon: {
          ...icon,
        },
        border: {
          ...border,
        },
        primary: {
          ...primary,
        },
        error: {
          ...error,
        },
        warning: {
          ...warning,
        },
        success: {
          ...success,
        },
        info: {
          ...info,
        },
        overlay: {
          ...overlay,
        },
        shadow: {
          ...shadow,
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
