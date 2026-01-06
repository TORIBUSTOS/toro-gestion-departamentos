import { useState, useEffect } from 'react'
import api from './services/api';
import { BRANDING } from './config/oikos';
import {
  Home,
  Building2,
  Users,
  FileText,
  DollarSign,
  Settings,
  AlertCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  X,
  Save,
  Search,
  Filter,
  Menu,
  ChevronRight
} from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Inquilinos from './views/Inquilinos'
import Pagos from './views/Pagos'
import Contratos from './views/Contratos'
import Departamentos from './views/Departamentos'
import Configuracion from './views/Configuracion'

function Layout({ children }) {
  const location = useLocation();
  const activeMenu = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', path: '/', icon: Home, label: 'Dashboard' },
    { id: 'departamentos', path: '/departamentos', icon: Building2, label: 'Departamentos' },
    { id: 'inquilinos', path: '/inquilinos', icon: Users, label: 'Inquilinos' },
    { id: 'contratos', path: '/contratos', icon: FileText, label: 'Contratos' },
    { id: 'pagos', path: '/pagos', icon: DollarSign, label: 'Pagos' },
    { id: 'config', path: '/config', icon: Settings, label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-20 bg-slate-900/90 border-r border-slate-800 flex flex-col items-center py-6 space-y-6 transition-transform transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 backdrop-blur-md`}>
        <div className="mb-2 p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
          <Building2 size={24} className="text-white" />
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 group relative ${isActive
                ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              title={item.label}
            >
              <Icon size={24} strokeWidth={1.5} />
              {/* Tooltip on hover */}
              <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-20 transition-all duration-300 min-w-0">
        <main className="flex-1 flex flex-col p-4 md:p-8 space-y-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}

function Dashboard() {
  const [departamentos, setDepartamentos] = useState([]);
  const [alertas, setAlertas] = useState([]); // Estado para alertas dinámicas
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDepto, setNewDepto] = useState({
    alias: '',
    direccion: '',
    tipo: 'dpto',
    estado: 'VACIO',
    fecha_estado_desde: new Date().toISOString().split('T')[0],
    notas: ''
  });

  // 1. Cargar datos al iniciar
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resDeptos, resPagos, resContratos, resInquilinos] = await Promise.all([
        api.get('/departamentos'),
        api.get('/pagos'),
        api.get('/contratos'),
        api.get('/inquilinos')
      ]);

      let deptos = resDeptos.data;
      const pagos = resPagos.data;
      const contratos = resContratos.data;
      const inquilinos = resInquilinos.data;

      // Enriquecer departamentos con nombre del inquilino activo
      deptos = deptos.map(d => {
        const contratoActivo = contratos.find(c => c.departamento_id === d.id && c.estado === 'ACTIVO');
        let inquilinoNombre = null;
        if (contratoActivo) {
          const inquilino = inquilinos.find(i => i.id === contratoActivo.inquilino_id);
          if (inquilino) inquilinoNombre = inquilino.nombre_apellido;
        }
        return { ...d, inquilino: inquilinoNombre };
      });

      setDepartamentos(deptos);

      // --- GENERACIÓN DE ALERTAS ---
      const newAlertas = [];

      // A. Pagos Pendientes (MORA)
      pagos.forEach(p => {
        if (p.estado === 'PENDIENTE') {
          const contrato = contratos.find(c => c.id === p.contrato_id);
          const depto = contrato ? deptos.find(d => d.id === contrato.departamento_id) : null;
          const alias = depto ? depto.alias : `Contrato #${p.contrato_id}`;
          newAlertas.push({
            id: `pago-${p.id}`,
            tipo: 'MORA',
            mensaje: `Pago pendiente (${p.periodo}) - ${alias}`,
            fecha: p.fecha_pago || 'Hoy'
          });
        }
      });

      // B. Contratos por vencer (Próximos 60 días)
      const now = new Date();
      const threshold = new Date();
      threshold.setDate(now.getDate() + 60);

      contratos.forEach(c => {
        if (c.estado === 'ACTIVO') {
          // Convertir fecha YYYY-MM-DD a objeto Date
          const fin = new Date(c.fecha_fin);
          // Ajuste de zona horaria simple
          fin.setMinutes(fin.getMinutes() + fin.getTimezoneOffset());

          if (fin > now && fin <= threshold) {
            const depto = deptos.find(d => d.id === c.departamento_id);
            newAlertas.push({
              id: `contrato-${c.id}`,
              tipo: 'VENCE',
              mensaje: `Vence pronto - ${depto ? depto.alias : '??'}`,
              fecha: c.fecha_fin
            });
          }
        }
      });

      // C. Inconsistencia: Depto Alquilado sin Contrato Activo
      deptos.forEach(d => {
        if (d.estado === 'ALQUILADO') {
          const tieneContratoActivo = contratos.some(c => c.departamento_id === d.id && c.estado === 'ACTIVO');
          if (!tieneContratoActivo) {
            newAlertas.push({
              id: `inconsistencia-${d.id}`,
              tipo: 'ERROR',
              mensaje: `Inconsistencia: ${d.alias} figura ALQUILADO sin contrato activo`,
              fecha: 'Revisar Ahora'
            });
          }
        }
      });

      // D. Próximos Aumentos (Próximos 45 días)
      contratos.forEach(c => {
        if (c.estado === 'ACTIVO' && c.proxima_actualizacion) {
          const fechaAumento = new Date(c.proxima_actualizacion);
          fechaAumento.setMinutes(fechaAumento.getMinutes() + fechaAumento.getTimezoneOffset());

          const thresholdAumento = new Date();
          thresholdAumento.setDate(now.getDate() + 45);

          if (fechaAumento > now && fechaAumento <= thresholdAumento) {
            const depto = deptos.find(d => d.id === c.departamento_id);
            newAlertas.push({
              id: `aumento-${c.id}`,
              tipo: 'INFO',
              mensaje: `Aumento Programado: ${depto ? depto.alias : '??'} (${c.porcentaje_actualizacion || '?'}%)`,
              fecha: c.proxima_actualizacion
            });
          }
        }
      });

      setAlertas(newAlertas);
      setLoading(false);
    } catch (error) {
      console.error("Error conectando con TORO Backend:", error);
      alert("Error cargando Dashboard: " + error.message);
      setLoading(false);
    }
  };

  // Cálculo Dinámico de KPIs
  const totalDeptos = departamentos.length;
  const alquilados = departamentos.filter(d => d.estado === 'ALQUILADO').length;
  const vacios = departamentos.filter(d => d.estado === 'VACIO').length;

  // 2. Función para el botón "+ Nuevo"
  const handleNuevoDepartamento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departamentos', newDepto);
      setShowModal(false);
      setNewDepto({
        alias: '',
        direccion: '',
        tipo: 'dpto',
        estado: 'VACIO',
        fecha_estado_desde: new Date().toISOString().split('T')[0],
        notas: ''
      });
      fetchDashboardData(); // Recargar todo
    } catch (error) {
      alert("Error al guardar en el servidor: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDepto(prev => ({ ...prev, [name]: value }));
  };

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
    if (tipo === 'MORA') return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (tipo === 'ERROR') return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    if (tipo === 'INFO') return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }

  const getAlertaIcon = (tipo) => {
    if (tipo === 'MORA') return AlertCircle
    if (tipo === 'ERROR') return AlertTriangle
    if (tipo === 'INFO') return TrendingUp
    return Clock
  }

  const kpis = [
    { title: 'Deptos', value: totalDeptos, icon: Building2, color: 'bg-blue-500/20 text-blue-400' },
    { title: 'Pagos', value: alquilados, icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-400' },
    { title: 'Vacíos', value: vacios, icon: FileText, color: 'bg-purple-500/20 text-purple-400' },
    { title: 'En Refacción', value: departamentos.filter(d => d.estado === 'REFACCION').length, icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400' },
  ]
  return (
    <>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-white tracking-tight">{BRANDING.TITLE}</h1>
          <p className="text-slate-400 text-lg mt-1 font-light">{BRANDING.SUBTITLE}</p>
          <p className="text-slate-500 text-sm mt-2 border-l-2 border-slate-700 pl-3 italic">
            {BRANDING.WELCOME_TEXT}
          </p>
        </div>
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
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm flex items-center gap-2"
              >
                <span>+</span> Nuevo
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
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">
                        Cargando datos...
                      </td>
                    </tr>
                  ) : departamentos.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">
                        No hay departamentos registrados.
                      </td>
                    </tr>
                  ) : (
                    departamentos.map((depto) => (
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
                        <td className="py-4 px-4 text-slate-300 text-sm">{depto.inquilino || '-'}</td>
                      </tr>
                    ))
                  )}
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


      {/* Modal Nuevo Departamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nuevo Departamento</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleNuevoDepartamento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Alias / Nombre</label>
                <input type="text" name="alias" required value={newDepto.alias} onChange={(e) => setNewDepto({ ...newDepto, alias: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Ej: Dpto 3B" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Dirección</label>
                <input type="text" name="direccion" required value={newDepto.direccion} onChange={(e) => setNewDepto({ ...newDepto, direccion: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                  <select name="tipo" value={newDepto.tipo} onChange={(e) => setNewDepto({ ...newDepto, tipo: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white">
                    <option value="dpto">Departamento</option><option value="casa">Casa</option><option value="cochera">Cochera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
                  <select name="estado" value={newDepto.estado} onChange={(e) => setNewDepto({ ...newDepto, estado: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white">
                    <option value="VACIO">Vacío</option><option value="ALQUILADO">Alquilado</option><option value="REFACCION">Refacción</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={18} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/inquilinos" element={<Inquilinos />} />
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/config" element={<Configuracion />} />
          <Route path="*" element={<div className="text-center py-20 text-slate-500">Página en construcción</div>} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
