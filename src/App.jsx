import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import RequireRole from "./auth/RequireRole";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectRole from "./pages/SelectRole";
import AuthCallback from "./pages/AuthCallback";

import MakeOffer from "./pages/MakeOffer";
import InvestorOffers from "./pages/InvestorOffers";

// Dashboards
import DashboardInvestor from "./pages/DashboardInvestor";
import DashboardEntrepreneur from "./pages/DashboardEntrepreneur";

// Marketplace (PÚBLICO)
import VehiclesList from "./pages/VehiclesList";
import VehicleDetail from "./pages/VehicleDetail";

// Acciones investor (PROTEGIDO)
import PublishCar from "./pages/PublishCar";
import VehicleDocsUpload from "./pages/VehicleDocsUpload";

// Admin (PROTEGIDO)
import AdminDashboard from "./pages/AdminDashboard";
import AdminDocs from "./pages/AdminDocs";
import AdminVehicles from "./pages/AdminVehicles";

// (Opcional, lo dejaremos protegido)
import VerifyEntrepreneur from "./pages/VerifyEntrepreneur";

// (Opcional: si ya no lo usas, puedes borrarlo)
import VehicleCreate from "./pages/VehicleCreate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<VehiclesList />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ROLE */}
        <Route path="/select-role" element={<SelectRole />} />

        {/* DASHBOARDS (PROTEGIDOS) */}
        <Route
  path="/dashboard/investor"
  element={
    <ProtectedRoute>
      <RequireRole allowed={["investor", "admin"]}>
        <DashboardInvestor />
      </RequireRole>
    </ProtectedRoute>
  }
/>


       <Route
  path="/dashboard/entrepreneur"
  element={
    <ProtectedRoute>
      <RequireRole allowed={["entrepreneur", "admin"]}>
        <DashboardEntrepreneur />
      </RequireRole>
    </ProtectedRoute>
  }
/>
  <Route path="/auth/callback" element={<AuthCallback />} />
<Route
  path="/admin/docs"
  element={
    <ProtectedRoute>
      <AdminDocs />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>


<Route
  path="/dashboard/entrepreneur"
  element={
    <ProtectedRoute>
      <RequireRole allowed={["entrepreneur", "admin"]}>
        <DashboardEntrepreneur />
      </RequireRole>
    </ProtectedRoute>
  }
/>


        {/* INVESTOR ACTIONS (PROTEGIDO) */}
        <Route
  path="/publish"
  element={
    <ProtectedRoute>
      <RequireRole allowed={["investor", "admin"]}>
        <PublishCar />
      </RequireRole>
    </ProtectedRoute>
  }
/>


        <Route
          path="/publish/docs/:vehicleId"
          element={
            <ProtectedRoute>
              <VehicleDocsUpload />
            </ProtectedRoute>
          }
        />

        {/* ADMIN (PROTEGIDO) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/docs"
          element={
            <ProtectedRoute>
              <AdminDocs />
            </ProtectedRoute>
          }
        />
<Route
  path="/offers/new/:id"
  element={
    <ProtectedRoute>
      <MakeOffer />
    </ProtectedRoute>
  }
/>

<Route
  path="/investor/offers/:id"
  element={
    <ProtectedRoute>
      <InvestorOffers />
    </ProtectedRoute>
  }
/>

        <Route
          path="/admin/vehicles"
          element={
            <ProtectedRoute>
              <AdminVehicles />
            </ProtectedRoute>
          }
        />

        {/* ENTREPRENEUR VERIFY (opcional - PROTEGIDO) */}
        <Route
          path="/verify"
          element={
            <ProtectedRoute>
              <VerifyEntrepreneur />
            </ProtectedRoute>
          }
        />

        {/* OPCIONAL / TEST */}
        <Route
          path="/vehicles/new"
          element={
            <ProtectedRoute>
              <VehicleCreate />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
