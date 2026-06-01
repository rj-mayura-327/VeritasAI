import { useState, useEffect } from 'react';
import { getInsights, deleteInsight } from '../services/api';
import { Trash2, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Insights() {
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            const data = await getInsights();
            setInsights(data);
        } catch (e) {
            console.error("Failed to load insights");
        }
    };

    const handleDelete = async (id) => {
        await deleteInsight(id);
        loadInsights();
    };

    return (
        <div className="min-h-full p-6 md:p-12 max-w-7xl mx-auto">
            <div className="mb-12 border-b border-dark-700 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 md:mt-0">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 text-white">
                        <Sparkles className="text-primary-500" size={36} /> My Insights
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Valuable reflections and actionable advice you've saved.</p>
                </div>
                <div className="bg-dark-800 px-4 py-2 rounded-xl border border-dark-700 flex items-center gap-2 shadow-inner">
                    <BookOpen size={18} className="text-primary-500" /> 
                    <span className="font-semibold text-white">{insights.length} Saved</span>
                </div>
            </div>

            {insights.length === 0 ? (
                <div className="text-center py-24 bg-dark-800/30 rounded-3xl border border-dark-700 border-dashed">
                    <div className="w-24 h-24 bg-dark-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-500 border border-dark-700 shadow-inner">
                        <Sparkles size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-white">No insights yet</h2>
                    <p className="text-gray-400 max-w-md mx-auto">Save useful responses from the AI during your chats to review them here later.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 pb-24 md:pb-12">
                    <AnimatePresence>
                        {insights.map((insight, i) => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                key={insight.id} 
                                className="bg-dark-800 p-8 rounded-3xl border border-dark-700 hover:border-primary-500/50 transition-all duration-300 group flex flex-col shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="flex-1 text-base text-gray-300 whitespace-pre-wrap leading-relaxed mb-8">
                                    "{insight.content}"
                                </div>
                                <div className="flex items-center justify-between pt-5 border-t border-dark-700/50 mt-auto">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                        {new Date(insight.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(insight.id)} 
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100"
                                        title="Delete Insight"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
