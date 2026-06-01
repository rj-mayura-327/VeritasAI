import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import Insights from './pages/Insights';
import { MessageSquare, LayoutDashboard, Sparkles } from 'lucide-react';

function NavLink({ to, icon: Icon, children }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}
        >
            <Icon size={20} className={isActive ? 'text-white' : 'text-primary-500'} /> {children}
        </Link>
    );
}

function MobileNavLink({ to, icon: Icon, label }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`flex flex-col items-center flex-1 py-2 ${isActive ? 'text-primary-500' : 'text-gray-500 hover:text-gray-300'}`}>
            <Icon size={24} className={isActive ? 'mb-1 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'mb-1'} />
            <span className="text-[10px] font-medium">{label}</span>
            {isActive && <div className="absolute top-0 w-8 h-1 bg-primary-500 rounded-b-full"></div>}
        </Link>
    );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-dark-900 text-white overflow-hidden selection:bg-primary-500/30">
        {/* Sidebar */}
        <nav className="w-64 bg-dark-800 border-r border-dark-700 hidden md:flex flex-col relative z-20 shadow-2xl">
          <div className="p-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="text-primary-500" /> VeritasAI
            </h1>
          </div>
          <div className="flex-1 px-4 space-y-2 mt-4">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/chat" icon={MessageSquare}>AI Session</NavLink>
            <NavLink to="/insights" icon={Sparkles}>My Insights</NavLink>
          </div>
        </nav>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 w-full bg-dark-800/90 backdrop-blur-xl border-t border-dark-700 flex justify-around px-2 pb-safe pt-2 z-50">
          <MobileNavLink to="/" icon={LayoutDashboard} label="Home" />
          <MobileNavLink to="/chat" icon={MessageSquare} label="Chat" />
          <MobileNavLink to="/insights" icon={Sparkles} label="Insights" />
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto pb-20 md:pb-0 scroll-smooth">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/insights" element={<Insights />} />
              </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
