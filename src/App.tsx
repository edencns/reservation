import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventReserve from './pages/EventReserve';
import EventEntry from './pages/EventEntry';
import EventTicket from './pages/EventTicket';
import EventVendors from './pages/EventVendors';
import MyTickets from './pages/MyTickets';
import Reserve from './pages/Reserve';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventsManage from './pages/admin/EventsManage';
import EventForm from './pages/admin/EventForm';
import ReservationsManage from './pages/admin/ReservationsManage';
import Statistics from './pages/admin/Statistics';
import Settlement from './pages/admin/Settlement';
import VendorsManage from './pages/admin/VendorsManage';
import ContractsManage from './pages/admin/ContractsManage';
import CompanyInfo from './pages/admin/CompanyInfo';
import KioskPage from './pages/KioskPage';
import VirtualKeyboardFAB from './components/VirtualKeyboardFAB';
import Header from './components/Header';
import Footer from './components/Footer';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isKiosk = location.pathname.startsWith('/kiosk');

  if (isKiosk) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/reserve/:id" element={<Reserve />} />
        <Route path="/my-tickets" element={<MyTickets />} />

        {/* Slug-based event pages */}
        <Route path="/e/:slug" element={<EventEntry />} />
        <Route path="/e/:slug/reserve" element={<EventReserve />} />
        <Route path="/e/:slug/ticket" element={<EventTicket />} />
        <Route path="/e/:slug/vendors" element={<EventVendors />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MantineProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages with Header/Footer */}
            <Route path="/*" element={<AppRoutes />} />

            {/* Admin (no Header/Footer) */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="events" element={<EventsManage />} />
              <Route path="events/create" element={<EventForm />} />
              <Route path="events/:id/edit" element={<EventForm />} />
              <Route path="reservations" element={<ReservationsManage />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="settlement" element={<Settlement />} />
              <Route path="vendors" element={<VendorsManage />} />
              <Route path="contracts" element={<ContractsManage />} />
              <Route path="company" element={<CompanyInfo />} />
            </Route>

            {/* Kiosk (no Header/Footer, with keyboard FAB) */}
            <Route path="/kiosk/:slug" element={
              <>
                <KioskPage />
                <VirtualKeyboardFAB />
              </>
            } />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </AppProvider>
  );
}
