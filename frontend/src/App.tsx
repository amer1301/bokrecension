import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetailsPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book/:id" element={<BookDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
    </BrowserRouter>
  );
}