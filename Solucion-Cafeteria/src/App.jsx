import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { storage } from './utils/storage';
import { ToastProvider } from './Components/ToastProvider';
import Sidebar from './Components/Sidebar';
import AnimatedBackground from './Components/AnimatedBackground';
import Setup from './Pages/Setup';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Menu from './Pages/Menu';
import Sales from './Pages/Sales';
import Orders from './Pages/Orders';
import Reservations from './Pages/Reservations';
import WhatsApp from './Pages/WhatsApp';
import Users from './Pages/Users';
import './App.css';

function RequireLogin() {
  if (!storage.isLoggedIn()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequirePrivilege({ permission }) {
  if (!storage.isLoggedIn()) return <Navigate to="/login" replace />;
  if (!storage.hasPrivilege(permission)) {
    return <Navigate to={storage.getHomePath()} replace />;
  }
  return <Outlet />;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const business = storage.getBusiness();

  if (!business) {
    return (
      <HashRouter>
        <AnimatedBackground />
        <Routes>
          <Route path="*" element={<Setup />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <AnimatedBackground />
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireLogin />}>
            <Route element={<AppLayout />}>
              <Route element={<RequirePrivilege permission="dashboard" />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route element={<RequirePrivilege permission="menu" />}>
                <Route path="/menu" element={<Menu />} />
              </Route>
              <Route element={<RequirePrivilege permission="sales" />}>
                <Route path="/sales" element={<Sales />} />
              </Route>
              <Route element={<RequirePrivilege permission="orders" />}>
                <Route path="/orders" element={<Orders />} />
              </Route>
              <Route element={<RequirePrivilege permission="reservations" />}>
                <Route path="/reservations" element={<Reservations />} />
              </Route>
              <Route element={<RequirePrivilege permission="whatsapp" />}>
                <Route path="/whatsapp" element={<WhatsApp />} />
              </Route>
              <Route element={<RequirePrivilege permission="manageUsers" />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </HashRouter>
  );
}

export default App;
