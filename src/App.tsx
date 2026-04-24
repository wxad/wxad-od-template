import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { StarterShell } from "./pages/StarterShell"
import { WorkshopIndex } from "./pages/WorkshopIndex"
import { WorkshopPage } from "./pages/WorkshopPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkshopIndex />} />
        <Route path="/starter" element={<StarterShell />} />
        <Route path="/workshop/:slug" element={<WorkshopPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
