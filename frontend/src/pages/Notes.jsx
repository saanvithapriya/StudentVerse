import { useState } from 'react';
import { Upload, FileText, Download, Filter, Search } from 'lucide-react';

const NOTES = [
    { id: 1, title: 'Data Structures Final Revision', subject: 'Computer Science', semester: 'Sem 3', uploader: 'Vikram B.', downloads: 342, tags: ['DSA', 'Trees', 'Graphs'], date: 'Oct 10' },
    { id: 2, title: 'Thermodynamics Chapter 1-4', subject: 'Mechanical', semester: 'Sem 4', uploader: 'Sneha R.', downloads: 128, tags: ['Thermo', 'Laws', 'Cycles'], date: 'Nov 02' },
    { id: 3, title: 'Network Theory Formulas', subject: 'Electronics', semester: 'Sem 3', uploader: 'Amit M.', downloads: 89, tags: ['Circuits', 'Theorems'], date: 'Sep 25' },
    { id: 4, title: 'Microprocessor 8085 Architecture', subject: 'Electrical', semester: 'Sem 5', uploader: 'Priya S.', downloads: 210, tags: ['8085', 'Assembly'], date: 'Oct 28' },
    { id: 5, title: 'Operating Systems - Process Management', subject: 'Computer Science', semester: 'Sem 4', uploader: 'Rahul K.', downloads: 415, tags: ['OS', 'Scheduling'], date: 'Oct 15' },
    { id: 6, title: 'Engineering Physics Lab Manual', subject: 'First Year', semester: 'Sem 1', uploader: 'Neha J.', downloads: 520, tags: ['Physics', 'Lab', 'Readings'], date: 'Aug 20' },
];

const SUBJECTS = ['All', 'Computer Science', 'Mechanical', 'Electronics', 'Electrical', 'First Year'];
const SEMESTERS = ['All Semesters', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

export default function Notes() {
    const [activeSubject, setActiveSubject] = useState('All');
    const [activeSemester, setActiveSemester] = useState('All Semesters');

    const filteredNotes = NOTES.filter(note => {
        const matchSubject = activeSubject === 'All' || note.subject === activeSubject;
        const matchSemester = activeSemester === 'All Semesters' || note.semester === activeSemester;
        return matchSubject && matchSemester;
    });

    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Notes Sharing</h1>
                    <p className="text-slate-500 mt-1">Access and share study materials with your peers</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <Upload className="w-5 h-5" />
                    Upload Notes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-6">
                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                            <Filter className="w-4 h-4 text-primary-500" />
                            Subjects
                        </h3>
                        <div className="space-y-1">
                            {SUBJECTS.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setActiveSubject(subject)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSubject === subject ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-slate-800 mb-4">Semesters</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {SEMESTERS.map(sem => (
                                <button
                                    key={sem}
                                    onClick={() => setActiveSemester(sem)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors border ${activeSemester === sem ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {sem}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notes Grid */}
                <div className="flex-1">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for subjects, topics, or keywords..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredNotes.map(note => (
                            <div key={note.id} className="glass-card group hover:border-primary-200 transition-colors p-5 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-secondary-50 text-secondary-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                                        {note.semester}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{note.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">{note.subject}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {note.tags.map(tag => (
                                        <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="font-medium text-slate-700">{note.uploader}</span>
                                    </div>
                                    <button className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                        {note.downloads}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
