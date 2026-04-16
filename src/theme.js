import { createTheme } from "@mantine/core";

export const appTheme = createTheme({
  primaryColor: "grape",
  defaultRadius: "md",
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontWeight: "700",
  },
  defaultGradient: {
    from: "grape.5",
    to: "violet.5",
    deg: 120,
  },
  components: {
    Button: {
      defaultProps: {
        size: "md",
      },
    },
    Tabs: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
