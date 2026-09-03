import { HashRouter, Routes, Route } from 'react-router-dom';
import { storage } from './utils/storage';
import Sidebar from './Components/Sidebar';
import AnimatedBackground from './Components/AnimatedBackground';
import Setup from './Pages/Setup';
import Dashboard from './Pages/Dashboard';
import Menu from './Pages/Menu';
import Sales from './Pages/Sales';
import Orders from './Pages/Orders';
import Reservations from './Pages/Reservations';
import WhatsApp from './Pages/WhatsApp';
import './App.css';

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
