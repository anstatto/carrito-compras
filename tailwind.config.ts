import type { Config } from "tailwindcss";
import { theme } from "./src/app/styles/theme";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modo claro
        primary: {
          main: theme.light.primary.main,
          light: theme.light.primary.light,
          dark: theme.light.primary.dark,
          contrastText: theme.light.primary.contrastText,
        },
        secondary: {
          main: theme.light.secondary.main,
          light: theme.light.secondary.light,
          dark: theme.light.secondary.dark,
          contrastText: theme.light.secondary.contrastText,
        },
        // Colores específicos para modo oscuro
        'dark-primary': {
          main: theme.dark.primary.main,
          light: theme.dark.primary.light,
          dark: theme.dark.primary.dark,
          contrastText: theme.dark.primary.contrastText,
        },
        'dark-secondary': {
          main: theme.dark.secondary.main,
          light: theme.dark.secondary.light,
          dark: theme.dark.secondary.dark,
          contrastText: theme.dark.secondary.contrastText,
        },
        // Fondos y textos
        background: {
          light: theme.light.background.default,
          dark: theme.dark.background.default,
          paper: {
            light: theme.light.background.paper,
            dark: theme.dark.background.paper,
          },
          pink: {
            light: theme.light.background.pink,
            dark: theme.dark.background.pink,
          },
        },
        text: {
          light: {
            primary: theme.light.text.primary,
            secondary: theme.light.text.secondary,
            disabled: theme.light.text.disabled,
          },
          dark: {
            primary: theme.dark.text.primary,
            secondary: theme.dark.text.secondary,
            disabled: theme.dark.text.disabled,
          },
        },
        // Estados
        status: {
          error: {
            light: theme.light,
            dark: theme.dark,
          },
          success: {
            light: theme.light,
            dark: theme.dark,
          },
          warning: {
            light: theme.light,
            dark: theme.dark,
          },
          info: {
            light: theme.light,
            dark: theme.dark,
          },
        },
      },
      // Transiciones
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
