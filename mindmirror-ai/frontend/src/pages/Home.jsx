import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDailyCheck } from '../services/api';
import { ArrowRight, BrainCircuit, Target, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const [dailyCheck, setDailyCheck] = useState('Loading daily reality check...');

    useEffect(() => {
        getDailyCheck().then(data => {
            if (data.message) setDailyCheck(data.message);
        }).catch(() => setDailyCheck("You don't need another course today. You need to finish what you already started."));
    }, []);

    return (
        <div className="min-h-full p-6 md:p-12 lg:p-20 max-w-6xl mx-auto flex flex-col justify-center">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-16 space-y-6 pt-10"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-sm font-medium text-gray-300 mb-4">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span> AI Assistant Online
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
                    Your AI <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-blue-500 drop-shadow-sm">Reflection</span> Partner
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Identify blind spots, challenge weak reasoning, and make better decisions. No fluff, just actionable guidance.
                </p>
                <div className="pt-8">
                    <Link to="/chat" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                        Start Session <ArrowRight size={20} />
                    </Link>
                </div>
            </motion.div>

            {/* Daily Reality Check */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-dark-800/80 backdrop-blur-2xl border border-dark-700 p-8 rounded-3xl mb-24 relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary-400 to-blue-500"></div>
                <h2 className="text-xs uppercase tracking-widest text-primary-400 font-bold mb-4 flex items-center gap-2">
                    <Zap size={16} /> Daily Reality Check
                </h2>
                <p className="text-xl md:text-3xl font-medium text-white/90 leading-tight">"{dailyCheck}"</p>
            </motion.div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 pb-10">
                {[
                    { icon: <ShieldCheck size={28}/>, title: "Truth Mode", desc: "Direct, unfiltered feedback to break your illusions." },
                    { icon: <BrainCircuit size={28}/>, title: "Mentor Mode", desc: "Supportive coaching to guide your growth." },
                    { icon: <Target size={28}/>, title: "Action Oriented", desc: "Turn vague thoughts into concrete next steps." }
                ].map((feature, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                        className="bg-dark-800/50 p-8 rounded-3xl border border-dark-700 hover:bg-dark-800 hover:border-primary-500/30 transition-all group"
                    >
                        <div className="text-primary-400 mb-6 bg-dark-900 shadow-inner shadow-black/50 border border-dark-700 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
