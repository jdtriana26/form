// Archivo: src/Registro.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import logoDann from './assets/logo-dann.png';
import bgDann from './assets/bg-dann.png';

export default function Registro({ session }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    empresa: '',
    telefono: '',
    correo: '',
  });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from('personas').insert([formData]);

    if (error) {
      setError('Ocurrió un error al registrar. Intenta de nuevo.');
    } else {
      setExito(true);
      setFormData({ nombre: '', cedula: '', empresa: '', telefono: '', correo: '' });
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4 relative"
      style={{
        backgroundImage: `url(${bgDann})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0" style={{ background: 'rgba(5, 15, 40, 0.55)' }} />

      {/* Botón login arriba a la derecha */}
      <div className="relative w-full max-w-md flex justify-end mb-2">
        {session ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-blue-300 hover:text-white underline transition"
          >
            Ir al Panel →
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-blue-300 hover:text-white underline transition"
          >
            Acceso administrativo →
          </button>
        )}
      </div>

      {/* Card central */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logoDann}
            alt="Dann Carlton Hotel"
            className="h-36 object-contain "
            style={{ filter: 'invert(1) brightness(2)' }}
          />
        </div>

        <h1 className="text-white text-2xl font-bold mb-6" style={{ letterSpacing: '0.01em' }}>
          Nuevo Registro
        </h1>

        {exito && (
          <div className="mb-4 p-3 rounded-lg text-sm text-green-200 bg-green-900/40 border border-green-600">
            ✅ ¡Registro exitoso! Puedes registrar otra persona.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-200 bg-red-900/40 border border-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {[
            { name: 'nombre', placeholder: 'Nombre completo', type: 'text' },
            { name: 'cedula', placeholder: 'Cédula / ID', type: 'text' },
            { name: 'empresa', placeholder: 'Empresa', type: 'text' },
            { name: 'telefono', placeholder: 'Número de teléfono', type: 'text' },
            { name: 'correo', placeholder: 'Correo electrónico', type: 'email' },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.name !== 'telefono'}
              className="w-full px-4 py-4 rounded-lg text-white placeholder-blue-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(150,180,255,0.3)',
                backdropFilter: 'blur(4px)',
              }}
            />
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-lg text-white font-bold text-base mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
              boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
            }}
          >
            {loading ? 'Registrando...' : 'Registrar Persona'}
          </button>
        </div>
      </div>
    </div>
  );
}
