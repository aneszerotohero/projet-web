import React from 'react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Printer, Download, TrendingUp, AlertTriangle, AlertCircle, Search, ChevronLeft, ChevronRight, CheckCircle, BarChart3, XCircle } from 'lucide-react';

export default function Notes({ student, stats, grade_distribution, performance_trend, detailed_grades, modules = [], coefs = [], semestre = 1, general_moy }) {

    // Helper for visual trend line (simplified for mock data)
    const TrendLine = ({ data, color = 'blue' }) => (
        <div className="flex items-end h-32 gap-4 pt-4 px-4">
            {data?.data?.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 gap-2 group">
                    <div className="relative w-full flex justify-center items-end h-full">
                        <div
                            className={`w-3 h-3 rounded-full border-2 border-${color}-500 bg-white z-10 transition-all group-hover:scale-125`}
                            style={{ marginBottom: `${(val / 20) * 80}%` }}
                        ></div>
                        <div
                            className={`absolute bottom-0 w-0.5 bg-${color}-100 h-full`}
                            style={{ height: `${(val / 20) * 80}%` }}
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
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Student Grades</h1>
                        <p className="text-gray-600 mt-1">
                            Academic Year {student?.academic_year || '2023-2024'} • <span className="font-bold text-blue-600">{student?.class_name || '12th Grade'}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 text-sm">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* General Average */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">General Average</h3>
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-gray-900">{Number(stats?.general_avg || general_moy || 0).toFixed(2)}</span>
                            <span className="text-gray-400 font-medium text-lg">/20</span>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded ml-2">+0.5</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Passing ({stats?.passing_status || 'Admis'})</p>
                    </div>

                    {/* Highest Module */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Highest Module</h3>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-gray-900">{Number(stats?.highest_module?.score || 18.00).toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-900 font-bold mt-2">{stats?.highest_module?.name || 'Physics'}</p>
                    </div>

                    {/* Lowest Module */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Lowest Module</h3>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-gray-900">{Number(stats?.lowest_module?.score || 9.00).toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-900 font-bold mt-2">{stats?.lowest_module?.name || 'History'}</p>
                    </div>

                    {/* Absences */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Absences</h3>
                            <XCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-gray-900">{stats?.total_absences?.hours || 4}</span>
                            <span className="text-gray-400 font-medium text-sm">hours</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{stats?.total_absences?.unjustified || 2} Unjustified</p>
                    </div>
                </div>

                {/* Analysis Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Grade Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Grade Distribution</h3>
                                <p className="text-gray-500 text-xs mt-1">Number of modules by grade range</p>
                            </div>
                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">Trimestre {semestre}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 h-32 items-end px-2">
                            {['0-9', '10-12', '12-15', '18-20'].map((range, idx) => {
                                const count = grade_distribution ? Object.values(grade_distribution)[idx] : [2, 5, 8, 4][idx];
                                const color = ['red', 'gray', 'blue', 'purple'][idx];
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                                        <div className={`w-full h-1 ${idx === 2 ? 'bg-blue-500' : (idx === 3 ? 'bg-purple-500' : (idx === 0 ? 'bg-red-500' : 'bg-gray-400'))} rounded-full`}></div>
                                        <span className="text-xs font-bold text-gray-500">{range}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-between mt-2 px-2 text-xs font-bold text-gray-400">
                            <span>0-9</span><span>10-12</span><span>15-18</span><span>18-20</span>
                        </div>
                    </div>

                    {/* Performance Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Performance Trend</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <h2 className="text-3xl font-black text-gray-900">Trending Up</h2>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
                            </div>
                        </div>
                        <TrendLine data={performance_trend || { months: ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'], data: [10, 11, 11.5, 13, 14, 15] }} />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex flex-col gap-1 w-full md:w-48">
                            <label className="text-xs font-bold text-gray-700">Semester</label>
                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                                <option>2nd Trimestre</option>
                                <option>1st Trimestre</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 w-full md:w-48">
                            <label className="text-xs font-bold text-gray-700">Module</label>
                            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                                <option>All Modules</option>
                                <option>Math</option>
                                <option>Physics</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-700">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-gray-400" />
                            </div>
                            <input type="text" className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 pl-10 p-2.5" placeholder="Search by grade or note..." />
                        </div>
                    </div>
                </div>

                {/* Detailed Grades Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 text-lg">Detailed Grades Report</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">24 Results</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-center">Coef.</th>
                                    <th className="px-6 py-4 text-right">Grade (/20)</th>
                                    <th className="px-6 py-4 text-right">Weighted</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {detailed_grades?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.date}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{item.module}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                                ${item.type?.includes('DS') ? 'bg-blue-50 text-blue-700' :
                                                    item.type?.includes('Examen') ? 'bg-purple-50 text-purple-700' :
                                                        item.type?.includes('TP') ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`
                                            }>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-blue-600 font-semibold">{item.coef}</td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900">{Number(item.grade).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-gray-500 font-medium">{Number(item.weighted).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {item.status === 'passed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                )) || (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No detailed grades available.</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500">Showing 1 to 6 of 24 grades</span>
                        <div className="flex gap-2">
                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 disabled:opacity-50">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md shadow-blue-500/20">1</button>
                            <button className="px-3 py-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-lg text-sm">2</button>
                            <button className="px-3 py-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-lg text-sm">3</button>
                            <span className="px-2 py-1 text-gray-400">...</span>
                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
