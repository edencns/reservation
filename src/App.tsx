import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Reserve from './pages/Reserve';
import MyTickets from './pages/MyTickets';
import EventEntry from './pages/EventEntry';
import EventReserve from './pages/EventReserve';
import EventTicket from './pages/EventTicket';
import EventVendors from './pages/EventVendors';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventsManage from './pages/admin/EventsManage';
import EventForm from './pages/admin/EventForm';
import ReservationsManage from './pages/admin/ReservationsManage';
import CheckIn from './pages/admin/CheckIn';
import Statistics from './pages/admin/Statistics';
import Settlement from './pages/admin/Settlement';
import CompanyInfo from './pages/admin/CompanyInfo';
import VendorsManage from './pages/admin/VendorsManage';
import ContractsManage from './pages/admin/ContractsManage';
import VendorLayout from './pages/vendor/VendorLayout';
import VendorEventsView from './pages/vendor/VendorEventsView';
import VendorContracts from './pages/vendor/VendorContracts';
import ContractView from './pages/vendor/ContractView';
import ContractForm from './pages/vendor/ContractForm';
import KioskPage from './pages/KioskPage';
import VirtualKeyboardFAB from './components/VirtualKeyboardFAB';

function AppRoutes() {
  const location = useLocation();
  const isKiosk = location.pathname.startsWith('/kiosk');

  return (
    <>
      {!isKiosk && <Header />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/reserve/:id" element={<Reserve />} />
        <Route path="/my-tickets" element={<MyTickets />} />

        {/* Event-specific public pages (slug-based) */}
        <Route path="/e/:slug" element={<EventEntry />} />
        <Route path="/e/:slug/reserve" element={<EventReserve />} />
        <Route path="/e/:slug/ticket" element={<EventTicket />} />
        <Route path="/e/:slug/vendors" element={<EventVendors />} />

        {/* Kiosk */}
        <Route path="/kiosk/:slug" element={<KioskPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<EventsManage />} />
          <Route path="events/create" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          <Route path="reservations" element={<ReservationsManage />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settlement" element={<Settlement />} />
          <Route path="vendors" element={<VendorsManage />} />
          <Route path="contracts" element={<ContractsManage />} />
          <Route path="company" element={<CompanyInfo />} />
        </Route>

        {/* Vendor Portal */}
        <Route path="/vendor/login" element={<Navigate to="/admin" />} />
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="/vendor/events" />} />
          <Route path="dashboard" element={<Navigate to="/vendor/events" />} />
          <Route path="events" element={<VendorEventsView />} />
          <Route path="contracts" element={<VendorContracts />} />
          <Route path="contracts/new" element={<ContractForm />} />
          <Route path="contracts/:id" element={<ContractView />} />
          <Route path="contracts/:id/edit" element={<ContractForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isKiosk && <Footer />}
      <VirtualKeyboardFAB />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
