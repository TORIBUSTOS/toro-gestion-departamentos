import { useState } from 'react'
import { Save, Shield, Database, Bell, Moon, Sun, User } from 'lucide-react'

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            alert("Configuración guardada correctamente")
        }, 1000)
    }

    const tabs = [
        { id: 'general', label: 'General', icon: User },
        { id: 'apariencia', label: 'Apariencia', icon: Moon },
        { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
        { id: 'seguridad', label: 'Seguridad', icon: Shield },
        { id: 'datos', label: 'Datos y Backup', icon: Database },
    ]

    return (
        <div className="flex-1 flex flex-col space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-white">Configuración</h1>
                <p className="text-slate-400 mt-1">Ajustes del sistema y preferencias</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar de Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 bg-slate-900/30 backdrop-blur-md border border-slate-800/50 rounded-xl p-6 shadow-xl min-h-[500px]">

                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-blue-500" /> Información General
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Empresa</label>
                                    <input type="text" defaultValue="TORO Holding" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email de Contacto</label>
                                    <input type="email" defaultValue="admin@toro.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Moneda Principal</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none">
                                        <option>ARS - Peso Argentino</option>
                                        <option>USD - Dólar Estadounidense</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Apariencia Tab */}
                    {activeTab === 'apariencia' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Moon size={20} className="text-purple-500" /> Personalización
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <Moon size={20} className="text-slate-300" />
                                        <div>
                                            <p className="text-white font-medium">Modo Oscuro</p>
                                            <p className="text-xs text-slate-400">Activa el tema oscuro para la interfaz</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Datos Tab */}
                    {activeTab === 'datos' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Database size={20} className="text-emerald-500" /> Gestión de Datos
                            </h2>

                            <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
                                <h3 className="text-white font-medium mb-2">Exportar Base de Datos</h3>
                                <p className="text-sm text-slate-400 mb-4">Descarga una copia completa de todos los departamentos, contratos e inquilinos en formato JSON.</p>
                                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors border border-slate-600">
                                    Descargar Backup (.json)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security & Notifications placeholders */}
                    {(activeTab === 'seguridad' || activeTab === 'notificaciones') && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Shield size={48} className="mb-4 opacity-20" />
                            <p>Opciones avanzadas próximamente...</p>
                        </div>
                    )}

                    {/* Footer Save Button */}
                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : (
                                <>
                                    <Save size={18} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
