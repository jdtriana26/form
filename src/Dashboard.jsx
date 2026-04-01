import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Trash2, Edit, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Reportes from './Reportes';

export default function Dashboard() {
    const [personas, setPersonas] = useState([]);
    const [empresasUnicas, setEmpresasUnicas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. ESTADO CORREGIDO: Todo usa 'telefono'
    const [formData, setFormData] = useState({
        nombre: '',
        cedula: '',
        empresa: '',
        telefono: '',
        correo: ''
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
            setPersonas(data);
            const unicas = [...new Set(data.map(p => p.empresa))];
            setEmpresasUnicas(unicas);
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
            // Aquí se envía el objeto formData que ahora ya tiene 'telefono'
            await supabase.from('personas').insert([formData]);
        }

        // Limpiar formulario correctamente
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
        setFormData({
            nombre: p.nombre,
            cedula: p.cedula,
            empresa: p.empresa,
            telefono: p.telefono || '', // Asegurar que no sea undefined
            correo: p.correo
        });
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
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Registros</h1>
                <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800 font-medium">
                    <LogOut className="w-4 h-4 mr-2" /> Salir
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-lg font-semibold mb-4">
                        {editandoId ? 'Editar Registro' : 'Nuevo Registro'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Nombre completo" required className="w-full p-2 border rounded-md"
                               value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />

                        <input type="text" placeholder="Cédula / ID" required className="w-full p-2 border rounded-md"
                               value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />

                        <div>
                            <input list="empresas-list" placeholder="Empresa" required className="w-full p-2 border rounded-md"
                                   value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
                            <datalist id="empresas-list">
                                {empresasUnicas.map(emp => <option key={emp} value={emp} />)}
                            </datalist>
                        </div>

                        <input type="text" placeholder="Número de teléfono" className="w-full p-2 border rounded-md"
                               value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />

                        <input type="email" placeholder="Correo electrónico" required className="w-full p-2 border rounded-md"
                               value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />

                        <button type="submit" disabled={loading} className={`w-full py-2 rounded-md text-white font-medium ${editandoId ? 'bg-orange-500' : 'bg-blue-600'}`}>
                            {editandoId ? 'Guardar Cambios' : 'Registrar Persona'}
                        </button>

                        {editandoId && (
                            <button onClick={() => {setEditandoId(null); setFormData({nombre:'', cedula:'', empresa:'', telefono:'', correo:''})}}
                                    className="w-full text-sm text-gray-500 underline mt-2">Cancelar edición</button>
                        )}
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white shadow-sm"
                               value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">Nombre / Cédula</th>
                                <th className="px-4 py-3">Empresa</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {personasFiltradas.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{p.nombre}</p>
                                        <p className="text-gray-500 text-xs">{p.cedula}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                {p.empresa}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-2">
                                        <button onClick={() => prepararEdicion(p)} className="text-blue-600">Editar</button>
                                        <button onClick={() => eliminarPersona(p.id)} className="text-red-600">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <Reportes datos={personas} />
                </div>
            </div>
        </div>
    );
}