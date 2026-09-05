import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LocationsPage from "./pages/LocationsPage";
import LocationDetails from "./pages/LocationDetails";
import Login from "./pages/Login";
import Reservations from "./pages/Reservations";
import HostDashboard from "./pages/HostDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ListingEditor from "./pages/ListingEditor";
import SavedPage from "./pages/SavedPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/locations/:id" element={<LocationDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reservations" element={<ProtectedRoute allowedRoles={["user", "host", "admin"]}><Reservations /></ProtectedRoute>} />

            <Route path="/host" element={<ProtectedRoute allowedRoles={["host", "admin"]}><HostDashboard /></ProtectedRoute>} />
            <Route path="/host/new" element={<ProtectedRoute allowedRoles={["host", "admin"]}><ListingEditor returnTo="/host" /></ProtectedRoute>} />
            <Route path="/host/edit/:id" element={<ProtectedRoute allowedRoles={["host", "admin"]}><ListingEditor returnTo="/host" /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/new" element={<ProtectedRoute allowedRoles={["admin"]}><ListingEditor returnTo="/admin" /></ProtectedRoute>} />
            <Route path="/admin/edit/:id" element={<ProtectedRoute allowedRoles={["admin"]}><ListingEditor returnTo="/admin" /></ProtectedRoute>} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
