import { useState, useEffect } from 'react'
import { Plus, Search, Filter, FileText, Calendar, DollarSign, User, Building, Calculator } from 'lucide-react'
import api from '../services/api'
import Calculadora from '../components/Calculadora'

export default function Contratos() {
    const [contratos, setContratos] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [inquilinos, setInquilinos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showCalculator, setShowCalculator] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Estado inicial del formulario
    const initialFormState = {
        id: null,
        departamento_id: '',
        inquilino_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        monto_alquiler: '',
        deposito_garantia: '',
        contrato_firmado_url: '',
        proxima_actualizacion: '',
        porcentaje_actualizacion: '',
        estado: 'ACTIVO'
    }

    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [resContratos, resDeptos, resInquilinos] = await Promise.all([
                api.get('/contratos'),
                api.get('/departamentos'),
                api.get('/inquilinos')
            ])
            setContratos(resContratos.data)
            setDepartamentos(resDeptos.data)
            setInquilinos(resInquilinos.data)
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Limpieza de datos antes de enviar
            const payload = {
                departamento_id: parseInt(formData.departamento_id),
                inquilino_id: parseInt(formData.inquilino_id),
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                monto_inicial: parseFloat(formData.monto_alquiler),
                deposito_garantia: formData.deposito_garantia ? parseFloat(formData.deposito_garantia) : null,
                contrato_firmado_url: formData.contrato_firmado_url || null,
                proxima_actualizacion: formData.proxima_actualizacion || null,
                porcentaje_actualizacion: formData.porcentaje_actualizacion ? parseFloat(formData.porcentaje_actualizacion) : null,
                estado: formData.estado
            }

            if (formData.id) {
                await api.put(`/contratos/${formData.id}`, payload)
            } else {
                await api.post('/contratos', payload)
            }
            setShowModal(false)
            fetchData()
            setFormData(initialFormState)
        } catch (error) {
            console.error(error)
            const errorDetail = error.response?.data?.detail
            alert('Error al guardar contrato: ' + (typeof errorDetail === 'object' ? JSON.stringify(errorDetail, null, 2) : (errorDetail || error.message)))
        }
    }

    // Helpers UI
    const getDeptoNombre = (id) => departamentos.find(d => d.id === id)?.alias || 'Desconocido'
    const getInquilinoNombre = (id) => inquilinos.find(i => i.id === id)?.nombre_apellido || 'Desconocido'

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'ACTIVO': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'VENCIDO': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            case 'RESCINDIDO': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        }
    }

    // Filtrado
    const filteredContratos = contratos.filter(c => {
        const nombreDepto = getDeptoNombre(c.departamento_id).toLowerCase()
        const nombreInq = getInquilinoNombre(c.inquilino_id).toLowerCase()
        const term = searchTerm.toLowerCase()
        return nombreDepto.includes(term) || nombreInq.includes(term)
    })

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Contratos</h1>
                    <p className="text-slate-400 mt-1">Vinculación de Inquilinos y Departamentos</p>
                </div>
                <button
                    onClick={() => { setFormData(initialFormState); setShowModal(true) }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} />
                    Nuevo Contrato
                </button>
                <button
                    onClick={() => setShowCalculator(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
                >
                    <Calculator size={20} />
                    Simulador Ajustes
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por departamento o inquilino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">Cargando contratos...</div>
            ) : filteredContratos.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                    No hay contratos registrados.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredContratos.map(contrato => (
                        <div key={contrato.id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-xl p-6 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{getDeptoNombre(contrato.departamento_id)}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getEstadoColor(contrato.estado)}`}>
                                            {contrato.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <User size={16} className="text-slate-500" />
                                    {getInquilinoNombre(contrato.inquilino_id)}
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar size={16} className="text-slate-500" />
                                    {contrato.fecha_inicio} <span className="text-slate-600">➔</span> {contrato.fecha_fin}
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400 font-medium pt-2 border-t border-slate-800/50">
                                    <DollarSign size={16} />
                                    $ {parseFloat(contrato.monto_inicial).toLocaleString()}
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                ...initialFormState,
                                                id: contrato.id,
                                                monto_alquiler: contrato.monto_inicial,
                                                // Mantenemos otros datos básicos para que no se pierdan al guardar solo precio
                                                departamento_id: contrato.departamento_id,
                                                inquilino_id: contrato.inquilino_id,
                                                fecha_inicio: contrato.fecha_inicio,
                                                fecha_fin: contrato.fecha_fin,
                                                estado: contrato.estado
                                            });
                                            setShowModal(true);
                                        }}
                                        className="ml-2 p-1 hover:bg-slate-700/50 rounded-full text-slate-500 transition-colors"
                                        title="Ajustar Precio Manualmente"
                                    >
                                        <DollarSign size={12} />
                                    </button>
                                </div>
                                {contrato.proxima_actualizacion && (
                                    <div className="flex items-center gap-2 text-amber-400 text-xs mt-2 bg-amber-500/10 p-2 rounded">
                                        <Calendar size={12} />
                                        Aumento: {contrato.proxima_actualizacion} ({contrato.porcentaje_actualizacion}%)
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl my-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Nuevo Contrato</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Selección de Depto e Inquilino */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Departamento</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-2.5 text-slate-500" />
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-indigo-500 focus:outline-none appearance-none"
                                            value={formData.departamento_id}
                                            onChange={e => setFormData({ ...formData, departamento_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar Propiedad...</option>
                                            {departamentos.map(d => (
                                                <option key={d.id} value={d.id}>{d.alias} - {d.direccion}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Inquilino</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-2.5 text-slate-500" />
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-indigo-500 focus:outline-none appearance-none"
                                            value={formData.inquilino_id}
                                            onChange={e => setFormData({ ...formData, inquilino_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar Inquilino...</option>
                                            {inquilinos.map(i => (
                                                <option key={i.id} value={i.id}>{i.nombre_apellido} - {i.dni_cuit}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.fecha_inicio}
                                        onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Fecha Fin</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.fecha_fin}
                                        onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Montos */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Monto Alquiler ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.monto_alquiler}
                                        onChange={e => setFormData({ ...formData, monto_alquiler: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Depósito Garantía ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.deposito_garantia}
                                        onChange={e => setFormData({ ...formData, deposito_garantia: e.target.value })}
                                        placeholder="Opcional"
                                    />
                                </div>

                                {/* Aumentos */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Próxima Actualización</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.proxima_actualizacion}
                                        onChange={e => setFormData({ ...formData, proxima_actualizacion: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">% Aumento Estimado</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.porcentaje_actualizacion}
                                        onChange={e => setFormData({ ...formData, porcentaje_actualizacion: e.target.value })}
                                        placeholder="Ej: 15.5"
                                    />
                                </div>

                                {/* Detalles */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-1">URL Contrato (PDF)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        value={formData.contrato_firmado_url}
                                        onChange={e => setFormData({ ...formData, contrato_firmado_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                                >
                                    Crear Contrato
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
            {/* Calculadora */}
            {showCalculator && (
                <Calculadora
                    onClose={() => setShowCalculator(false)}
                    contratos={contratos}
                    onUpdateContrato={fetchData}
                />
            )}
        </div>
    )
}
