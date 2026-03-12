import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, parseNaturalLanguageIntent } from '../../services/aiService';
import { useAiContextStore } from '../../store/aiContextStore';
import { useAiKeyStore } from '../../store/aiKeyStore';
import { useAuth } from '../../context/AuthContext';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export const AiTutorPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Hi! I\'m DSA Buddy 👋 Ask me anything about this platform — supported algorithms, how to navigate, or any CS concept!' }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const { dataStructure, currentFrame, setIntent } = useAiContextStore();
    const { provider, apiKey, isConfigured, loadKey } = useAiKeyStore();
    const { user, isAuthenticated } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPlatformMode = !dataStructure;
    const prevDataStructureRef = useRef(dataStructure);

    // Set welcome message based on mode — only when dataStructure actually changes
    useEffect(() => {
        if (prevDataStructureRef.current === dataStructure) return;
        prevDataStructureRef.current = dataStructure;
        
        setMessages([{
            role: 'ai',
            content: isPlatformMode 
                ? 'Hi! I\'m DSA Buddy 👋 Ask me anything about this platform — supported algorithms, how to navigate, or any CS concept!'
                : `Hello! I am your AI Tutor for ${dataStructure}. Ask me any question about the current step, or give me a voice command!`
        }]);
    }, [dataStructure, isPlatformMode]);
    // Load AI key when user changes
    useEffect(() => {
        if (user?.id) {
            loadKey(user.id);
        }
    }, [user?.id, loadKey]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;
        
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsThinking(true);

        try {
            const aiResponse = await sendChatMessage(userMsg, currentFrame, dataStructure, provider, apiKey);
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse.response || 'Sorry, I encountered an error.' }]);
        } catch (error) {
            console.error('Failed to send AI chat message:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I ran into an error while sending that message.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleVoiceCommand = async (command: string) => {
        setMessages(prev => [...prev, { role: 'user', content: `🎤 ${command}` }]);
        setIsThinking(true);

        try {
            const aiResponse = await parseNaturalLanguageIntent(command, provider, apiKey);
            if (aiResponse.intent && aiResponse.intent.action !== 'unknown') {
                setIntent(aiResponse.intent);
                setMessages(prev => [...prev, { role: 'ai', content: `Executing command: ${aiResponse.intent.action}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: `I didn't understand that command.` }]);
            }
        } catch (error) {
            console.error('Failed to process voice command:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'An error occurred while processing your command.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser doesn't support speech recognition.");
            return;
        }

        if (isListening) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            handleVoiceCommand(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // --- Gated States ---

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 text-2xl group"
                title="AI Tutor"
            >
                <span className="material-symbols-outlined absolute opacity-100 group-hover:opacity-0 transition-opacity">smart_toy</span>
                <span className="material-symbols-outlined absolute opacity-0 group-hover:opacity-100 transition-opacity">chat</span>
            </button>
        );
    }

    // Render the gated content inside the open panel
    const renderBody = () => {
        if (!isAuthenticated) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#121121]">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">lock</span>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sign In Required</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to your account to use the AI Tutor and voice commands.</p>
                </div>
            );
        }

        if (!isConfigured) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#121121]">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">key</span>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">API Key Needed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Go to <strong>Profile → AI Settings</strong> to add your free Gemini, Groq, or OpenAI API key.</p>
                </div>
            );
        }

        return (
            <>
                {/* Chat Body */}
                <div className="flex-1 p-3 overflow-y-auto bg-gray-50 dark:bg-[#121121] custom-scrollbar flex flex-col gap-3">
                    {messages.map((msg, i) => (
                        <div key={i} className={`max-w-[85%] p-2.5 rounded-lg text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white self-end rounded-br-none' : 'bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] text-gray-800 dark:text-gray-200 self-start rounded-bl-none'}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isThinking && (
                        <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] w-16 p-2 rounded-lg rounded-bl-none self-start flex gap-1 justify-center items-center">
                            <div className="size-1.5 bg-primary rounded-full animate-bounce" />
                            <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="p-2 bg-white dark:bg-[#1c1a32] border-t border-gray-200 dark:border-[#272546] flex gap-2 items-center shrink-0">
                    <button 
                        onClick={toggleListen}
                        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#272546] dark:hover:bg-[#383564] text-gray-600 dark:text-gray-300'}`}
                        title={isListening ? "Listening..." : "Voice Command"}
                    >
                        <span className="material-symbols-outlined text-[16px]">mic</span>
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={isPlatformMode ? 'Ask about the platform...' : 'Ask AI or type command...'}
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="flex-shrink-0 text-primary hover:text-primary/80 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white dark:bg-[#1c1a32] shadow-2xl border border-gray-200 dark:border-[#272546] rounded-xl flex flex-col z-50 overflow-hidden transform transition-all">
            {/* Header */}
            <div className="h-12 bg-primary text-white flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 font-semibold">
                    <span className="material-symbols-outlined">{isPlatformMode ? 'smart_toy' : 'psychology'}</span>
                    {isPlatformMode ? 'DSA Buddy' : 'AI Tutor'}
                    {isConfigured && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold">{provider}</span>}
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>

            {renderBody()}
        </div>
    );
};
