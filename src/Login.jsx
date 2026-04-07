// Archivo: src/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import logoDann from './assets/logo-dann.png';
import bgDann from './assets/bg-dann.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 relative"
            style={{
                backgroundImage: `url(${bgDann})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0" style={{ background: 'rgba(5, 15, 40, 0.6)' }} />

            <div className="relative w-full max-w-sm">
                <div className="flex justify-center mb-8">
                    <img
                        src={logoDann}
                        alt="Dann Carlton Hotel"
                        className="h-32 object-contain"
                        style={{ filter: 'brightness(2)' }}
                    />
                </div>

                <h2 className="text-white text-2xl font-bold mb-1">Acceso Administrativo</h2>
                <p className="text-blue-300 text-sm mb-6">Panel de Registro y Reportes</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm text-red-200 bg-red-900/40 border border-red-600">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-4 rounded-lg text-white placeholder-blue-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(150,180,255,0.3)' }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-4 rounded-lg text-white placeholder-blue-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(150,180,255,0.3)' }}
                    />

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-4 rounded-lg text-white font-bold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                        style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)', boxShadow: '0 4px 20px rgba(37,99,235,0.5)' }}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar al sistema'}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full text-sm text-blue-300 hover:text-white transition underline pt-1"
                    >
                        ← Volver al registro
                    </button>
                </div>
            </div>
        </div>
    );
}