import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SelectRole from "./pages/SelectRole";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import VehiclesList from "./pages/VehiclesList";
import VehicleCreate from "./pages/VehicleCreate";
import VehicleDetail from "./pages/VehicleDetail";

import DashboardInvestor from "./pages/DashboardInvestor";
import DashboardEntrepreneur from "./pages/DashboardEntrepreneur";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>


        <Route path="/vehicles" element={<VehiclesList />} />
        <Route path="/vehicles/new" element={<VehicleCreate />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />

        <Route path="/" element={<Home />} />

        {/* UX real: rol antes de registrarse */}
        <Route path="/select-role" element={<SelectRole />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* dashboards por rol */}
        <Route
          path="/dashboard/investor"
          element={
            <ProtectedRoute>
              <DashboardInvestor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/entrepreneur"
          element={
            <ProtectedRoute>
              <DashboardEntrepreneur />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
