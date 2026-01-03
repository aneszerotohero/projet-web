import React from 'react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Printer, Download, AlertTriangle, AlertCircle, CheckCircle, Clock, RotateCcw, Calendar, FileText, Ban } from 'lucide-react';

export default function Absences({ student, stats, trends, absences = [] }) {

    // Helper to render the Trend Chart
    const TrendChart = ({ data }) => (
        <div className="flex h-32 items-end justify-between px-4 sm:px-12 pt-6">
            {data?.data?.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-full group cursor-default">
                    <div className="relative flex justify-center w-full h-full items-end">
                        {/* Line Connector (Simplified) */}
                        {idx < data.data.length - 1 && (
                            <div
                                className="absolute top-0 right-[-50%] w-full h-0.5 bg-blue-100 transform origin-left rotate-[12deg]"
                                style={{ top: `${100 - (val / 5) * 100}%`, transform: `rotate(${((data.data[idx + 1] - val) * 5)}deg)` }}
                            ></div>
                        )}
                        <div
                            className="z-10 w-3 h-3 bg-white border-2 border-blue-500 rounded-full hover:scale-125 transition-transform"
                            style={{ marginBottom: `${(val / 5) * 70}px` }}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase">{data.months[idx]}</span>
                </div>
            ))}
        </div>
    );

    return (
        <StudentLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
                {/* Header Section */}
                <div className="mb-8">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Student Absences</h1>
                            <p className="text-gray-600 mt-1">
                                Academic Year {student?.academic_year || '2023-2024'} • <span className="font-bold text-gray-800">{student?.term || 'Term 1'}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm">
                                <Printer className="w-4 h-4" />
                                Print List
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 text-sm">
                                <Download className="w-4 h-4" />
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Hours Missed */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Hours Missed</h3>
                            <div className="p-1.5 bg-red-50 rounded-lg">
                                <Ban className="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">{stats?.total_hours || 0}</span>
                                <span className="text-2xl font-bold text-gray-900">hrs</span>
                            </div>
                            <p className="text-xs text-red-500 font-bold mt-1">+{stats?.since_last_month || 0}hrs <span className="text-gray-400 font-medium">since last month</span></p>
                        </div>
                    </div>

                    {/* Justified Absences */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Justified Absences</h3>
                            <div className="p-1.5 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">{stats?.justified_hours || 0}</span>
                                <span className="text-2xl font-bold text-gray-900">hrs</span>
                            </div>
                            <div className="w-16 h-1.5 bg-green-500 rounded-full mt-3"></div>
                        </div>
                    </div>

                    {/* Unjustified Absences */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Unjustified Absences</h3>
                            <div className="p-1.5 bg-orange-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">{stats?.unjustified_hours || 0}</span>
                                <span className="text-2xl font-bold text-gray-900">hrs</span>
                            </div>
                            <div className="w-8 h-1.5 bg-orange-500 rounded-full mt-3"></div>
                        </div>
                    </div>

                    {/* Deleted Records */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Deleted Records</h3>
                            <div className="p-1.5 bg-gray-50 rounded-lg">
                                <RotateCcw className="w-5 h-5 text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">{stats?.deleted_records || 0}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-1">Admin corrections</p>
                        </div>
                    </div>
                </div>

                {/* Trends Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Absence Trends</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg">Last 6 Months</span>
                    </div>
                    {/* Simplified Chart Area */}
                    <div className="h-40 w-full border-t border-dashed border-gray-100 mt-4 relative">
                        <TrendChart data={trends || { months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], data: [0, 0, 0, 0, 0, 0] }} />
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-gray-900 text-lg">Absence History</h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Total {absences.length}</span>
                        </div>

                        <div className="flex gap-2 text-sm">
                            <div className="relative">
                                <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-lg py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                                    <option>All Modules</option>
                                    <option>Math</option>
                                </select>
                            </div>
                            <div className="relative">
                                <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-lg py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                                    <option>Newest First</option>
                                    <option>Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Module / Time</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Details / Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {absences.map((item, idx) => (
                                    <tr key={idx} className={`group transition-colors ${item.is_deleted ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-gray-900 font-bold">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {item.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-gray-900">{item.module}</div>
                                                <div className="text-xs text-gray-500 font-medium mt-0.5">{item.time}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${item.type === 'Unjustified' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                item.type === 'Justified' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.is_deleted ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Deleted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Active Record
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.is_deleted ? (
                                                <div className="flex items-start gap-2 text-red-600 text-xs font-medium italic">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    {item.details}
                                                </div>
                                            ) : item.details.includes('.pdf') ? (
                                                <a href="#" className="flex items-center gap-2 text-gray-900 font-bold text-xs underline decoration-gray-300 hover:text-blue-600 hover:decoration-blue-600 transition-all">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    {item.details}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {absences.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No absences recorded for this term.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
