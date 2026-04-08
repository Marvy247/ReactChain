import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';
import WalletButton from './components/WalletButton';
import Dashboard from './pages/Dashboard';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass rounded-2xl px-6 py-4 border border-app-border shadow-floating flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <span className="font-serif font-bold text-2xl tracking-tighter text-text-main group-hover:text-accent-indigo transition-colors duration-300">
            Stok<span className="italic text-accent-indigo">vel</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === '/dashboard'
                ? 'bg-accent-indigo text-white shadow-premium'
                : 'text-text-dim hover:text-accent-indigo hover:bg-app-hover'
            }`}
          >
            📊 Dashboard
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}

function LandingPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="font-serif font-bold text-6xl md:text-7xl tracking-tighter text-text-main mb-6">
            Save Together,
            <br />
            <span className="italic text-accent-indigo">Win Together</span>
          </h1>
          <p className="text-xl text-text-dim max-w-2xl mx-auto mb-10">
            On-chain rotating savings groups (Stokvel) on Celo. Contribute every cycle, one member gets the full pool — trustlessly.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-indigo text-white rounded-xl font-medium hover:shadow-premium transition-all"
          >
            Start Saving →
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🫙', title: 'Create a Group', desc: 'Set contribution amount and cycle duration. Members join and commit.' },
            { icon: '💸', title: 'Contribute Each Cycle', desc: 'Every member sends their share on-chain. Fully transparent.' },
            { icon: '🏆', title: 'Rotating Payouts', desc: 'Each cycle, one member receives the full pool. Fair and automatic.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 border border-app-border"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-text-dim">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-44 pb-24 px-6 min-h-screen"
            >
              <div className="max-w-7xl mx-auto">
                <Dashboard />
              </div>
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-app-bg grid-subtle selection:bg-accent-indigo/10 selection:text-accent-indigo">
        <Navigation />
        <main className="relative">
          <AnimatedRoutes />
        </main>
        <footer className="border-t border-app-border py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-serif font-bold text-xl tracking-tighter text-text-main">
              Stok<span className="italic text-accent-indigo">vel</span>
            </span>
            <p className="text-xs text-text-pale uppercase tracking-widest">Built on Celo · © 2026</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
