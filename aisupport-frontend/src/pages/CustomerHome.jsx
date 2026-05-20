import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  FileQuestion,
  Headphones,
  LogOut,
  MapPin,
  MessageSquare,
  PlusCircle,
  Search,
  Star,
  Ticket,
} from 'lucide-react';
import logo from '../assets/ai-support-logo.png';
import ChatbotWidget from '../components/ChatbotWidget';
import BedrockAgentChat from '../components/BedrockAgentChat';
import QuickSightEmbed from '../components/QuickSightEmbed';

const stats = [
  { label: 'Open Tickets', value: '5', change: '+25%', icon: Ticket, color: 'purple' },
  { label: 'Resolved Tickets', value: '24', change: '+41%', icon: CheckCircle, color: 'blue' },
  { label: 'Avg. Response Time', value: '1h 24m', change: '-15%', icon: Clock, color: 'amber' },
  { label: 'Satisfaction Score', value: '4.8 / 5', change: '+6%', icon: Star, color: 'green' },
];

const quickActions = [
  { label: 'Raise Ticket', desc: 'Submit a new support request', icon: PlusCircle, path: '/customer/raise-ticket', primary: true },
  { label: 'My Tickets', desc: 'View and manage your tickets', icon: Ticket, path: '/customer/tickets' },
  { label: 'Track Request', desc: 'Track an existing request', icon: MapPin, path: '/customer/tickets' },
  { label: 'Contact Support', desc: 'Find support resources', icon: Headphones, path: '/customer/faq' },
];

const recentTickets = [
  { id: '#TK-1001', subject: 'Login issue', priority: 'High', status: 'Open', updated: '10 min ago' },
  { id: '#TK-1002', subject: 'Payment failed', priority: 'Medium', status: 'In Progress', updated: '25 min ago' },
  { id: '#TK-1003', subject: 'Refund request', priority: 'Low', status: 'Resolved', updated: '1 hr ago' },
];

const articles = [
  { title: 'How to reset your password', icon: FileQuestion },
  { title: 'How to track your ticket', icon: MapPin },
  { title: 'Understanding ticket priority', icon: Star },
  { title: 'How to contact support', icon: MessageSquare },
];

const flow = ['Ticket Created', 'AI Analysis', 'Assigned to Agent', 'Resolution'];

const badgeClass = {
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
  Open: 'badge-open',
  'In Progress': 'badge-progress',
  Resolved: 'badge-resolved',
};

const colorClass = {
  purple: 'from-purple-500/25 to-purple-700/10 border-purple-500/25 text-purple-300',
  blue: 'from-blue-500/25 to-blue-700/10 border-blue-500/25 text-blue-300',
  amber: 'from-amber-500/25 to-amber-700/10 border-amber-500/25 text-amber-300',
  green: 'from-emerald-500/25 to-emerald-700/10 border-emerald-500/25 text-emerald-300',
};

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 80% 0%, rgba(37,99,235,0.18), transparent 32%), linear-gradient(135deg, #0b1022, #130d29 52%, #071426)' }}>
      <nav className="sticky top-0 z-30 border-b border-white/10 px-5 py-4 backdrop-blur-xl" style={{ background: 'rgba(8,10,24,0.72)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI Support Intelligence" className="h-11 w-11 rounded-xl object-cover ring-1 ring-purple-400/30" />
            <div>
              <div className="font-bold leading-tight text-white">AI Support Intelligence</div>
              <div className="text-xs text-purple-300">Customer Portal</div>
            </div>
          </div>

          <div className="hidden flex-1 justify-center px-6 lg:flex">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input placeholder="Search for articles, tickets or solutions..." className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-400/50" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/20 px-3 py-2 text-xs text-slate-300 sm:flex" style={{ background: 'rgba(16,185,129,0.08)' }}>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Support Online
            </div>
            <button className="relative rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Bell size={17} />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-blue-500 text-sm font-bold text-white">{user?.name?.[0] || 'C'}</div>
              <div>
                <div className="text-sm font-semibold text-white">{user?.name || 'Customer'}</div>
                <div className="text-xs text-slate-500">Customer</div>
              </div>
            </div>
            <button onClick={logout} className="rounded-xl p-2.5 text-slate-400 hover:text-white">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-5 px-5 py-6">
        <section className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-950/20" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(14,165,233,0.07))' }}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Customer Portal</h1>
              <p className="mt-2 text-slate-300">Raise tickets, track requests, and find support resources.</p>
              <div className="relative mt-5 max-w-2xl">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input placeholder="Search for solutions, articles or ask a question..." className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-11 pr-28 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50" />
                <button className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 py-2.5 text-sm font-semibold">Search</button>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-blue-400/20 p-5 lg:block" style={{ background: 'rgba(14,165,233,0.07)' }}>
              <div className="text-sm font-semibold text-white">AI support workspace</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Use tickets, knowledge articles, and AI guidance to get faster support outcomes.</p>
            </div>
          </div>
        </section>

        <BedrockAgentChat role="customer" mode="card" />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-2xl border bg-gradient-to-br p-5 ${colorClass[item.color]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-300">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                    <p className="mt-2 text-xs text-emerald-300">{item.change} vs last 7 days</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} onClick={() => navigate(action.path)} className={`group rounded-2xl border border-white/10 p-4 text-left transition-all hover:-translate-y-1 hover:border-purple-400/40 ${action.primary ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'card-glass'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{action.label}</div>
                      <div className="text-xs text-slate-300">{action.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1.15fr_0.85fr]">
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-bold text-white">Recent Tickets</h2>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr><th>Ticket ID</th><th>Subject</th><th>Priority</th><th>Status</th><th>Last Updated</th></tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="text-xs font-mono text-purple-300">{ticket.id}</td>
                      <td className="text-sm text-slate-300">{ticket.subject}</td>
                      <td><span className={badgeClass[ticket.priority]}>{ticket.priority}</span></td>
                      <td><span className={badgeClass[ticket.status]}>{ticket.status}</span></td>
                      <td className="text-xs text-slate-500">{ticket.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <h2 className="font-bold text-white">Recommended Help Articles</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {articles.map((article) => {
                const Icon = article.icon;
                return (
                  <button key={article.title} onClick={() => navigate('/customer/faq')} className="rounded-xl border border-white/10 p-4 text-left transition-all hover:border-purple-400/40" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Icon size={20} className="mb-3 text-purple-300" />
                    <div className="text-sm font-semibold text-white">{article.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <h2 className="font-bold text-white">Ticket Resolution Flow</h2>
            <div className="mt-5 space-y-4">
              {flow.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index < 2 ? 'bg-emerald-500 text-white' : 'bg-blue-500/20 text-blue-300'}`}>{index + 1}</div>
                    {index < flow.length - 1 && <div className="mt-2 h-8 w-px bg-white/10" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{step}</div>
                    <div className="text-xs text-slate-500">{index < 2 ? 'Completed' : 'Next step'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <QuickSightEmbed role="customer" title="Customer Portal Sentiment & Self-Service Dashboard" height={440} />
      </main>
      <ChatbotWidget />
    </div>
  );
}
