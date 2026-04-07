// Archivo: src/Registro.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import logoDann from './assets/logo-dann.png';
import bgDann from './assets/bg-dann.png';

const FIELDS = [
  { name: 'nombre',   placeholder: 'Nombre completo',      type: 'text',  required: true },
  { name: 'cedula',   placeholder: 'Cédula / ID',           type: 'text',  required: true },
  { name: 'empresa',  placeholder: 'Empresa',               type: 'text',  required: true },
  { name: 'telefono', placeholder: 'Número de teléfono',    type: 'tel',   required: false },
  { name: 'correo',   placeholder: 'Correo electrónico',    type: 'email', required: true },
];

const EMPTY = { nombre: '', cedula: '', empresa: '', telefono: '', correo: '' };

export default function Registro({ session }) {
  const navigate = useNavigate();
  const [formData, setFormData]   = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [exito, setExito]         = useState(false);
  const [serverError, setServerError] = useState(null);

  // Auto-ocultar mensaje de éxito después de 4 segundos
  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(false), 4000);
    return () => clearTimeout(t);
  }, [exito]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Validación local antes de enviar
  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim())  newErrors.nombre  = 'El nombre es obligatorio';
    if (!formData.cedula.trim())  newErrors.cedula  = 'La cédula es obligatoria';
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
        // Violación de unicidad (cédula o correo duplicados)
        setServerError('Ya existe un registro con esa cédula o correo electrónico.');
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
      <div
          className="min-h-screen flex flex-col items-center justify-start py-10 px-4 relative"
          style={{
            backgroundImage: `url(${bgDann})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
      >
        {/* Overlay oscuro */}
        <div
            className="absolute inset-0"
            style={{ background: 'rgba(5, 15, 40, 0.6)' }}
        />

        {/* Botón acceso arriba a la derecha */}
        <div className="relative w-full max-w-md flex justify-end mb-2">
          <button
              type="button"
              onClick={() => navigate(session ? '/dashboard' : '/login')}
              className="text-xs px-3 py-1.5 rounded-full border border-blue-400/40 text-blue-300 hover:text-white hover:border-blue-300 hover:bg-blue-900/30 transition-all"
          >
            {session ? 'Ir al Panel →' : 'Acceso administrativo →'}
          </button>
        </div>

        {/* Contenido principal */}
        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
                src={logoDann}
                alt="Dann Carlton Hotel"
                className="h-36 object-contain"
                style={{ filter: 'brightness(2)' }}
            />
          </div>

          <h1
              className="text-white text-2xl font-bold mb-6"
              style={{ letterSpacing: '0.01em' }}
          >
            Nuevo Registro
          </h1>

          {/* Mensaje de éxito */}
          {exito && (
              <div className="mb-4 p-3 rounded-lg text-sm text-green-200 bg-green-900/40 border border-green-600 flex items-center gap-2">
                <span>✅</span>
                <span>¡Registro exitoso! Puedes registrar otra persona.</span>
              </div>
          )}

          {/* Error del servidor */}
          {serverError && (
              <div className="mb-4 p-3 rounded-lg text-sm text-red-200 bg-red-900/40 border border-red-600 flex items-center gap-2">
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
          )}

          {/* Formulario — IMPORTANTE: usar <form> con onSubmit */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {FIELDS.map((field) => (
                <div key={field.name}>
                  <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      autoComplete="off"
                      className="w-full px-4 py-4 rounded-lg text-white placeholder-blue-200/70 text-base focus:outline-none transition-all"
                      style={{
                        background: errors[field.name]
                            ? 'rgba(239,68,68,0.1)'
                            : 'rgba(255,255,255,0.07)',
                        border: errors[field.name]
                            ? '1px solid rgba(239,68,68,0.7)'
                            : '1px solid rgba(150,180,255,0.3)',
                        backdropFilter: 'blur(4px)',
                        boxShadow: errors[field.name]
                            ? '0 0 0 2px rgba(239,68,68,0.2)'
                            : 'none',
                      }}
                  />
                  {/* Mensaje de error por campo */}
                  {errors[field.name] && (
                      <p className="mt-1 text-xs text-red-400 pl-1">
                        {errors[field.name]}
                      </p>
                  )}
                </div>
            ))}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg text-white font-bold text-base mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
                }}
            >
              {loading ? (
                  <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Registrando...
              </span>
              ) : (
                  'Registrar Persona'
              )}
            </button>
          </form>
        </div>
      </div>
  );
}