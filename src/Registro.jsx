// Archivo: src/Registro.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import logoDann from './assets/logo-dann.png';
import bgDann from './assets/bg-dann.png';

const FIELDS = [
  { name: 'nombre',   placeholder: 'Nombre completo',      type: 'text',  required: true },
  { name: 'cargo',    placeholder: 'Cargo / Puesto',       type: 'text',  required: true },
  { name: 'empresa',  placeholder: 'Empresa',               type: 'text',  required: true },
  { name: 'telefono', placeholder: 'Número de teléfono',    type: 'tel',   required: false },
  { name: 'correo',   placeholder: 'Correo electrónico',    type: 'email', required: true },
];

const EMPTY = { nombre: '', cargo: '', empresa: '', telefono: '', correo: '' };

export default function Registro({ session }) {
  const navigate = useNavigate();
  const [formData, setFormData]   = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [exito, setExito]         = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(false), 4000);
    return () => clearTimeout(t);
  }, [exito]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim())  newErrors.nombre  = 'El nombre es obligatorio';
    if (!formData.cargo.trim())   newErrors.cargo   = 'El cargo es obligatorio';
    if (!formData.empresa.trim()) newErrors.empresa = 'La empresa es obligatoria';
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Ingresa un correo válido';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('personas').insert([formData]);

    if (error) {
      if (error.code === '23505') {
        setServerError('Ya existe un registro con ese cargo o correo electrónico.');
      } else {
        setServerError('Ocurrió un error al registrar. Intenta de nuevo.');
      }
    } else {
      setExito(true);
      setFormData(EMPTY);
      setErrors({});
    }
    setLoading(false);
  };

  return (
      <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 relative"
           style={{ backgroundImage: `url(${bgDann})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(5, 15, 40, 0.6)' }} />

        <div className="relative w-full max-w-md flex justify-end mb-2">
          <button onClick={() => navigate(session ? '/dashboard' : '/login')}
                  className="text-xs px-3 py-1.5 rounded-full border border-blue-400/40 text-blue-300 hover:text-white hover:border-blue-300 hover:bg-blue-900/30 transition-all">
            {session ? 'Ir al Panel →' : 'Acceso administrativo →'}
          </button>
        </div>

        <div className="relative w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src={logoDann} alt="Logo" className="h-36 object-contain" style={{ filter: 'brightness(2)' }} />
          </div>

          <h1 className="text-white text-2xl font-bold mb-6">Nuevo Registro</h1>

          {exito && (
              <div className="mb-4 p-3 rounded-lg text-sm text-green-200 bg-green-900/40 border border-green-600">
                ✅ ¡Registro exitoso! Puedes registrar otra persona.
              </div>
          )}

          {serverError && (
              <div className="mb-4 p-3 rounded-lg text-sm text-red-200 bg-red-900/40 border border-red-600">
                ⚠️ {serverError}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {FIELDS.map((field) => (
                <div key={field.name}>
                  <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full px-4 py-4 rounded-lg text-white placeholder-blue-200/70 text-base focus:outline-none transition-all"
                      style={{
                        background: errors[field.name] ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.07)',
                        border: errors[field.name] ? '1px solid rgba(239,68,68,0.7)' : '1px solid rgba(150,180,255,0.3)',
                      }}
                  />
                  {errors[field.name] && <p className="mt-1 text-xs text-red-400 pl-1">{errors[field.name]}</p>}
                </div>
            ))}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg text-white font-bold text-base mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
            >
              {loading ? 'Registrando...' : 'Registrar Persona'}
            </button>
          </form>
        </div>
      </div>
  );
}