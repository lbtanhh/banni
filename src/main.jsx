import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import App from "./App.jsx";
import { appTheme } from "./theme.js";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/vi";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={appTheme} defaultColorScheme="light">
      <DatesProvider settings={{ locale: "vi", firstDayOfWeek: 1 }}>
        <App />
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>
);
