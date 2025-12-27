import { useState } from 'react'
import { 
  Home, 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  AlertCircle,
  Clock,
  TrendingUp,
  CheckCircle2
} from 'lucide-react'

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  // Datos de ejemplo para KPIs
  const kpis = [
    { title: 'Deptos', value: '12', icon: Building2, color: 'bg-blue-500/20 text-blue-400' },
    { title: 'Pagos', value: '8/12', icon: DollarSign, color: 'bg-green-500/20 text-green-400' },
    { title: 'Contratos', value: '10', icon: FileText, color: 'bg-purple-500/20 text-purple-400' },
    { title: 'Ajustes', value: '3', icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400' },
  ]

  // Datos de ejemplo para la tabla
  const departamentos = [
    { id: 1, alias: 'Dpto 3B', direccion: 'Av. Corrientes 1234', estado: 'ALQUILADO', inquilino: 'Juan Pérez' },
    { id: 2, alias: 'Dpto 5A', direccion: 'Av. Santa Fe 5678', estado: 'VACIO', inquilino: '-' },
    { id: 3, alias: 'Casa 2', direccion: 'Calle Falsa 123', estado: 'ALQUILADO', inquilino: 'María García' },
    { id: 4, alias: 'Dpto 1C', direccion: 'Av. Libertador 9012', estado: 'REFACCION', inquilino: '-' },
  ]

  // Datos de ejemplo para alertas
  const alertas = [
    { id: 1, tipo: 'MORA', mensaje: 'Pago pendiente - Dpto 3B', fecha: '2025-12-20' },
    { id: 2, tipo: 'VENCE', mensaje: 'Contrato por vencer - Dpto 5A', fecha: '2025-12-28' },
    { id: 3, tipo: 'MORA', mensaje: 'Pago pendiente - Casa 2', fecha: '2025-12-18' },
    { id: 4, tipo: 'VENCE', mensaje: 'Contrato por vencer - Dpto 1C', fecha: '2025-12-30' },
  ]

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'departamentos', icon: Building2, label: 'Departamentos' },
    { id: 'inquilinos', icon: Users, label: 'Inquilinos' },
    { id: 'contratos', icon: FileText, label: 'Contratos' },
    { id: 'pagos', icon: DollarSign, label: 'Pagos' },
    { id: 'config', icon: Settings, label: 'Configuración' },
  ]

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ALQUILADO':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      case 'VACIO':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
      case 'REFACCION':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40'
    }
  }

  const getAlertaColor = (tipo) => {
    return tipo === 'MORA' 
      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }

  const getAlertaIcon = (tipo) => {
    return tipo === 'MORA' ? AlertCircle : Clock
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-20 bg-slate-900/50 border-r border-slate-800 flex flex-col items-center py-6 space-y-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title={item.label}
            >
              <Icon size={24} />
            </button>
          )
        })}
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col p-6 space-y-6">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Sistema de Gestión de Departamentos</p>
        </header>

        {/* Cards de KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:bg-slate-900/70 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm">{kpi.title}</p>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contenido principal con tabla y alertas */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabla central */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Departamentos</h2>
                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm">
                  + Nuevo
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Alias</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Dirección</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Estado</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Inquilino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departamentos.map((depto) => (
                      <tr
                        key={depto.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4 text-white font-medium">{depto.alias}</td>
                        <td className="py-4 px-4 text-slate-300 text-sm">{depto.direccion}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getEstadoColor(depto.estado)}`}>
                            {depto.estado}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 text-sm">{depto.inquilino}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel de Alertas */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/50 rounded-xl p-6 shadow-xl h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Alertas</h2>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                {alertas.map((alerta) => {
                  const Icon = getAlertaIcon(alerta.tipo)
                  return (
                    <div
                      key={alerta.id}
                      className={`p-4 rounded-lg border ${getAlertaColor(alerta.tipo)} backdrop-blur-sm`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon size={20} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alerta.mensaje}</p>
                          <p className="text-xs opacity-70 mt-1">{alerta.fecha}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {alertas.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay alertas pendientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
