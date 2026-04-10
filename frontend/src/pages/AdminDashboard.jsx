import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [pendingNotes, setPendingNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!user.isAdmin) {
            navigate('/');
            return;
        }
        fetchPendingNotes();
    }, [user, navigate]);

    const fetchPendingNotes = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/notes/pending', config);
            setPendingNotes(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch pending notes');
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/notes/${id}/approve`, {}, config);
            setPendingNotes(pendingNotes.filter(note => note._id !== id));
        } catch (err) {
            console.error(err);
            alert('Error approving note');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and delete this note?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/notes/${id}/reject`, config);
            setPendingNotes(pendingNotes.filter(note => note._id !== id));
        } catch (err) {
            console.error(err);
            alert('Error rejecting note');
        }
    };

    if (loading) {
        return <div className="text-center mt-20 text-slate-500">Loading pending notes...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <AlertCircle className="w-8 h-8 text-primary-600" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Review and approve pending notes uploads.</p>
                </div>
            </div>

            {pendingNotes.length === 0 ? (
                <div className="glass-card p-12 text-center flex flex-col items-center">
                    <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">All caught up!</h2>
                    <p className="text-slate-500 mt-2">There are no pending notes requiring approval.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingNotes.map(note => (
                        <div key={note._id} className="glass-card p-6 flex flex-col items-start h-full relative">
                            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">PENDING</div>
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{note.title}</h3>
                            <div className="text-sm text-slate-500 mb-4 space-y-1">
                                <p><span className="font-semibold text-slate-600">Subject:</span> {note.subject}</p>
                                <p><span className="font-semibold text-slate-600">Sem:</span> {note.semester}</p>
                                <p><span className="font-semibold text-slate-600">By:</span> {note.uploaderName}</p>
                            </div>
                            <div className="mt-auto pt-4 flex gap-3 w-full border-t border-slate-100">
                                <button
                                    onClick={() => handleApprove(note._id)}
                                    className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleReject(note._id)}
                                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
