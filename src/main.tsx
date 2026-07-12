import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MarginCalculator from "./tools/MarginCalculator";
import QuotingPortal from "./tools/QuotingPortal";
import LoadMatching from "./tools/LoadMatching";
import CarrierBoard from "./tools/CarrierBoard";
import Insights from "./tools/Insights";
import Shipments from "./tools/Shipments";
import "./styles.css";

// Hash router so the app works when opened from a static file/preview host.
const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "calculator", element: <MarginCalculator /> },
      { path: "quote", element: <QuotingPortal /> },
      { path: "loads", element: <LoadMatching /> },
      { path: "carrier", element: <CarrierBoard /> },
      { path: "insights", element: <Insights /> },
      { path: "shipments", element: <Shipments /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
