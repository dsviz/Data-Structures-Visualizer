
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-20 w-full prose dark:prose-invert">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Your privacy is important to us. This transparency statement explains what we don't collect.
                </p>

                <div className="bg-white dark:bg-[#1e1d32] p-6 rounded-2xl border border-gray-200 dark:border-[#272546] mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Data Collection</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        We do not collect any personal data, usage metrics, or cookies. All settings (like your theme preference) are stored locally on your device using LocalStorage.
                    </p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">External Links</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    This site contains links to external sites (like GitHub). We are not responsible for the privacy practices of other sites.
                </p>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        For AI Tutor, voice commands, and AI narration privacy details, see
                        {' '}
                        <Link to="/ai-data-privacy" className="text-primary font-semibold hover:underline">AI Data and Privacy</Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Privacy

