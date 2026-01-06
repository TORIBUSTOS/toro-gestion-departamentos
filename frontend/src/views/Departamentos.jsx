import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Home, Building2, MapPin, User, Shield } from 'lucide-react'
import api from '../services/api'

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterEstado, setFilterEstado] = useState('TODOS')

    // Estado para el formulario (nuevo o edición)
    const [formData, setFormData] = useState({
        id: null,
        alias: '',
        direccion: '',
        propietario_nombre: '',
        servicios_incluidos: '',
        seguro_poliza: '',
        seguro_vencimiento: '',
        estado: 'VACIO',
        notas_estado_inicial: ''
    })

    useEffect(() => {
        fetchDepartamentos()
    }, [])

    const fetchDepartamentos = async () => {
        try {
            const response = await api.get('/departamentos')
            setDepartamentos(response.data)
        } catch (error) {
            console.error('Error al cargar departamentos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Preparar payload. Convertir fechas vacías a null si es necesario
            const payload = { ...formData }
            if (!payload.seguro_vencimiento) payload.seguro_vencimiento = null;
            if (!payload.propietario_nombre) payload.propietario_nombre = null;
            if (!payload.servicios_incluidos) payload.servicios_incluidos = null;
            if (!payload.seguro_poliza) payload.seguro_poliza = null;
            if (!payload.notas_estado_inicial) payload.notas_estado_inicial = null;

            if (formData.id) {
                // Editar
                await api.put(`/departamentos/${formData.id}`, payload)
            } else {
                // Crear (quitamos el id null)
                const { id, ...newDepto } = payload
                await api.post('/departamentos', newDepto)
            }
            setShowModal(false)
            fetchDepartamentos()
            resetForm()
        } catch (error) {
            console.error(error)
            const errorDetail = error.response?.data?.detail
            alert('Error al guardar: ' + (typeof errorDetail === 'object' ? JSON.stringify(errorDetail, null, 2) : (errorDetail || error.message)))
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este departamento?')) return
        try {
            await api.delete(`/departamentos/${id}`)
            fetchDepartamentos()
        } catch (error) {
            console.error(error)
            const errorDetail = error.response?.data?.detail
            alert('Error al eliminar: ' + (typeof errorDetail === 'object' ? JSON.stringify(errorDetail, null, 2) : (errorDetail || error.message)))
        }
    }
    const resetForm = () => {
        setFormData({
            id: null,
            alias: '',
            direccion: '',
            propietario_nombre: '',
            servicios_incluidos: '',
            seguro_poliza: '',
            seguro_vencimiento: '',
            estado: 'VACIO',
            notas_estado_inicial: ''
        })
    }

    const handleEdit = (depto) => {
        // Asegurarse de que los valores nulos sean strings vacíos para los inputs
        setFormData({
            ...depto,
            propietario_nombre: depto.propietario_nombre || '',
            servicios_incluidos: depto.servicios_incluidos || '',
            seguro_poliza: depto.seguro_poliza || '',
            seguro_vencimiento: depto.seguro_vencimiento || '',
            notas_estado_inicial: depto.notas_estado_inicial || ''
        })
        setShowModal(true)
    }

    // Filtrado
    const filteredDeptos = departamentos.filter(d => {
        const matchesSearch = (d.alias || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.direccion.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesEstado = filterEstado === 'TODOS' || d.estado === filterEstado
        return matchesSearch && matchesEstado
    })

    // Helpers de UI
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'ALQUILADO': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'VACIO': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            case 'REFACCION': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Departamentos</h1>
                    <p className="text-slate-400 mt-1">Gestión de unidades y propiedades</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} />
                    Nuevo Departamento
                </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="VACIO">Vacíos</option>
                        <option value="ALQUILADO">Alquilados</option>
                        <option value="REFACCION">En Refacción</option>
                    </select>
                </div>
            </div>

            {/* Grid de Cards */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">Cargando departamentos...</div>
            ) : filteredDeptos.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                    No se encontraron departamentos.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeptos.map((depto) => (
                        <div key={depto.id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-xl p-6 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleEdit(depto)} className="p-2 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg text-slate-400 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(depto.id)} className="p-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                    <Building2 size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(depto.estado)}`}>
                                    {depto.estado}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{depto.alias}</h3>

                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                                <MapPin size={14} />
                                {depto.direccion}
                            </div>

                            {depto.propietario_nombre && (
                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                                    <User size={12} />
                                    Propietario: {depto.propietario_nombre}
                                </div>
                            )}

                            {depto.seguro_poliza && (
                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                    <Shield size={12} />
                                    Seguro: {depto.seguro_poliza}
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between items-center text-sm">
                                <span className="text-slate-500">Servicios: </span>
                                <span className="text-slate-300 text-xs truncate max-w-[150px]">{depto.servicios_incluidos || 'N/A'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {formData.id ? 'Editar Departamento' : 'Nuevo Departamento'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Identificatorio</label>
                                <input
                                    type="text"
                                    value={formData.alias}
                                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    required
                                    placeholder="Ej: Depto 1A, Casa Central"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Dirección Completa</label>
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    required
                                    placeholder="Calle 123, Ciudad"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Propietario</label>
                                <input
                                    type="text"
                                    value={formData.propietario_nombre}
                                    onChange={(e) => setFormData({ ...formData, propietario_nombre: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Nombre del propietario"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Seguro Póliza</label>
                                    <input
                                        type="text"
                                        value={formData.seguro_poliza}
                                        onChange={(e) => setFormData({ ...formData, seguro_poliza: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="#123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Vencimiento Seguro</label>
                                    <input
                                        type="date"
                                        value={formData.seguro_vencimiento}
                                        onChange={(e) => setFormData({ ...formData, seguro_vencimiento: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="VACIO">Vacío</option>
                                    <option value="ALQUILADO">Alquilado</option>
                                    <option value="REFACCION">Refacción</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Servicios Incluidos</label>
                                <textarea
                                    value={formData.servicios_incluidos}
                                    onChange={(e) => setFormData({ ...formData, servicios_incluidos: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none h-20"
                                    placeholder="Agua, Luz, Internet..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Notas Estado Inicial</label>
                                <textarea
                                    value={formData.notas_estado_inicial}
                                    onChange={(e) => setFormData({ ...formData, notas_estado_inicial: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none h-20"
                                    placeholder="Detalles del estado al iniciar..."
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
