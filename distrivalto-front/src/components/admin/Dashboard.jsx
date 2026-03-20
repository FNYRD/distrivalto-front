import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { api } from '../../api'
import styles from './Dashboard.module.css'

/* ── Palette ── */

const NAVY   = '#2C3F58'
const BLUE   = '#79BAD0'
const AMBER  = '#D4A853'
const GRAY   = '#9A9490'
const ROSE   = '#C4826A'

const PIE_COLORS   = [BLUE, NAVY, AMBER, GRAY, ROSE]
const RESOL_COLORS = [BLUE, AMBER, ROSE]

/* ── Custom tooltip ── */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      {label && <p className={styles.tooltipLabel}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className={styles.tooltipItem}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

/* ── KPI Card ── */

function KpiCard({ title, value, sub, accent }) {
  return (
    <div className={styles.kpiCard}>
      <p className={styles.kpiTitle}>{title}</p>
      <p className={styles.kpiValue} style={accent ? { color: accent } : undefined}>{value}</p>
      {sub && <p className={styles.kpiSub}>{sub}</p>}
    </div>
  )
}

/* ── Section card wrapper ── */

function ChartCard({ title, children, span }) {
  return (
    <div className={`${styles.chartCard} ${span === 'full' ? styles.spanFull : ''}`}>
      <p className={styles.chartTitle}>{title}</p>
      {children}
    </div>
  )
}

/* ── Dashboard ── */

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getDashboard()
      .then(d => setData(d))
      .catch(err => setError(err.error || 'Error al cargar el dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <p className={styles.statusMsg}>Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <p className={styles.statusMsg}>{error}</p>
      </div>
    )
  }

  const { kpis, trend, geoConsultas, geoGarantias, productConsultas, topGarantiaProducts, resolution } = data

  return (
    <div className={styles.dashboard}>

      {/* KPIs */}
      <div className={styles.kpiRow}>
        <KpiCard
          title="Tasa de escalado"
          value={`${kpis.escalationRate}%`}
          sub="de chats derivados a soporte"
          accent={AMBER}
        />
        <KpiCard
          title="País con más mensajes"
          value={kpis.topCountry.name}
          sub={`${kpis.topCountry.total} conversaciones este período`}
        />
        <KpiCard
          title="Garantías vs Consultas"
          value={`${kpis.ratio.garantias}% / ${kpis.ratio.consultas}%`}
          sub="Garantías · Consultas"
        />
        <KpiCard
          title="Producto destacado"
          value={kpis.topProducts.consulta}
          sub={`más consultado · ${kpis.topProducts.garantia} más reclamado`}
        />
      </div>

      {/* Charts grid */}
      <div className={styles.chartsGrid}>

        {/* 1 – Evolución ao longo do tempo (full width) */}
        <ChartCard title="Evolución de conversaciones en el tiempo" span="full">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="consultas" name="Consultas" stroke={BLUE} strokeWidth={2.5} dot={{ r: 4, fill: BLUE }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="garantias" name="Garantías" stroke={NAVY} strokeWidth={2.5} dot={{ r: 4, fill: NAVY }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2 – Distribución geográfica consultas */}
        <ChartCard title="Distribución geográfica · Consultas">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={geoConsultas} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis dataKey="pais" type="category" width={72} tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" name="Consultas" fill={BLUE} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3 – Distribución por producto (consultas) */}
        <ChartCard title="Consultas por producto">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={productConsultas}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {productConsultas.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                iconSize={10}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4 – Distribución geográfica garantías */}
        <ChartCard title="Distribución geográfica · Garantías">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={geoGarantias} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis dataKey="pais" type="category" width={72} tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" name="Garantías" fill={NAVY} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5 – Top 5 productos con más garantías */}
        <ChartCard title="Top 5 productos · Garantías">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topGarantiaProducts} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="garantias" name="Garantías" fill={AMBER} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6 – Tasa de resolución */}
        <ChartCard title="Tasa de resolución">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={resolution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {resolution.map((_, i) => (
                  <Cell key={i} fill={RESOL_COLORS[i % RESOL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} formatter={(v) => `${v}%`} />
              <Legend
                formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>}
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  )
}
