import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const [interimTranscript, setInterimTranscript] = useState('');
    const [voiceStatus, setVoiceStatus] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    
    const { dataStructure, currentFrame, setIntent } = useAiContextStore();
    const { provider, apiKey, isConfigured, loadKey } = useAiKeyStore();
    const { user, isAuthenticated } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

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

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthesisRef.current = window.speechSynthesis;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onstart = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onend = null;
                try {
                    recognitionRef.current.stop();
                } catch {
                    // no-op
                }
                recognitionRef.current = null;
            }
            speechSynthesisRef.current?.cancel();
        };
    }, []);

    const speakText = (text: string) => {
        if (!speechSynthesisRef.current || !text.trim()) return;

        try {
            speechSynthesisRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            speechSynthesisRef.current.speak(utterance);
        } catch {
            setIsSpeaking(false);
        }
    };

    const stopSpeech = () => {
        speechSynthesisRef.current?.cancel();
        setIsSpeaking(false);
    };

    const appendAiMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'ai', content }]);
        if (autoSpeak) {
            speakText(content);
        }
    };

    const handleVoiceInput = async (command: string) => {
        const cleanCommand = command.trim();
        if (!cleanCommand) return;

        setMessages(prev => [...prev, { role: 'user', content: `🎤 ${cleanCommand}` }]);
        setIsThinking(true);

        try {
            if (isPlatformMode) {
                const aiResponse = await sendChatMessage(cleanCommand, currentFrame, dataStructure, provider, apiKey);
                appendAiMessage(aiResponse.response || 'Sorry, I encountered an error.');
                return;
            }

            const aiResponse = await parseNaturalLanguageIntent(cleanCommand, provider, apiKey);
            if (aiResponse.intent && aiResponse.intent.action !== 'unknown') {
                setIntent(aiResponse.intent);
                appendAiMessage(`Executing command: ${aiResponse.intent.action}`);
            } else {
                const fallback = await sendChatMessage(cleanCommand, currentFrame, dataStructure, provider, apiKey);
                appendAiMessage(fallback.response || `I didn't understand that command.`);
            }
        } catch (error) {
            console.error('Failed to process voice input:', error);
            appendAiMessage('An error occurred while processing your voice input.');
        } finally {
            setIsThinking(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;
        
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsThinking(true);

        try {
            const aiResponse = await sendChatMessage(userMsg, currentFrame, dataStructure, provider, apiKey);
            appendAiMessage(aiResponse.response || 'Sorry, I encountered an error.');
        } catch (error) {
            console.error('Failed to send AI chat message:', error);
            appendAiMessage('Sorry, I ran into an error while sending that message.');
        } finally {
            setIsThinking(false);
        }
    };

    const toggleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setVoiceStatus("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening && recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // no-op
            }
            setVoiceStatus('Listening stopped.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceStatus('Listening... speak now');
            setInterimTranscript('');
        };
        
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const chunk = event.results[i][0]?.transcript || '';
                if (event.results[i].isFinal) {
                    finalTranscript += chunk;
                } else {
                    interim += chunk;
                }
            }

            setInterimTranscript(interim.trim());

            if (finalTranscript.trim()) {
                setVoiceStatus('Voice captured. Processing...');
                setInterimTranscript('');
                setInput(finalTranscript.trim());
                void handleVoiceInput(finalTranscript.trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            const errorMap: Record<string, string> = {
                'not-allowed': 'Microphone access denied. Please allow mic permission.',
                'audio-capture': 'No microphone found. Please check your mic device.',
                'network': 'Network issue while capturing speech.',
                'no-speech': 'No speech detected. Try speaking a little louder.',
                'aborted': 'Listening was interrupted.'
            };
            setVoiceStatus(errorMap[event.error] || 'Voice recognition failed. Please try again.');
            setIsListening(false);
            setInterimTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            if (!voiceStatus || voiceStatus === 'Listening... speak now') {
                setVoiceStatus('Tap mic to speak again.');
            }
        };

        try {
            recognition.start();
        } catch {
            setVoiceStatus('Unable to start microphone. Please retry.');
            setIsListening(false);
        }
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
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300">Gemini</a>
                        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300">Groq</a>
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">OpenAI</a>
                    </div>
                    <Link to="/ai-data-privacy" className="mt-2 text-[10px] text-primary font-semibold hover:underline">
                        AI Data and Privacy
                    </Link>
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
                <div className="p-2 bg-white dark:bg-[#1c1a32] border-t border-gray-200 dark:border-[#272546] flex flex-col gap-1 shrink-0">
                    {(voiceStatus || interimTranscript) && (
                        <div className="px-1 text-[10px] text-gray-500 dark:text-gray-400 truncate" title={interimTranscript || voiceStatus}>
                            {interimTranscript ? `Listening: ${interimTranscript}` : voiceStatus}
                        </div>
                    )}
                    <div className="flex gap-2 items-center">
                    <button 
                        onClick={toggleListen}
                        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#272546] dark:hover:bg-[#383564] text-gray-600 dark:text-gray-300'}`}
                        title={isListening ? "Listening..." : "Voice Command"}
                    >
                        <span className="material-symbols-outlined text-[16px]">mic</span>
                    </button>
                    <button
                        onClick={() => {
                            if (isSpeaking) {
                                stopSpeech();
                            } else {
                                const lastAiMessage = [...messages].reverse().find(m => m.role === 'ai');
                                if (lastAiMessage) {
                                    speakText(lastAiMessage.content);
                                }
                            }
                        }}
                        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-colors ${isSpeaking ? 'bg-primary/20 text-primary' : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#272546] dark:hover:bg-[#383564] text-gray-600 dark:text-gray-300'}`}
                        title={isSpeaking ? 'Stop speaking' : 'Read last AI message'}
                    >
                        <span className="material-symbols-outlined text-[16px]">volume_up</span>
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
                    <button
                        onClick={() => setAutoSpeak(prev => !prev)}
                        className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${autoSpeak ? 'border-primary/40 text-primary bg-primary/10' : 'border-gray-200 dark:border-[#383564] text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'}`}
                        title="Auto-read AI responses"
                    >
                        {autoSpeak ? 'Auto Voice: On' : 'Auto Voice: Off'}
                    </button>
                    </div>
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
