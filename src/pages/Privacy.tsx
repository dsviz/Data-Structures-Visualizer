
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
            </div>
        </div>
    )
}

export default Privacy

