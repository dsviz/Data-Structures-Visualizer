import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../components/auth/AuthBackground';

const VerifyOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const { verifyOtp, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await verifyOtp(email, code);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check your code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-[#0a0914] transition-colors duration-500">
            <AuthBackground />

            <div className="max-w-md w-full relative z-10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 mx-auto transition-all">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-primary to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
                            <span className="material-symbols-outlined text-white text-3xl">mark_email_read</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Verify Identity
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Enter the 6-digit code sent to <br />
                        <span className="font-bold text-primary">{email}</span>
                    </p>
                </div>

                <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-1.5 sm:gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-10 h-14 sm:w-11 sm:h-16 text-center text-2xl font-black rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all backdrop-blur-sm shadow-sm"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] py-2 px-4 rounded-xl text-center font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className={`w-full py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] ${loading || otp.join('').length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Verifying...' : 'Finish Signup'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all uppercase tracking-widest"
                            >
                                Use a different email
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
