import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import QuickSightEmbed from '../components/QuickSightEmbed';
import { Ticket, Star, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sentimentTrend, churnData, revenueRisk } from '../data/dummyData';

const tooltipStyle = { background: 'rgba(15,13,26,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' };

export default function ExecutiveDashboard() {
  return (
    <Layout title="Executive Dashboard">
      <div className="space-y-6 slide-in">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-slate-400">25 May 2024 – 31 May 2024</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Tickets" value="25,842" change="▲ 12.9%" icon={Ticket} color="purple" />
          <KpiCard title="Customer Satisfaction" value="4.2/5" change="▲ 0.3" changeType="positive" icon={Star} color="amber" />
          <KpiCard title="Churn Risk Customers" value="512" change="▲ 8.1%" changeType="negative" icon={AlertTriangle} color="red" />
          <KpiCard title="Revenue Risk (Est.)" value="₹ 12.8 L" change="▲ 7.3%" changeType="negative" icon={TrendingUp} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Trend */}
          <div className="card-glass rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Customer Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sentimentTrend}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="positive" stroke="#4ade80" strokeWidth={2} dot={false} name="Positive" />
                <Line type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={2} dot={false} name="Neutral" />
                <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={2} dot={false} name="Negative" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Churn Risk */}
          <div className="card-glass rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Churn Risk Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={churnData}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="risk" stroke="#f87171" strokeWidth={2} dot={false} name="At Risk" />
                <Line type="monotone" dataKey="churned" stroke="#fbbf24" strokeWidth={2} dot={false} name="Churned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Risk */}
          <div className="card-glass rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Top Revenue Impacting Issues</h3>
            <div className="space-y-3">
              {revenueRisk.map((r, i) => (
                <div key={r.issue} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">#{i+1}</span>
                    <span className="text-sm text-slate-300">{r.issue}</span>
                  </div>
                  <span className="text-sm font-bold text-red-400">{r.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Business Insights */}
          <div className="card-glow rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={15} className="text-yellow-400" />
              <h3 className="font-semibold text-white text-sm">AI Business Insights</h3>
              <span className="ml-auto text-xs text-purple-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)' }}>Bedrock</span>
            </div>
            <div className="space-y-3">
              {[
                'Negative sentiment increased by 18% due to login & payment issues.',
                '512 customers are at high risk of churn.',
                'Recommend improving login success rate and payment flow.',
                'Timely resolution can prevent an estimated ₹ 12.8 L revenue loss.',
                'Deploy proactive outreach to top 50 at-risk customers this week.',
              ].map((insight, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-purple-400 text-xs font-bold mt-0.5 flex-shrink-0">→</span>
                  <span className="text-sm text-slate-300">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <QuickSightEmbed role="business_executive" title="Executive QuickSight Analytics Dashboard" height={460} />
      </div>
    </Layout>
  );
}
