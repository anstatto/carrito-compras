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
        // Colores primarios
        primary: {
          main: theme.light.primary.main,
          light: theme.light.primary.light,
          dark: theme.light.primary.dark,
          contrastText: theme.light.primary.contrastText,
        },
        // Colores secundarios
        secondary: {
          main: theme.light.secondary.main,
          light: theme.light.secondary.light,
          dark: theme.light.secondary.dark,
          contrastText: theme.light.secondary.contrastText,
        },
        // Fondos
        background: {
          default: theme.light.background.default,
          paper: theme.light.background.paper,
          pink: theme.light.background.pink,
        },
        // Textos
        text: {
          primary: theme.light.text.primary,
          secondary: theme.light.text.secondary,
          disabled: theme.light.text.disabled,
        },
        // Estados
        error: {
          main: theme.light.error.main,
          light: theme.light.error.light,
          dark: theme.light.error.dark,
        },
        success: {
          main: theme.light.success.main,
          light: theme.light.success.light,
          dark: theme.light.success.dark,
        },
        warning: {
          main: theme.light.warning.main,
          light: theme.light.warning.light,
          dark: theme.light.warning.dark,
        },
        info: {
          main: theme.light.info.main,
          light: theme.light.info.light,
          dark: theme.light.info.dark,
        },
      },
      // Tema oscuro
      backgroundColor: {
        dark: theme.dark.background.default,
        'dark-paper': theme.dark.background.paper,
        'dark-pink': theme.dark.background.pink,
      },
      textColor: {
        dark: theme.dark.text.primary,
        'dark-secondary': theme.dark.text.secondary,
        'dark-disabled': theme.dark.text.disabled,
      },
    },
  },
  plugins: [],
} satisfies Config;
