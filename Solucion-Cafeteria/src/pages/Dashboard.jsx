import { useMemo } from 'react';
import { storage } from '../utils/storage';
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
import { formatMoney } from '../utils/currency';

const PIE_COLORS = ['#6C63FF', '#FF6584', '#00C9A7', '#FFB800', '#3B82F6', '#FF4757', '#A855F7', '#14B8A6'];

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
    dates.push(dateStr(d));
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
        <span className="badge">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="💵"
          label="Ventas Hoy"
          value={formatMoney(stats.todayRevenue)}
          sub={`${stats.todayCount} órdenes`}
          color="#6C63FF"
        />
        <StatCard
          icon="💰"
          label="Propinas Hoy"
          value={formatMoney(stats.todayTips)}
          sub="10% del total"
          color="#00C9A7"
        />
        <StatCard
          icon="📈"
          label="Ventas Semana"
          value={formatMoney(stats.weekRevenue)}
          sub={`${stats.weekCount} órdenes`}
          color="#FF6584"
        />
        <StatCard
          icon="👥"
          label="Clientes Hoy"
          value={stats.todayCount}
          sub={`${stats.weekCount} en la semana`}
          color="#FFB800"
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
                formatter={(value) => [formatMoney(value), 'Ventas']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Bar dataKey="ventas" fill="#6C63FF" radius={[6, 6, 0, 0]} />
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
                formatter={(value) => [formatMoney(value), 'Ventas']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#FF6584"
                strokeWidth={2}
                dot={{ fill: '#FF6584' }}
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
              <Bar dataKey="clientes" fill="#00C9A7" radius={[6, 6, 0, 0]} />
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
                      {p.count} unidades · {formatMoney(p.revenue)}
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
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  {stats.categoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatMoney(value), name]}
                  contentStyle={{ borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {stats.categoryData.map((cat, index) => (
                <div key={cat.name} className="pie-legend-item">
                  <span
                    className="pie-legend-dot"
                    style={{
                      backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  <span className="pie-legend-name">{cat.name}</span>
                  <span className="pie-legend-value">{formatMoney(cat.value)}</span>
                  <span className="pie-legend-pct">
                    {(
                      (cat.value /
                        (stats.categoryData.reduce((s, c) => s + c.value, 0) ||
                          1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
