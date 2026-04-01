// Archivo: src/components/Reportes.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { FileText, Table as TableIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reportes({ datos }) {

    // 1. Preparar datos para los gráficos
    const prepararDatosGrafico = () => {
        const conteo = datos.reduce((acc, p) => {
            acc[p.empresa] = (acc[p.empresa] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(conteo).map(key => ({
            name: key,
            cantidad: conteo[key]
        }));
    };

    const dataGrafico = prepararDatosGrafico();

    // 2. Función para exportar a EXCEL
    const exportarExcel = () => {
        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Personas");
        XLSX.writeFile(libro, "Reporte_Personas.xlsx");
    };

    // 3. Función para exportar a PDF
    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Personas Registradas", 14, 15);

        const tablaColumnas = ["Nombre", "Cédula", "Empresa", "Teléfono", "Correo"];

        // Mapeamos los datos para que coincidan con las columnas
        const tablaFilas = datos.map(p => [
            p.nombre,
            p.cedula,
            p.empresa,
            p.telefono || 'N/A', // Usamos telefono que es el nombre real ahora
            p.correo
        ]);

        // LLAMADA CORREGIDA: Usamos la función importada pasando el documento (doc)
        autoTable(doc, {
            head: [tablaColumnas],
            body: tablaFilas,
            startY: 20,
            theme: 'striped', // Un estilo más limpio
            headStyles: { fillStyle: '#3B82F6' } // Azul como tu dashboard
        });

        doc.save("Reporte_Personas.pdf");
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Análisis y Reportes</h2>
                    <p className="text-sm text-gray-500">Cantidad de personas por empresa</p>
                </div>

                {/* Botones de Exportación */}
                <div className="flex space-x-3">
                    <button
                        onClick={exportarPDF}
                        className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm text-sm font-medium"
                    >
                        <FileText className="w-4 h-4 mr-2" /> PDF
                    </button>
                    <button
                        onClick={exportarExcel}
                        className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 shadow-sm text-sm font-medium"
                    >
                        <TableIcon className="w-4 h-4 mr-2" /> Excel
                    </button>
                </div>
            </div>

            {/* Gráfico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-80 w-full mt-10">
                {/* Gráfico de Barras (El que ya tienes) */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataGrafico}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="cantidad">
                            {dataGrafico.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* NUEVO: Gráfico de Pastel */}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dataGrafico}
                            dataKey="cantidad"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {dataGrafico.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}