// Archivo: src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Importamos tus páginas
import Login from './Login.jsx';      // <--- Sin la carpeta /pages
import Dashboard from './Dashboard';
import Reportes from './Reportes';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Revisar si hay una sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios en la autenticación (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras verifica la sesión, mostramos un indicador de carga
  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <BrowserRouter>
        <Routes>
          {/* Ruta de Login: Si ya está logueado, lo manda al Dashboard */}
          <Route
              path="/"
              element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />

          {/* Ruta Protegida: Si NO está logueado, lo manda al Login */}
          <Route
              path="/dashboard"
              element={session ? <Dashboard /> : <Navigate to="/" />}
          />

          {/* Redirección por defecto para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
  );
}