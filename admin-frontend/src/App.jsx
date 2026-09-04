import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Login from "./pages/Login";
import ViewListings from "./pages/ViewListings";
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";
import Reservations from "./pages/Reservations";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/listings"
            element={
              <ProtectedRoute>
                <ViewListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/new"
            element={
              <ProtectedRoute allowedRoles={["host","admin"]}>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["host","admin"]}>
                <UpdateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={["host","admin"]}>
                <Reservations />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
