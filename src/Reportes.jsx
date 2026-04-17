// Archivo: src/Reportes.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { FileText, Table as TableIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reportes({ datos }) {

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

    const exportarExcel = () => {
        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Personas");
        XLSX.writeFile(libro, "Reporte_Personas.xlsx");
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Personas Registradas", 14, 15);

        const tablaColumnas = ["Nombre", "Cargo", "Empresa", "Teléfono", "Correo"];

        const tablaFilas = datos.map(p => [
            p.nombre,
            p.cargo,
            p.empresa,
            p.telefono || 'N/A',
            p.correo
        ]);

        autoTable(doc, {
            head: [tablaColumnas],
            body: tablaFilas,
            startY: 20,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        doc.save("Reporte_Personas.pdf");
    };

    return (
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(150,180,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-white text-lg font-bold">Análisis y Reportes</h2>
                    <p className="text-blue-300 text-xs">Cantidad de personas por empresa</p>
                </div>

                <div className="flex space-x-3">
                    <button onClick={exportarPDF} className="flex items-center px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                        <FileText className="w-4 h-4 mr-2" /> PDF
                    </button>
                    <button onClick={exportarExcel} className="flex items-center px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
                        <TableIcon className="w-4 h-4 mr-2" /> Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataGrafico}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,180,255,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: '#93c5fd' }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#93c5fd' }} />
                        <Tooltip />
                        <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                            {dataGrafico.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={dataGrafico} dataKey="cantidad" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
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