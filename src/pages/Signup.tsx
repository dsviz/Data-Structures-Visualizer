
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../components/auth/AuthBackground';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await signup(name, email, password);
            if (response && response.verifyNeeded) {
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create account';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-[#0a0914] px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-500">
            <AuthBackground />
            <div className="relative z-10 max-w-md w-full space-y-8 bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 mx-4 transition-all">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative group w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-indigo-500 rounded-2xl transform rotate-3 group-hover:rotate-12 shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"></div>
                            <span className="material-symbols-outlined text-white text-4xl relative z-10" aria-label="Lab Icon">science</span>
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Join the Lab
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Begin your journey, or{' '}
                        <Link to="/login" className="font-bold text-primary hover:text-indigo-400 transition-colors underline decoration-primary/30 underline-offset-4">
                            sign in instead
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="relative">
                            <label htmlFor="name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all backdrop-blur-sm shadow-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all backdrop-blur-sm shadow-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all backdrop-blur-sm shadow-sm pr-10"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] ${loading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Create Account' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
