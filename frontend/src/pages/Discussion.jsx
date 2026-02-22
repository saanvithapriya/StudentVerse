import { useState } from 'react';
import { MessageSquare, ThumbsUp, ChevronDown, User, PlusCircle } from 'lucide-react';

const DISCUSSIONS = [
    {
        id: 1,
        title: 'How to prepare for the TCS Ninja placement test?',
        content: 'Has anyone taken the TCS Ninja test recently? What topics should I focus on for the coding and aptitude sections? Any particular platforms you recommend for practice?',
        author: 'Vikram B.',
        time: '2 hours ago',
        likes: 45,
        answers: 12,
        tags: ['Placements', 'Coding']
    },
    {
        id: 2,
        title: 'Looking for teammates for the upcoming Hackathon',
        content: 'We need a frontend developer (React/Tailwind) for the Smart India Hackathon. The project focuses on AI-driven healthcare solutions. DM if interested!',
        author: 'Priya S.',
        time: '5 hours ago',
        likes: 24,
        answers: 8,
        tags: ['Hackathon', 'Team Building']
    },
    {
        id: 3,
        title: 'Best resources for learning System Design?',
        content: 'I want to start learning System Design for my upcoming interviews. Should I start with Grokking or read the DDIA book? Looking for structured pathways.',
        author: 'Rahul K.',
        time: '1 day ago',
        likes: 89,
        answers: 34,
        tags: ['System Design', 'Resources']
    },
];

export default function Discussion() {
    const [activeTab, setActiveTab] = useState('Trending');

    return (
        <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Discussion Forum</h1>
                    <p className="text-slate-500 mt-1">Ask questions, share advice, and connect with peers.</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <PlusCircle className="w-5 h-5" />
                    Ask Question
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="flex border-b border-slate-200">
                        {['Trending', 'Latest', 'Unanswered'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 font-medium text-sm transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {DISCUSSIONS.map((post) => (
                            <div key={post.id} className="glass-card p-6 group hover:border-primary-200 transition-colors cursor-pointer">
                                <div className="flex gap-4">
                                    {/* Voting column */}
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <button className="p-2 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                                            <ChevronDown className="w-6 h-6 rotate-180" />
                                        </button>
                                        <span className="font-bold text-slate-700">{post.likes}</span>
                                        <button className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                            <ChevronDown className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Content column */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-medium text-slate-700">{post.author}</span>
                                                <span>•</span>
                                                <span>{post.time}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                                {post.answers} Answers
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100">
                        <h3 className="font-bold text-slate-800 mb-2">Build your reputation</h3>
                        <p className="text-sm text-slate-600 mb-4">Answer questions, help your peers, and earn badges on your profile.</p>
                        <button className="w-full py-2.5 bg-white text-primary-600 font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors">
                            View Guidelines
                        </button>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Placements', 'Hackathon', 'React', 'DSA', 'Projects', 'Internships', 'Events'].map(tag => (
                                <button key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
