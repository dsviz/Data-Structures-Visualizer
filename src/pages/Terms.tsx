
const Terms = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-20 w-full prose dark:prose-invert">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Usage Agreement</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    By using Data Structure Visualizer, you agree to these terms. This project is provided "as is" for educational purposes.
                </p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. User Conduct</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You agree not to misuse the platform. This is an open-source project intended for learning and contribution.
                </p>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Copyright</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    The content and visualizations are protected by copyright. Code is available under standard open source licenses where applicable.
                </p>
            </div>
        </div>
    )
}

export default Terms

