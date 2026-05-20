import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import { AlertTriangle, Clock, Repeat2, Route, Ticket, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ticketTrendData, priorityData, slaData, agents } from '../data/dummyData';

const COLORS = ['#f87171', '#fbbf24', '#4ade80'];
const tooltipStyle = { background: 'rgba(15,13,26,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' };

const aiFocusCards = [
  { title: 'SLA Risk', value: '8 tickets', detail: '2 critical queues need review', icon: AlertTriangle, color: 'text-red-300' },
  { title: 'Workload Balance', value: '74%', detail: 'Two agents above target load', icon: Route, color: 'text-blue-300' },
  { title: 'Recurring Themes', value: 'Login + Billing', detail: 'Top drivers this week', icon: Repeat2, color: 'text-purple-300' },
  { title: 'Next Action', value: 'Escalate 3', detail: 'Engineering handoff recommended', icon: Clock, color: 'text-amber-300' },
];

export default function ManagerDashboard() {
  return (
    <Layout title="Team Manager Dashboard">
      <div className="space-y-6 slide-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Tickets" value="1,254" change="▲ 11.2%" icon={Ticket} color="purple" />
          <KpiCard title="Open Tickets" value="312" change="▼ 8.7%" changeType="positive" icon={Ticket} color="amber" />
          <KpiCard title="Resolved Today" value="512" change="▲ 14.3%" changeType="positive" icon={CheckCircle} color="green" />
          <KpiCard title="SLA Compliance" value="92%" change="▲ 3.2%" changeType="positive" icon={TrendingUp} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Trend */}
          <div className="lg:col-span-2 card-glass rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Tickets Trend (Daily)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ticketTrendData}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="open" stroke="#a78bfa" strokeWidth={2} dot={false} name="Open" />
                <Line type="monotone" dataKey="resolved" stroke="#4ade80" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Pie */}
          <div className="card-glass rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-2">Tickets by Priority</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {priorityData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} /><span className="text-slate-400">{p.name}</span></div>
                  <span className="text-white font-medium">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-glass rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white text-sm">Manager AI Focus</h3>
                <p className="mt-1 text-xs text-slate-500">Live team signals for faster escalation decisions</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">Ready</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {aiFocusCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon size={16} className={item.color} />
                      <span className="text-xs font-semibold text-slate-300">{item.title}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="text-sm font-semibold text-white">Recommended manager action</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Reassign overflow from high-load agents, prioritize breached high-value customer tickets, and publish a short login troubleshooting article for deflection.
              </p>
            </div>
        </div>

        {/* Agent Performance Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-glass rounded-xl">
            <div className="p-5 border-b border-purple-900/20">
              <h3 className="font-semibold text-white text-sm">Team Performance</h3>
            </div>
            <table>
              <thead>
                <tr><th>Agent</th><th>Resolved</th><th>SLA %</th><th>Avg Time</th></tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs text-white">{a.name[0]}</div>
                        <span className="text-slate-300 text-sm">{a.name}</span>
                      </div>
                    </td>
                    <td className="text-green-400 font-medium">{a.resolved}</td>
                    <td><div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded bg-white/10"><div className="h-full rounded" style={{ width: `${a.sla}%`, background: '#a78bfa' }} /></div><span className="text-xs text-slate-400">{a.sla}%</span></div></td>
                    <td className="text-slate-400 text-xs">{a.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SLA Trend */}
          <div className="card-glass rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">SLA Compliance Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={slaData}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="compliance" stroke="#4ade80" strokeWidth={2} dot={{ fill: '#4ade80', r: 3 }} name="SLA %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Issue Categories */}
        <div className="card-glass rounded-xl p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Top Issue Categories</h3>
          <div className="space-y-3">
            {[
              { name: 'Login Issues', value: 412, pct: 100 },
              { name: 'Payment Issues', value: 387, pct: 94 },
              { name: 'Product Defect', value: 254, pct: 62 },
              { name: 'Delivery Issues', value: 198, pct: 48 },
              { name: 'Refunds', value: 180, pct: 44 },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-4">
                <span className="text-sm text-slate-400 w-36">{c.name}</span>
                <div className="flex-1 h-2 rounded bg-white/10">
                  <div className="h-full rounded bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-sm font-medium text-white w-10 text-right">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
