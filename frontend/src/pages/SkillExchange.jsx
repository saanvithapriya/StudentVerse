import { useState } from 'react';
import { Briefcase, Search, Mail, Wrench, Users } from 'lucide-react';

const SKILLS = [
    { id: 1, type: 'offer', title: 'I can build React/Tailwind websites', category: 'Web Dev', user: 'Rahul K.', level: 'Advanced', description: 'Looking to help out with frontend projects. I have 2 years of experience building React apps.' },
    { id: 2, type: 'request', title: 'Need someone to tutor me in DSA', category: 'Tutoring', user: 'Priya S.', level: 'Beginner', description: 'Struggling with Trees and Graphs for upcoming placements. Willing to pay or exchange skills!' },
    { id: 3, type: 'offer', title: 'I can draw digital portraits or logos', category: 'Design', user: 'Aditi V.', level: 'Intermediate', description: 'Figma and Illustrator proficient. Can design logos for your startup or hackathon project.' },
    { id: 4, type: 'request', title: 'Looking for a ML Engineer for a project', category: 'Machine Learning', user: 'Vikram B.', level: 'Advanced', description: 'Building a predictive healthcare app. Need someone who knows PyTorch or TensorFlow well.' }
];

const CATEGORIES = ['All', 'Web Dev', 'Design', 'Tutoring', 'Machine Learning', 'Writing', 'Video Editing'];

export default function SkillExchange() {
    const [activeTab, setActiveTab] = useState('all');
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredSkills = SKILLS.filter(skill => {
        const matchType = activeTab === 'all' || skill.type === activeTab;
        const matchCat = activeCategory === 'All' || skill.category === activeCategory;
        return matchType && matchCat;
    });

    return (
        <div className="mt-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 mb-10 text-center py-16 px-6">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-600/40 to-secondary-600/40 mix-blend-overlay"></div>
                <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-4">Skill Exchange</h1>
                    <p className="text-slate-300 text-lg mb-8">Offer your skills or request help from the campus community. Collaborate and grow together.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg shadow-white/10">
                            Offer a Skill
                        </button>
                        <button className="px-8 py-3 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors hover:border-slate-500">
                            Request Help
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 shrink-0 space-y-6">
                    <div className="glass-card p-2 rounded-2xl flex md:flex-col gap-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap md:w-full md:text-left flex items-center gap-2 ${activeTab === 'all' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Users className="w-4 h-4" /> All Boards
                        </button>
                        <button
                            onClick={() => setActiveTab('offer')}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap md:w-full md:text-left flex items-center gap-2 ${activeTab === 'offer' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Wrench className="w-4 h-4" /> Skills Offered
                        </button>
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap md:w-full md:text-left flex items-center gap-2 ${activeTab === 'request' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Search className="w-4 h-4" /> Help Requests
                        </button>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-slate-800 mb-4">Categories</h3>
                        <div className="space-y-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Board Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredSkills.map(skill => (
                            <div key={skill.id} className="glass-card p-6 flex flex-col h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 ${skill.type === 'offer' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wide ${skill.type === 'offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {skill.type === 'offer' ? 'Offering' : 'Requesting'}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {skill.category}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                    {skill.title}
                                </h3>

                                <p className="text-sm text-slate-600 mb-6 flex-1">
                                    {skill.description}
                                </p>

                                <div className="mt-auto border-t border-slate-100 pt-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                {skill.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{skill.user}</p>
                                                <p className="text-xs text-slate-500">{skill.level}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${skill.type === 'offer'
                                            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}>
                                        <Mail className="w-4 h-4" />
                                        Contact {skill.user.split(' ')[0]}
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
