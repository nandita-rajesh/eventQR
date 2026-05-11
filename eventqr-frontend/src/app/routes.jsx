import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Signup from "../features/auth/pages/Signup";
import OrganizerDashboard from "../features/dashboard/pages/OrganizerDashboard";
import VolunteerDashboard from "../features/dashboard/pages/VolunteerDashboard";
import VerifyOtp from "../features/auth/pages/VerifyOtp";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import EventDetail from "../features/dashboard/pages/EventDetail";
import QRScanner from "../features/scanner/QRScanner";
import CreateEvent from "../features/events/pages/CreateEvent";
import OrganizerEventDetail from "../features/events/pages/OrganizerEventDetail";
import OrganizerEventParticipants from "../features/events/pages/OrganizerEventParticipants";



const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<OrganizerDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/volunteer/event/:id" element={<EventDetail />} />
        <Route path="/scan/:id" element={<QRScanner />} />
        <Route path="/events/create" element={<CreateEvent />}/>
        <Route path="/events/:id" element={<OrganizerEventDetail />}/>
        <Route path="/events/:id/participants" element={<OrganizerEventParticipants />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;