import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import AuthBackground from '../components/auth/AuthBackground';

const Profile = () => {
    const { user, updateUserProfile, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user) {
            setName(user.name);
            setAvatarUrl(user.avatar || '');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await updateUserProfile(name, avatarUrl || undefined);

            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword) {
                    throw new Error("Current password is required to change password");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error("New passwords do not match");
                }
                if (newPassword.length < 6) {
                    throw new Error("New password must be at least 6 characters");
                }

                await apiClient.updatePassword(currentPassword, newPassword, user?.email || "");

                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

                setSuccess('Profile and password updated successfully! Redirecting to login...');
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                setSuccess('Profile updated successfully!');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update profile';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image must be less than 5MB');
            return;
        }

        setError('');
        setUploadingImage(true);

        try {
            const publicUrl = await apiClient.uploadAvatar(file, user.id);
            setAvatarUrl(publicUrl); // Preview it instantly

            // Optionally auto-save the profile, but we'll let them click save
            setSuccess('Image uploaded! Click Save Changes to apply.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload image';
            setError(message);
        } finally {
            setUploadingImage(false);
        }
    };

    if (!user) return null;

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-[#0a0914] transition-colors duration-500">
            <AuthBackground />

            <div className="max-w-md w-full relative z-10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 mx-auto transition-all overflow-hidden flex flex-col justify-center">
                <div className="text-center">
                    <div className="flex justify-center mb-6 relative group">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-indigo-500 shadow-xl relative cursor-pointer overflow-hidden transition-transform hover:scale-105">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#131221] flex items-center justify-center">
                                {uploadingImage ? (
                                    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <img
                                            src={avatarUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || user.name)}`}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                            <span className="text-[9px] text-white font-bold uppercase mt-1">Upload</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                            />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Your Profile
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {user.email}
                    </p>
                </div>

                <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-1 block">
                                Display Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="block w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm backdrop-blur-sm shadow-sm"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-1 block">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                readOnly
                                className="block w-full px-5 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 focus:outline-none transition-all text-sm backdrop-blur-sm shadow-sm cursor-not-allowed"
                                value={user.email}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-white/10 mt-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Change Password (Optional)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-1 block">
                                        Current Password
                                    </label>
                                    <input
                                        id="currentPassword"
                                        type="password"
                                        className="block w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm backdrop-blur-sm shadow-sm"
                                        placeholder="Required if changing password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-1 block">
                                            New Password
                                        </label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            className="block w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm backdrop-blur-sm shadow-sm"
                                            placeholder="Min 6 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-1 block">
                                            Confirm Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            className="block w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm backdrop-blur-sm shadow-sm"
                                            placeholder="Match new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[11px] py-2 px-4 rounded-xl text-center font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 text-[11px] py-2 px-4 rounded-xl text-center font-bold">
                            {success}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || uploadingImage || (!name.trim())}
                            className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] ${loading || uploadingImage || !name.trim() ? 'opacity-70 cursor-not-allowed transform-none hover:shadow-lg' : ''
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                    <Link to="/" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white inline-flex items-center gap-2 transition-all uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;
