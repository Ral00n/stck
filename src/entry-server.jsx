import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import AppRoutes from "./AppRoutes.jsx";
import { INGREDIENTS } from "./App.jsx";

export function render(url) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  );
}

export { INGREDIENTS };
