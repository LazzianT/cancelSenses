import { BarChart3, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function Analytics() {
  const featureImportanceData = [
    { name: 'Lead Time', value: 38 },
    { name: 'Deposit Type', value: 24 },
    { name: 'ADR', value: 15 },
    { name: 'Special Requests', value: 12 },
    { name: 'Prev Cancellations', value: 11 },
  ];

  const cancellationRatioData = [
    { name: 'Not Cancelled', value: 65.7 },
    { name: 'Cancelled', value: 34.3 },
  ];

  const COLORS = ['#2563EB', '#F97316']; 

  const modelMetrics = [
    { name: 'F1-Score (Primary)', value: '88.4%', desc: 'Balanced evaluation', icon: Award, color: 'text-brand-blue' },
    { name: 'Precision', value: '89.1%', desc: 'Low false positive rate', icon: CheckCircle, color: 'text-brand-blue' },
    { name: 'Recall', value: '87.8%', desc: 'High risk coverage', icon: TrendingUp, color: 'text-brand-orange' },
    { name: 'ROC-AUC', value: '0.92', desc: 'Excellent discrimination', icon: BarChart3, color: 'text-brand-orange' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-brand-text flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-brand-blue" />
          Model & Business Analytics
        </h1>
        <p className="text-brand-muted mt-1">Deep dive into XGBoost evaluation metrics and indicators[cite: 1].</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modelMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="neo-card p-6 flex items-center gap-4">
              <div className="p-3 bg-brand-surface shadow-neo-in rounded-xl flex-shrink-0">
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block">{metric.name}</span>
                <span className="text-2xl font-black text-brand-text block mt-0.5">{metric.value}</span>
                <span className="text-xs text-brand-muted block mt-0.5">{metric.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECHARTS PLOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 neo-card p-6 flex flex-col h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-muted mb-4">Cancellation Ratio</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cancellationRatioData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {cancellationRatioData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#EAF0F6', border: 'none', borderRadius: '12px', boxShadow: '3px 3px 6px #c8d0da, -3px -3px 6px #ffffff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 neo-card p-6 flex flex-col h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-muted mb-4">XGBoost Feature Importance (%)</h3>
          <div className="flex-1 min-h-0 pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureImportanceData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1E293B', fontSize: 12, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} contentStyle={{ backgroundColor: '#EAF0F6', border: 'none', borderRadius: '12px', boxShadow: '3px 3px 6px #c8d0da, -3px -3px 6px #ffffff' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {featureImportanceData.map((_, index) => <Cell key={index} fill={index % 2 === 0 ? '#2563EB' : '#F97316'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}