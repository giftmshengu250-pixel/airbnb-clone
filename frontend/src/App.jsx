import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LocationsPage from "./pages/LocationsPage";
import LocationDetails from "./pages/LocationDetails";
import Login from "./pages/Login";
import Reservations from "./pages/Reservations";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/locations/:id" element={<LocationDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reservations" element={<ProtectedRoute allowedRoles={["user","host","admin"]}><Reservations /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
