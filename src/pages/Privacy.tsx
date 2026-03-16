
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-20 w-full prose dark:prose-invert prose-slate">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Privacy Policy</h1>
                <p className="text-sm text-gray-500 dark:text-[#9794c7] mb-12 font-mono">Last Updated: March 16, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Data Structure Visualizer ("we," "us," or "the Platform") is an educational tool designed to help students and developers master computer science concepts. We are committed to transparency regarding any data processing that occurs while you use our site.
                    </p>
                </section>

                <section className="mb-12 bg-gray-50 dark:bg-[#1e1d32] p-8 rounded-3xl border border-gray-200 dark:border-[#272546]">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Zero Data Collection Policy</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        We take a "privacy by design" approach. Our platform is built specifically to operate without any server-side tracking:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                        <li><strong>No Accounts:</strong> You are not required to create an account to use the visualizers.</li>
                        <li><strong>No Tracking:</strong> We do not use Google Analytics, Hotjar, or any other tracking scripts.</li>
                        <li><strong>No Cookies:</strong> We do not use traditional HTTP cookies for tracking purposes.</li>
                        <li><strong>No Personal Data:</strong> We do not collect names, email addresses, or IP addresses.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Local Storage</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        To provide a seamless experience, we use your browser's <code className="text-primary bg-primary/10 px-1 rounded">LocalStorage</code> to save your preferences. This data never leaves your device:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Theme preference (Light/Dark mode)</li>
                        <li>AI Tutor configuration (API Key names - keys themselves are discussed below)</li>
                        <li>Course progress or quiz scores</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. AI Features & API Keys</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        Our AI Tutor and narration features use third-party providers (Google Gemini, Groq, or OpenAI).
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-6">
                        <h4 className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-2">
                            <span className="material-symbols-outlined">security</span>
                            API Key Safety
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            When you provide an API Key, it is stored <strong>exclusively in your browser's local state</strong>. It is never sent to our servers. It is only sent directly to the AI provider (e.g., Google or OpenAI) to fulfill your requests.
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        For specific AI data handling details, please visit our 
                        <Link to="/ai-data-privacy" className="text-primary font-semibold hover:underline mx-1">AI Data and Privacy Page</Link>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Third-Party Services</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        We link to external services for additional resources:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                        <li><strong>GitHub:</strong> Hosting the repository and issue tracker.</li>
                        <li><strong>Google Fonts / Material Symbols:</strong> For UI typography and icons.</li>
                        <li><strong>External Problem Links:</strong> Links to LeetCode or other documentation.</li>
                    </ul>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        These services have their own privacy policies. We encourage you to review them when leaving our site.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        As an open-source project, you can reach out through our 
                        <a href="https://github.com/dsviz/Data-Structures-Visualizer" target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline mx-1">GitHub repository</a> 
                        by opening an issue for any privacy concerns.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default Privacy

