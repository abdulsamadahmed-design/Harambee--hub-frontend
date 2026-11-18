
import { Routes, Route } from "react-router-dom";

// Public pages
import Home from "../pages/public/Home";
import Campaigns from "../pages/public/Campaigns";
import CampaignDetails from "../pages/public/CampaignDetails";
import NotFound from "../pages/public/NotFound";

// Authentication pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Organizer pages
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import ManageCampaigns from "../pages/organizer/ManageCampaigns";
import CreateCampaign from "../pages/organizer/CreateCampaign";
import Contributions from "../pages/organizer/Contributions";

// Contributor pages
import ContributorDashboard from "../pages/contributor/ContributorDashboard";
import MyContributions from "../pages/contributor/MyContributions";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaigns/:id" element={<CampaignDetails />} />

      {/* AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ORGANIZER ROUTES */}
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/organizer/campaigns" element={<ManageCampaigns />} />
      <Route path="/organizer/campaigns/new" element={<CreateCampaign />} />
      <Route path="/organizer/contributions" element={<Contributions />} />

      {/* CONTRIBUTOR ROUTES */}
      <Route path="/contributor" element={<ContributorDashboard />} />
      <Route path="/contributor/contributions" element={<MyContributions />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />

      {/* 404 ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


