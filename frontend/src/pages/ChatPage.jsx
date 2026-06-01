import { useState, useEffect, useRef } from 'react';
import { chatWithAI, getConversations, getConversation, deleteConversation, saveInsight } from '../services/api';
import { Send, Plus, MessageSquare, Trash2, BookmarkPlus, Check, ChevronLeft, Bot, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MODES = ['Truth', 'Mentor', 'Career', 'Productivity'];

export default function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('Mentor');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [savedMsgId, setSavedMsgId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (e) {
            console.error("Failed to load conversations");
        }
    };

    const loadChat = async (id) => {
        setCurrentChatId(id);
        if (window.innerWidth < 768) setSidebarOpen(false);
        try {
            const data = await getConversation(id);
            setMessages(data);
        } catch (e) {
            console.error("Failed to load chat");
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleDeleteChat = async (e, id) => {
        e.stopPropagation();
        await deleteConversation(id);
        if (currentChatId === id) handleNewChat();
        loadConversations();
    };

    const handleSaveInsight = async (content, msgId) => {
        try {
            await saveInsight(content);
            setSavedMsgId(msgId);
            setTimeout(() => setSavedMsgId(null), 2000);
        } catch (e) {
            console.error("Failed to save insight");
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const data = await chatWithAI(userMsg, mode, currentChatId);
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
            if (!currentChatId) {
                setCurrentChatId(data.conversation_id);
                loadConversations();
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Error: Could not reach the AI. Ensure backend is running and API key is set.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full bg-dark-900 relative">
            {/* Mobile Sidebar Overlay */}
            {!sidebarOpen && window.innerWidth < 768 && (
                <button 
                    className="absolute top-4 left-4 z-40 p-2 bg-dark-800 rounded-lg border border-dark-700 md:hidden"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Conversations Sidebar */}
            <div className={`absolute md:relative z-30 h-full bg-dark-800/95 backdrop-blur-xl border-r border-dark-700 transition-all duration-300 flex flex-col shadow-2xl ${sidebarOpen ? 'w-72 sm:w-80 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-dark-700 flex justify-between items-center">
                    <button onClick={handleNewChat} className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20">
                        <Plus size={20} /> New Session
                    </button>
                    <button className="md:hidden ml-2 p-3 text-gray-400" onClick={() => setSidebarOpen(false)}>
                        <ChevronLeft size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {conversations.map(conv => (
                        <div 
                            key={conv.id} 
                            onClick={() => loadChat(conv.id)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all duration-200 ${currentChatId === conv.id ? 'bg-dark-700 text-white shadow-md' : 'text-gray-400 hover:bg-dark-700/50 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <MessageSquare size={16} className={currentChatId === conv.id ? 'text-primary-400' : ''} />
                                <span className="truncate text-sm font-medium">{conv.title}</span>
                            </div>
                            <button onClick={(e) => handleDeleteChat(e, conv.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col w-full h-full relative">
                {/* Header */}
                <div className="h-16 border-b border-dark-700 flex items-center px-4 md:px-6 justify-between bg-dark-900/80 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-4 pl-10 md:pl-0">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft size={24} className={`transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
                        </button>
                        <h2 className="font-semibold text-lg hidden sm:block">AI Session</h2>
                    </div>
                    <div className="flex bg-dark-800 rounded-lg p-1 border border-dark-700 overflow-x-auto max-w-[220px] sm:max-w-md no-scrollbar">
                        {MODES.map(m => (
                            <button 
                                key={m} 
                                onClick={() => setMode(m)}
                                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${mode === m ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 max-w-md mx-auto text-center px-4">
                            <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4 border border-dark-700 shadow-inner">
                                <Bot size={40} className="text-primary-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">How can I help you reflect today?</h3>
                            <p className="text-sm">Select a mode at the top and share what's on your mind. Be as open as possible for the best feedback.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={i} 
                                className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-600 shadow-lg shadow-primary-500/20' : 'bg-dark-800 border border-dark-600 shadow-md'}`}>
                                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-primary-400" />}
                                </div>
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 ${msg.role === 'user' ? 'bg-primary-600/10 border border-primary-500/20 rounded-tr-sm text-gray-200' : 'bg-dark-800 border border-dark-700 rounded-tl-sm shadow-xl text-gray-300'}`}>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                                        {msg.content}
                                    </div>
                                    {msg.role === 'ai' && (
                                        <div className="mt-4 pt-4 border-t border-dark-700/50 flex justify-end">
                                            <button 
                                                onClick={() => handleSaveInsight(msg.content, i)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${savedMsgId === i ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-dark-700 border border-dark-600 hover:bg-dark-600 text-gray-400 hover:text-white'}`}
                                            >
                                                {savedMsgId === i ? <><Check size={14} /> Saved</> : <><BookmarkPlus size={14} /> Save Insight</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                    {loading && (
                        <div className="flex gap-3 md:gap-4">
                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center shrink-0 shadow-md">
                                <Bot size={18} className="text-primary-400" />
                            </div>
                            <div className="bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-sm p-5 flex items-center gap-2 shadow-xl">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-dark-900 via-dark-900 to-transparent pt-10 absolute bottom-0 left-0 w-full z-10">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end bg-dark-800 rounded-2xl border border-dark-600 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-2xl shadow-black/50">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                            placeholder={`Message VeritasAI...`}
                            className="w-full bg-transparent text-white p-4 max-h-48 outline-none resize-none no-scrollbar text-sm md:text-base placeholder-gray-500"
                            rows={1}
                            style={{ minHeight: '60px' }}
                        />
                        <div className="p-2 md:p-3">
                            <button 
                                type="submit" 
                                disabled={!input.trim() || loading}
                                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white p-2 md:p-3 rounded-xl transition-all shadow-lg shadow-primary-500/20"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
