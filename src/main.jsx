import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import App from "./App.jsx";
import { appTheme } from "./theme.js";
import "@mantine/core/styles.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={appTheme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
