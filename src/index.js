import {Suspense} from "react";
import {createRoot} from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <Suspense fallback={null}>
        <App />
    </Suspense>
);
