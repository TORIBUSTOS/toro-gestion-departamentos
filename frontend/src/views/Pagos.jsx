import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Filter, Search } from 'lucide-react'
import api from '../services/api'

export default function Pagos() {
    const [pagos, setPagos] = useState([])
    const [contratos, setContratos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Estado inicial
    const initialFormState = {
        contrato_id: '',
        periodo: '', // Ej: 03-2024
        monto_alquiler: '',
        monto_expensas: '0',
        monto_servicios: '0',
        fecha_pago: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE'
    }
    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [resPagos, resContratos] = await Promise.all([
                api.get('/pagos'),
                api.get('/contratos')
            ])
            setPagos(resPagos.data)
            setContratos(resContratos.data)
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                contrato_id: parseInt(formData.contrato_id),
                periodo: formData.periodo,
                monto_alquiler: parseFloat(formData.monto_alquiler || 0),
                monto_expensas: parseFloat(formData.monto_expensas || 0),
                monto_servicios: parseFloat(formData.monto_servicios || 0),
                fecha_pago: formData.fecha_pago || null,
                estado: formData.estado || 'PENDIENTE'
            }

            await api.post('/pagos', payload)
            setShowModal(false)
            fetchData()
            setFormData(initialFormState)
        } catch (error) {
            console.error(error)
            const errorDetail = error.response?.data?.detail
            alert('Error al registrar pago: ' + (typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : (errorDetail || error.message)))
        }
    }

    // Cálculos para KPIs
    // Total cobrado sumando todos los componentes
    const totalIngresos = pagos
        .filter(p => p.estado === 'COBRADO')
        .reduce((sum, p) => sum + parseFloat(p.monto_alquiler) + parseFloat(p.monto_expensas || 0) + parseFloat(p.monto_servicios || 0), 0)

    const pagosPendientes = pagos
        .filter(p => p.estado === 'PENDIENTE').length

    return (
        <div className="flex-1 flex flex-col space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Finanzas</h1>
                    <p className="text-slate-400 mt-1">Control de Pagos, Expensas y Servicios</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                    <Plus size={20} />
                    Registrar Pago
                </button>
            </header>

            {/* Resumen Financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">Ingresos Totales (Cobrado)</p>
                    <p className="text-2xl font-bold text-white">$ {totalIngresos.toLocaleString()}</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-white">{pagosPendientes}</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">Total Operaciones</p>
                    <p className="text-2xl font-bold text-white">{pagos.length}</p>
                </div>
            </div>

            {/* Tabla de Transacciones */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/50 rounded-xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6">Historial de Pagos</h2>
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Cargando transacciones...</div>
                ) : pagos.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-slate-800 border-dashed rounded-lg bg-slate-900/20">
                        No hay pagos registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Fecha</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Contrato</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Periodo</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Alquiler</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Expensas</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Servicios</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Total</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.map((pago) => {
                                    const total = parseFloat(pago.monto_alquiler) + parseFloat(pago.monto_expensas || 0) + parseFloat(pago.monto_servicios || 0);
                                    return (
                                        <tr key={pago.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-4 text-slate-300 text-sm">{pago.fecha_pago}</td>
                                            <td className="py-4 px-4 text-white font-medium">#{pago.contrato_id}</td>
                                            <td className="py-4 px-4 text-slate-300 text-sm">{pago.periodo}</td>
                                            <td className="py-4 px-4 text-slate-300">$ {parseFloat(pago.monto_alquiler).toLocaleString()}</td>
                                            <td className="py-4 px-4 text-slate-300">$ {parseFloat(pago.monto_expensas || 0).toLocaleString()}</td>
                                            <td className="py-4 px-4 text-slate-300">$ {parseFloat(pago.monto_servicios || 0).toLocaleString()}</td>
                                            <td className="py-4 px-4 text-white font-medium">$ {total.toLocaleString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${pago.estado === 'COBRADO'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                    : pago.estado === 'PARCIAL' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                                    }`}>
                                                    {pago.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Registrar Nuevo Pago</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Contrato</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    value={formData.contrato_id}
                                    onChange={e => setFormData({ ...formData, contrato_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccione contrato...</option>
                                    {contratos.map(c => (
                                        <option key={c.id} value={c.id}>Contrato #{c.id}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Periodo</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 03-2024"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        value={formData.periodo}
                                        onChange={e => setFormData({ ...formData, periodo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        value={formData.estado}
                                        onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                    >
                                        <option value="PENDIENTE">Pendiente</option>
                                        <option value="COBRADO">Cobrado</option>
                                        <option value="PARCIAL">Parcial</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Monto Alquiler</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    value={formData.monto_alquiler}
                                    onChange={e => setFormData({ ...formData, monto_alquiler: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Monto Expensas</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        value={formData.monto_expensas}
                                        onChange={e => setFormData({ ...formData, monto_expensas: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Monto Servicios</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        value={formData.monto_servicios}
                                        onChange={e => setFormData({ ...formData, monto_servicios: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Fecha de Pago</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    value={formData.fecha_pago}
                                    onChange={e => setFormData({ ...formData, fecha_pago: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
