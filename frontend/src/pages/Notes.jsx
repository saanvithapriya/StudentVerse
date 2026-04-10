import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Filter, Search, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['All', 'Computer Science', 'Mechanical', 'Electronics', 'Electrical', 'First Year'];
const SEMESTERS = ['All Semesters', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

export default function Notes() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [activeSubject, setActiveSubject] = useState('All');
    const [activeSemester, setActiveSemester] = useState('All Semesters');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        subject: 'Computer Science',
        semester: 'Sem 1',
        tags: '',
        file: null
    });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const { data } = await axios.get('/api/notes');
            setNotes(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setError('');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subject', formData.subject);
        data.append('semester', formData.semester);
        data.append('tags', formData.tags);
        data.append('file', formData.file);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/notes', data, config);
            setShowModal(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setFormData({ title: '', subject: 'Computer Science', semester: 'Sem 1', tags: '', file: null });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error uploading note');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (note) => {
        try {
            await axios.put(`/api/notes/${note._id}/download`);
            // Update UI count
            setNotes(notes.map(n => n._id === note._id ? { ...n, downloads: n.downloads + 1 } : n));
            // Trigger actual download (in reality we fetch the file buffer or open URL)
            window.open(note.fileUrl, '_blank');
        } catch (err) {
            console.error(err);
        }
    };

    const filteredNotes = Array.isArray(notes) ? notes.filter(note => {
        const matchSubject = activeSubject === 'All' || note.subject === activeSubject;
        const matchSemester = activeSemester === 'All Semesters' || note.semester === activeSemester;
        const noteTitle = note.title || '';
        const noteTags = note.tags || [];
        const matchSearch = noteTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            noteTags.some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()));
        return matchSubject && matchSemester && matchSearch;
    }) : [];

    return (
        <div className="mt-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Notes Sharing</h1>
                    <p className="text-slate-500 mt-1">Access and share study materials with your peers</p>
                </div>

                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for subjects, topics, or keywords..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none shadow-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading notes...</div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-100">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-600">No notes found</h3>
                            <p className="text-slate-500 mt-1 text-sm">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredNotes.map(note => (
                                <div key={note._id} className="glass-card group hover:border-primary-200 transition-colors p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-secondary-50 text-secondary-600 rounded-xl group-hover:scale-110 transition-transform">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                                            {note.semester}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{note.title || 'Untitled'}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{note.subject}</p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(note.tags || []).map(tag => (
                                            <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md mb-1">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="font-medium text-slate-700 truncate max-w-[100px]">{note.uploaderName}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleDownload(note)}
                                            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            {note.downloads}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Upload Notes</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                            <form onSubmit={handleUploadSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                        <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                                            {SUBJECTS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                                        <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                                            {SEMESTERS.filter(s => s !== 'All Semesters').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                                    <input type="text" placeholder="e.g. Physics, Midterm, Important" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF, DOCX)</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                                        <input type="file" required onChange={e => setFormData({...formData, file: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    </div>
                                </div>
                                <button disabled={uploading} type="submit" className="w-full py-3 mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50">
                                    {uploading ? 'Uploading...' : 'Submit for Approval'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 z-50 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                    <span className="font-medium">Note submitted for admin approval!</span>
                </div>
            )}
        </div>
    );
}
