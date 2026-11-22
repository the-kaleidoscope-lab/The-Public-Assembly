import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/public/Home';
import Initiatives from './pages/public/Initiatives';
import InitiativeDetail from './pages/public/InitiativeDetail';
import About from './pages/public/About';
import Impact from './pages/public/Impact';
import Auditor from './pages/public/Auditor';
import OfficerAction from './pages/public/OfficerAction';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import StartInitiative from './pages/public/StartInitiative';
import MissionControl from './pages/public/MissionControl';
import TaskDetail from './pages/public/TaskDetail';
import VerifyCertificate from './pages/public/VerifyCertificate';
import Profile from './pages/public/Profile';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import CodeOfConduct from './pages/public/CodeOfConduct';
import Contact from './pages/public/Contact';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'sonner';

const HowItWorks = () => (
  <div className="min-h-screen bg-pearl pt-48 pb-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-32 max-w-4xl"
      >
        <span className="prospera-pill border-slate-900 mb-8">The Process</span>
        <h1 className="text-7xl md:text-9xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
          How It <br /> <span className="italic text-slate-400">Works.</span>
        </h1>
        <p className="text-2xl text-slate-500 font-display font-light leading-relaxed max-w-2xl">
          A structured framework designed to transform individual concern into collective civic power.
        </p>
      </motion.div>

      <div className="space-y-32">
        {[
          { step: '01', title: 'Identify & Propose', desc: 'A citizen identifies a local issue and submits a structured proposal with a clear action plan, location details, and required support.' },
          { step: '02', title: 'Community Mobilization', desc: 'Other responsible citizens join as volunteers, offer skills, or provide resources. All members are visible for accountability.' },
          { step: '03', title: 'Transparent Execution', desc: 'The initiative progresses through documented phases with task assignments, timeline updates, and photo documentation.' },
          { step: '04', title: 'Impact Reporting', desc: 'Upon completion, a final report with impact metrics and financial breakdown is published for public record.' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col md:flex-row gap-16 md:gap-32 items-start group"
          >
            <span className="text-9xl font-display font-light text-slate-100 leading-none group-hover:text-prospera-blue/10 transition-colors duration-500">{item.step}</span>
            <div className="pt-8">
              <h3 className="text-4xl md:text-5xl font-display font-medium mb-8 text-slate-900 group-hover:text-prospera-blue transition-colors tracking-tighter">{item.title}</h3>
              <p className="text-xl text-slate-500 leading-relaxed font-display font-light max-w-2xl">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-center" richColors />
          <Router>
            <div className="min-h-screen flex flex-col bg-pearl text-slate-900 selection:bg-accent-gold selection:text-pearl">
              <Navbar />
              <main className="flex-grow">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/initiatives" element={<Initiatives />} />
                    <Route path="/initiatives/:id" element={<InitiativeDetail />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/impact" element={<Impact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/auditor" element={<Auditor />} />
                    <Route path="/officer-action/:action" element={<OfficerAction />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/start" element={<StartInitiative />} />
                    <Route path="/initiatives/:id/control" element={<MissionControl />} />
                    <Route path="/tasks/:id" element={<TaskDetail />} />
                    <Route path="/verify/:id" element={<VerifyCertificate />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

