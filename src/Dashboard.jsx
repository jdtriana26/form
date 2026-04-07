import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Reportes from './Reportes';
import logoDann from './assets/bg-dann.png';
import bgDann from './assets/logo-dann.png';

const inputClass = "w-full px-4 py-3 rounded-lg text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(150,180,255,0.25)' };

export default function Dashboard() {
    const [personas, setPersonas] = useState([]);
    const [empresasUnicas, setEmpresasUnicas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ nombre: '', cedula: '', empresa: '', telefono: '', correo: '' });
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('personas').select('*').order('created_at', { ascending: false });
        if (!error) {
            setPersonas(data);
            setEmpresasUnicas([...new Set(data.map(p => p.empresa))]);
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
        setFormData({ nombre: '', cedula: '', empresa: '', telefono: '', correo: '' });
        fetchData();
    };

    const eliminarPersona = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro?')) {
            await supabase.from('personas').delete().eq('id', id);
            fetchData();
        }
    };

    const prepararEdicion = (p) => {
        setEditandoId(p.id);
        setFormData({ nombre: p.nombre, cedula: p.cedula, empresa: p.empresa, telefono: p.telefono || '', correo: p.correo });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const personasFiltradas = personas.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cedula.includes(busqueda) ||
        p.empresa.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative"
            style={{ backgroundImage: `url(${bgDann})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0" style={{ background: 'rgba(5, 15, 40, 0.82)' }} />

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <img src={logoDann} alt="Dann Carlton" className="h-12 object-contain" style={{ filter: 'invert(1) brightness(2)' }} />
                        <div>
                            <h1 className="text-white text-xl font-bold leading-tight">Panel de Registros</h1>
                            <p className="text-blue-300 text-xs">Dann Carlton Hotel · Quito</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 transition font-medium"
                    >
                        <LogOut className="w-4 h-4" /> Salir
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario */}
                    <div
                        className="p-6 rounded-2xl h-fit"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(150,180,255,0.15)', backdropFilter: 'blur(8px)' }}
                    >
                        <h2 className="text-white text-lg font-semibold mb-5">
                            {editandoId ? '✏️ Editar Registro' : 'Nuevo Registro'}
                        </h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Nombre completo" required className={inputClass} style={inputStyle}
                                value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            <input type="text" placeholder="Cédula / ID" required className={inputClass} style={inputStyle}
                                value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })} />
                            <div>
                                <input list="empresas-list" placeholder="Empresa" required className={inputClass} style={inputStyle}
                                    value={formData.empresa} onChange={e => setFormData({ ...formData, empresa: e.target.value })} />
                                <datalist id="empresas-list">
                                    {empresasUnicas.map(emp => <option key={emp} value={emp} />)}
                                </datalist>
                            </div>
                            <input type="text" placeholder="Número de teléfono" className={inputClass} style={inputStyle}
                                value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                            <input type="email" placeholder="Correo electrónico" required className={inputClass} style={inputStyle}
                                value={formData.correo} onChange={e => setFormData({ ...formData, correo: e.target.value })} />

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3 rounded-lg text-white font-bold text-sm mt-1 transition-all hover:opacity-90 disabled:opacity-60"
                                style={{ background: editandoId ? 'linear-gradient(90deg,#ea580c,#f97316)' : 'linear-gradient(90deg,#2563eb,#3b82f6)', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}
                            >
                                {loading ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Registrar Persona'}
                            </button>

                            {editandoId && (
                                <button
                                    onClick={() => { setEditandoId(null); setFormData({ nombre: '', cedula: '', empresa: '', telefono: '', correo: '' }); }}
                                    className="w-full text-xs text-blue-300 hover:text-white underline transition"
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista + Reportes */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Buscador */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-blue-300 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cédula o empresa..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(150,180,255,0.25)' }}
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                        </div>

                        {/* Tabla */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(150,180,255,0.15)' }}
                        >
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr style={{ background: 'rgba(37,99,235,0.3)', borderBottom: '1px solid rgba(150,180,255,0.2)' }}>
                                        <th className="px-4 py-3 text-blue-200 font-semibold">Nombre / Cédula</th>
                                        <th className="px-4 py-3 text-blue-200 font-semibold">Empresa</th>
                                        <th className="px-4 py-3 text-blue-200 font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-blue-300 text-sm">
                                                {loading ? 'Cargando...' : 'No se encontraron registros.'}
                                            </td>
                                        </tr>
                                    ) : personasFiltradas.map((p, i) => (
                                        <tr
                                            key={p.id}
                                            className="transition hover:bg-white/5"
                                            style={{ borderBottom: '1px solid rgba(150,180,255,0.08)' }}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium">{p.nombre}</p>
                                                <p className="text-blue-300 text-xs">{p.cedula}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-200" style={{ background: 'rgba(37,99,235,0.3)' }}>
                                                    {p.empresa}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 space-x-3">
                                                <button onClick={() => prepararEdicion(p)} className="text-blue-300 hover:text-white text-xs transition">Editar</button>
                                                <button onClick={() => eliminarPersona(p.id)} className="text-red-400 hover:text-red-200 text-xs transition">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Reportes — solo visible porque el dashboard ya está protegido */}
                        <Reportes datos={personas} />
                    </div>
                </div>
            </div>
        </div>
    );
}