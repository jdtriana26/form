import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LogOut, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Reportes from './Reportes';
import logoDann from './assets/logo-dann.png';
import bgDann from './assets/bg-dann.png';

const inputClass = "w-full px-4 py-3 rounded-lg text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(150,180,255,0.25)' };

export default function Dashboard() {
    const [personas, setPersonas] = useState([]);
    const [empresasUnicas, setEmpresasUnicas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '', cargo: '', empresa: '', telefono: '', correo: ''
    });
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('personas')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setPersonas(data || []);
            setEmpresasUnicas([...new Set(data?.map(p => p.empresa) || [])]);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (editandoId) {
            await supabase.from('personas').update(formData).eq('id', editandoId);
            setEditandoId(null);
        } else {
            await supabase.from('personas').insert([formData]);
        }

        setFormData({ nombre: '', cargo: '', empresa: '', telefono: '', correo: '' });
        setMostrarFormulario(false);
        fetchData();
    };

    const prepararEdicion = (p) => {
        setEditandoId(p.id);
        setFormData({
            nombre: p.nombre,
            cargo: p.cargo,
            empresa: p.empresa,
            telefono: p.telefono || '',
            correo: p.correo
        });
        setMostrarFormulario(true);
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setFormData({ nombre: '', cargo: '', empresa: '', telefono: '', correo: '' });
        setMostrarFormulario(false);
    };

    const eliminarPersona = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro?')) {
            await supabase.from('personas').delete().eq('id', id);
            fetchData();
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const personasFiltradas = personas.filter(p =>
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cargo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.empresa?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="min-h-screen" style={{ backgroundImage: `url(${bgDann})`, backgroundSize: 'cover' }}>
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-4">
                    <img src={logoDann} alt="Logo" className="h-12" />
                    <div>
                        <h1 className="text-white text-2xl font-bold">Panel de Registros</h1>
                        <p className="text-blue-300 text-sm">Dann Carlton Hotel · Quito</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                    <LogOut size={20} /> Salir
                </button>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {/* Formulario de edición */}
                {mostrarFormulario && (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
                        <h2 className="text-white text-xl font-bold mb-4">✏️ Editar Registro</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nombre completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className={inputClass} style={inputStyle} required />
                            <input type="text" placeholder="Cargo / Puesto" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className={inputClass} style={inputStyle} required />
                            <input type="text" placeholder="Empresa" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} className={inputClass} style={inputStyle} required />
                            <input type="tel" placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className={inputClass} style={inputStyle} />
                            <input type="email" placeholder="Correo electrónico" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} className={inputClass} style={inputStyle} required />

                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-medium">
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                <button type="button" onClick={cancelarEdicion} className="flex-1 bg-gray-600 hover:bg-gray-500 py-3 rounded-xl text-white font-medium">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!mostrarFormulario && (
                    <button onClick={() => setMostrarFormulario(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl text-white font-medium mb-6">
                        <Plus size={20} /> Nuevo Registro
                    </button>
                )}

                <input
                    type="text"
                    placeholder="Buscar por nombre, cargo o empresa..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl mb-6 text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(150,180,255,0.2)' }}
                />

                <Reportes datos={personasFiltradas} />

                {/* Tabla */}
                <div className="mt-8 overflow-x-auto">
                    <table className="w-full text-white">
                        <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-4">Nombre</th>
                            <th className="text-left py-4 px-4">Cargo</th>
                            <th className="text-left py-4 px-4">Empresa</th>
                            <th className="text-left py-4 px-4">Teléfono</th>
                            <th className="text-left py-4 px-4">Correo</th>
                            <th className="text-center py-4 px-4">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personasFiltradas.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-400">No se encontraron registros</td></tr>
                        ) : (
                            personasFiltradas.map(p => (
                                <tr key={p.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="py-4 px-4">{p.nombre}</td>
                                    <td className="py-4 px-4">{p.cargo}</td>
                                    <td className="py-4 px-4">{p.empresa}</td>
                                    <td className="py-4 px-4">{p.telefono || '—'}</td>
                                    <td className="py-4 px-4">{p.correo}</td>
                                    <td className="py-4 px-4 text-center space-x-4">
                                        <button onClick={() => prepararEdicion(p)} className="text-blue-400 hover:text-blue-300">Editar</button>
                                        <button onClick={() => eliminarPersona(p.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}