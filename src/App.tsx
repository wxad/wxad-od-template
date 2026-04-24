import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { StarterShell } from "./pages/StarterShell"
import { WorkshopCatalog } from "./pages/WorkshopCatalog"
import { WorkshopPage } from "./pages/WorkshopPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StarterShell />} />
        <Route path="/catalog" element={<WorkshopCatalog />} />
        <Route path="/:slug" element={<WorkshopPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
