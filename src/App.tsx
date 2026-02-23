import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Reserve from './pages/Reserve';
import MyTickets from './pages/MyTickets';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventsManage from './pages/admin/EventsManage';
import EventForm from './pages/admin/EventForm';
import ReservationsManage from './pages/admin/ReservationsManage';
import Statistics from './pages/admin/Statistics';
import Settlement from './pages/admin/Settlement';

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

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<EventsManage />} />
            <Route path="events/create" element={<EventForm />} />
            <Route path="events/:id/edit" element={<EventForm />} />
            <Route path="reservations" element={<ReservationsManage />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settlement" element={<Settlement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppProvider>
  );
}
