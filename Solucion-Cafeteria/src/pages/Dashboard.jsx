import { useMemo } from 'react';
import { storage } from '../utils/storage';
import { formatBs, formatRateText, formatUsd, usdToBs } from '../utils/currency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const PIE_COLORS = [
  '#1B4332',
  '#2D6A4F',
  '#00B4D8',
  '#48CAE4',
  '#E07A5F',
  '#F4A261',
  '#E9C46A',
  '#0077B6',
];

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
        {sub && <span className="stat-card-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const orders = storage.getOrders();
  const business = storage.getBusiness();
  const today = getTodayString();
  const weekDates = getWeekDates();

  const stats = useMemo(() => {
    const todayOrders = orders.filter((o) => o.date && o.date.startsWith(today));
    const weekOrders = orders.filter((o) => o.date && weekDates.some((d) => o.date.startsWith(d)));

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayTips = todayOrders.reduce((sum, o) => sum + (o.tip || 0), 0);
    const todayCount = todayOrders.length;

    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const weekCount = weekOrders.length;

    const salesByDay = {};
    weekDates.forEach((d) => {
      salesByDay[d] = { revenue: 0, count: 0 };
    });
    weekOrders.forEach((o) => {
      const day = o.date.split('T')[0];
      if (salesByDay[day]) {
        salesByDay[day].revenue += o.total || 0;
        salesByDay[day].count += 1;
      }
    });

    const dailyRevenueData = weekDates.map((d) => ({
      name: DAY_NAMES[new Date(d + 'T12:00:00').getDay()],
      ventas: salesByDay[d]?.revenue || 0,
      ordenes: salesByDay[d]?.count || 0,
    }));

    const productSales = {};
    weekOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { count: 0, revenue: 0 };
        }
        productSales[item.name].count += item.quantity || 1;
        productSales[item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const customersByDay = weekDates.map((d) => ({
      name: DAY_NAMES[new Date(d + 'T12:00:00').getDay()],
      clientes: salesByDay[d]?.count || 0,
    }));

    const hourlySales = {};
    todayOrders.forEach((o) => {
      const hour = new Date(o.date).getHours();
      if (!hourlySales[hour]) hourlySales[hour] = 0;
      hourlySales[hour] += o.total || 0;
    });
    const hourlyData = Array.from({ length: 16 }, (_, i) => {
      const hour = i + 6;
      return {
        name: `${hour}:00`,
        ventas: hourlySales[hour] || 0,
      };
    }).filter((d) => d.ventas > 0 || true);

    const categorySales = {};
    weekOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.category || 'Otros';
        if (!categorySales[cat]) categorySales[cat] = 0;
        categorySales[cat] += (item.price || 0) * (item.quantity || 1);
      });
    });
    const categoryData = Object.entries(categorySales).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    return {
      todayRevenue,
      todayTips,
      todayCount,
      weekRevenue,
      weekCount,
      dailyRevenueData,
      topProducts,
      customersByDay,
      hourlyData,
      categoryData,
    };
  }, [orders, today, weekDates]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            Resumen de{' '}
            <strong>{business?.name || 'tu negocio'}</strong>
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-secondary">💱 {formatRateText()}</span>
          <span className="badge">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="💵"
          label="Ventas Hoy"
          value={formatUsd(stats.todayRevenue)}
          sub={`${stats.todayCount} órdenes · ${formatBs(usdToBs(stats.todayRevenue))}`}
          color="#1B4332"
        />
        <StatCard
          icon="💰"
          label="Propinas Hoy"
          value={formatUsd(stats.todayTips)}
          sub={`10% del total · ${formatBs(usdToBs(stats.todayTips))}`}
          color="#2D6A4F"
        />
        <StatCard
          icon="📈"
          label="Ventas Semana"
          value={formatUsd(stats.weekRevenue)}
          sub={`${stats.weekCount} órdenes · ${formatBs(usdToBs(stats.weekRevenue))}`}
          color="#00B4D8"
        />
        <StatCard
          icon="👥"
          label="Clientes Hoy"
          value={stats.todayCount}
          sub={`${stats.weekCount} en la semana`}
          color="#E07A5F"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card large">
          <h3>Ventas por Día de la Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, 'Ventas']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Bar dataKey="ventas" fill="#1B4332" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Ventas por Hora (Hoy)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, 'Ventas']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#00B4D8"
                strokeWidth={2}
                dot={{ fill: '#00B4D8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Clientes por Día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.customersByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="clientes" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top Productos Vendidos (Semana)</h3>
          {stats.topProducts.length > 0 ? (
            <div className="top-products-list">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="top-product-item">
                  <span className="top-product-rank">#{i + 1}</span>
                  <div className="top-product-info">
                    <span className="top-product-name">{p.name}</span>
                    <span className="top-product-meta">
                      {p.count} unidades · ${p.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="top-product-bar">
                    <div
                      className="top-product-bar-fill"
                      style={{
                        width: `${(p.revenue / (stats.topProducts[0]?.revenue || 1)) * 100}%`,
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>Sin ventas registradas esta semana</p>
            </div>
          )}
        </div>

        {stats.categoryData.length > 0 && (
          <div className="chart-card">
            <h3>Ventas por Categoría</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {stats.categoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, '']}
                  contentStyle={{ borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
