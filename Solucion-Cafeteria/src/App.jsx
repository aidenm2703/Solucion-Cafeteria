import { HashRouter, Routes, Route } from 'react-router-dom';
import { storage } from './utils/storage';
import Sidebar from './components/Sidebar';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import WhatsApp from './pages/WhatsApp';
import './App.css';

function App() {
  const business = storage.getBusiness();

  if (!business) {
    return (
      <HashRouter>
        <Routes>
          <Route path="*" element={<Setup />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/whatsapp" element={<WhatsApp />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
