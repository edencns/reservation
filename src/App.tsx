import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Header />
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
            <Route path="company" element={<CompanyInfo />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppProvider>
  );
}
