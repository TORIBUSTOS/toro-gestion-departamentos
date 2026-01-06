import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, ArrowRight, Save, X } from 'lucide-react';
import api from '../services/api';

export default function Calculadora({ onClose, contratos = [], onUpdateContrato }) {
    const [selectedContratoId, setSelectedContratoId] = useState('');
    const [montoBase, setMontoBase] = useState('');
    const [tipoAjuste, setTipoAjuste] = useState('PORCENTAJE'); // PORCENTAJE, FIJO
    const [valorAjuste, setValorAjuste] = useState('');
    const [resultado, setResultado] = useState(null);

    // Cuando se selecciona un contrato, autocompletar el monto base
    useEffect(() => {
        if (selectedContratoId) {
            const contrato = contratos.find(c => c.id === parseInt(selectedContratoId));
            if (contrato) {
                setMontoBase(parseFloat(contrato.monto_inicial));
            }
        }
    }, [selectedContratoId, contratos]);

    // Calcular resultado automáticamente
    useEffect(() => {
        if (!montoBase || !valorAjuste) {
            setResultado(null);
            return;
        }

        const base = parseFloat(montoBase);
        const ajuste = parseFloat(valorAjuste);
        let nuevoMonto = 0;
        let diferencia = 0;

        if (tipoAjuste === 'PORCENTAJE') {
            diferencia = base * (ajuste / 100);
            nuevoMonto = base + diferencia;
        } else {
            diferencia = ajuste;
            nuevoMonto = base + ajuste;
        }

        setResultado({
            nuevoMonto,
            diferencia
        });
    }, [montoBase, tipoAjuste, valorAjuste]);

    const handleAplicar = async () => {
        if (!selectedContratoId || !resultado) return;
        if (!window.confirm(`¿Estás seguro de actualizar el monto del contrato a $${resultado.nuevoMonto.toLocaleString()}?`)) return;

        try {
            // Obtenemos contrato actual para no perder otros datos
            const contratoActual = contratos.find(c => c.id === parseInt(selectedContratoId));

            // Enviamos actualización
            await api.put(`/contratos/${selectedContratoId}`, {
                ...contratoActual,
                monto_inicial: resultado.nuevoMonto
            });

            alert('Contrato actualizado correctamente.');
            if (onUpdateContrato) onUpdateContrato();
            onClose();
        } catch (error) {
            alert('Error al actualizar: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Calculadora de Ajustes</h2>
                        <p className="text-slate-400 text-sm">Simular aumentos por IPC o monto fijo</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Selección de Contrato (Opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Cargar desde Contrato (Opcional)</label>
                        <select
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            value={selectedContratoId}
                            onChange={(e) => setSelectedContratoId(e.target.value)}
                        >
                            <option value="">-- Usar calculadora libre --</option>
                            {contratos.filter(c => c.estado === 'ACTIVO').map(c => (
                                <option key={c.id} value={c.id}>
                                    Contrato #{c.id} - $ {parseFloat(c.monto_inicial).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Inputs Principales */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Monto Actual ($)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-lg"
                                value={montoBase}
                                onChange={(e) => setMontoBase(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Valor Ajuste</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-lg"
                                value={valorAjuste}
                                onChange={(e) => setValorAjuste(e.target.value)}
                                placeholder={tipoAjuste === 'PORCENTAJE' ? 'Ej: 15.5' : 'Ej: 50000'}
                            />
                        </div>
                    </div>

                    {/* Tabs de Tipo */}
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setTipoAjuste('PORCENTAJE')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${tipoAjuste === 'PORCENTAJE'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Percent size={18} /> Porcentaje / IPC
                        </button>
                        <button
                            onClick={() => setTipoAjuste('FIJO')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${tipoAjuste === 'FIJO'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <DollarSign size={18} /> Monto Fijo
                        </button>
                    </div>

                    {/* Resultados */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                        {resultado ? (
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Nuevo Monto</p>
                                    <p className="text-3xl font-bold text-white tracking-tight">
                                        $ {resultado.nuevoMonto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-emerald-400 text-sm mt-1 flex items-center gap-1">
                                        <ArrowRight size={12} />
                                        + $ {resultado.diferencia.toLocaleString()} ({tipoAjuste === 'PORCENTAJE' ? valorAjuste : ((resultado.diferencia / montoBase) * 100).toFixed(1)}%)
                                    </p>
                                </div>
                                {selectedContratoId && (
                                    <button
                                        onClick={handleAplicar}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Save size={18} /> Aplicar
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-4">
                                Ingresa valores para calcular
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
