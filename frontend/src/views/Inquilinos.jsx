import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Phone, Mail, FileText, MessageCircle } from 'lucide-react'
import api from '../services/api'

export default function Inquilinos() {
    const [inquilinos, setInquilinos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterEstado, setFilterEstado] = useState('TODOS')

    // Estado para el formulario (nuevo o edición)
    const [formData, setFormData] = useState({
        id: null,
        nombre_apellido: '',
        dni_cuit: '',
        telefono: '',
        email: '',
        canal_comunicacion: 'WhatsApp',
        estado: 'ACTIVO'
    })

    useEffect(() => {
        fetchInquilinos()
    }, [])

    const fetchInquilinos = async () => {
        try {
            const response = await api.get('/inquilinos')
            setInquilinos(response.data)
        } catch (error) {
            console.error('Error al cargar inquilinos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (formData.id) {
                // Editar
                await api.put(`/inquilinos/${formData.id}`, formData)
            } else {
                // Crear (quitamos el id null)
                const { id, ...newInquilino } = formData
                await api.post('/inquilinos', newInquilino)
            }
            setShowModal(false)
            fetchInquilinos()
            resetForm()
        } catch (error) {
            console.error('Detalle del error:', error.response?.data)
            const errorDetail = error.response?.data?.detail
            alert('Error al guardar: ' + (typeof errorDetail === 'object' ? JSON.stringify(errorDetail, null, 2) : (errorDetail || error.message)))
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este inquilino?')) return
        try {
            await api.delete(`/inquilinos/${id}`)
            fetchInquilinos()
        } catch (error) {
            alert('Error al eliminar: ' + (error.response?.data?.detail || error.message))
        }
    }

    const resetForm = () => {
        setFormData({
            id: null,
            nombre_apellido: '',
            dni_cuit: '',
            telefono: '',
            email: '',
            canal_comunicacion: 'WhatsApp',
            estado: 'ACTIVO'
        })
    }

    const handleEdit = (inquilino) => {
        setFormData({
            ...inquilino,
            nombre_apellido: inquilino.nombre_apellido || '',
            dni_cuit: inquilino.dni_cuit || '',
            telefono: inquilino.telefono || '',
            email: inquilino.email || '',
            canal_comunicacion: inquilino.canal_comunicacion || 'WhatsApp',
        })
        setShowModal(true)
    }

    // Filtrado
    const filteredInquilinos = inquilinos.filter(i => {
        const matchesSearch = (i.nombre_apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.dni_cuit && i.dni_cuit.includes(searchTerm))
        const matchesEstado = filterEstado === 'TODOS' || i.estado === filterEstado
        return matchesSearch && matchesEstado
    })

    // Helpers de UI
    const getEstadoColor = (estado) => {
        return estado === 'ACTIVO'
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inquilinos</h1>
                    <p className="text-slate-400 mt-1">Gestión de personas y contactos</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                    <Plus size={20} />
                    Nuevo Inquilino
                </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI/CUIT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Grid de Cards */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">Cargando inquilinos...</div>
            ) : filteredInquilinos.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                    No se encontraron inquilinos.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInquilinos.map((inq) => (
                        <div key={inq.id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-xl p-6 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleEdit(inq)} className="p-2 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg text-slate-400 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(inq.id)} className="p-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
                                    {(inq.nombre_apellido || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{inq.nombre_apellido}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getEstadoColor(inq.estado)}`}>
                                        {inq.estado}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-slate-500" />
                                    DNI/CUIT: <span className="text-slate-300">{inq.dni_cuit || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-500" />
                                    <span className="text-slate-300">{inq.telefono || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-500" />
                                    <span className="text-slate-300">{inq.email || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={14} className="text-slate-500" />
                                    <span className="text-slate-300">{inq.canal_comunicacion || '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {formData.id ? 'Editar Inquilino' : 'Nuevo Inquilino'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={formData.nombre_apellido}
                                    onChange={(e) => setFormData({ ...formData, nombre_apellido: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">DNI / CUIT</label>
                                <input
                                    type="text"
                                    value={formData.dni_cuit}
                                    onChange={(e) => setFormData({ ...formData, dni_cuit: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                    >
                                        <option value="ACTIVO">Activo</option>
                                        <option value="INACTIVO">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email (Opcional)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Canal Comunicación</label>
                                <select
                                    value={formData.canal_comunicacion}
                                    onChange={(e) => setFormData({ ...formData, canal_comunicacion: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Telefono">Teléfono</option>
                                    <option value="Email">Email</option>
                                    <option value="Otro">Otro</option>
                                </select>
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
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
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
