
const Terms = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-20 w-full prose dark:prose-invert prose-slate">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Terms of Service</h1>
                <p className="text-sm text-gray-500 dark:text-[#9794c7] mb-12 font-mono">Last Updated: March 16, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        By accessing and using Data Structure Visualizer ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        The Platform is an open-source, educational tool designed to visualize data structures and algorithms. It is provided "as is" for learning purposes. We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice.
                    </p>
                </section>

                <section className="mb-12 bg-gray-50 dark:bg-[#1e1d32] p-8 rounded-3xl border border-gray-200 dark:border-[#272546]">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        When using the Platform, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                        <li><strong>API Key Management:</strong> You are solely responsible for the security and usage of any API keys you provide to enable AI features. We do not store or manage these keys for you.</li>
                        <li><strong>Lawful Use:</strong> Use the Platform only for lawful, educational, and personal purposes.</li>
                        <li><strong>No Abuse:</strong> Refrain from any activity that interferes with or disrupts the Platform's functionality.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Intellectual Property</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        The source code for this Platform is available on GitHub under the project's specific open-source license.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        All visual assets, descriptions, and educational content not otherwise licensed are the property of the project contributors and are protected by copyright laws. You may use the Platform for personal study and classroom demonstrations.
                    </p>
                </section>

                <section className="mb-12 border-l-4 border-red-500/30 pl-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Disclaimer of Warranties</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                        THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE." WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Limitation of Liability</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        TO THE FULLEST EXTENT PERMITTED BY LAW, THE PROJECT CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Changes to Terms</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We may update these terms from time to time. Your continued use of the Platform after such changes constitutes your acceptance of the new Terms of Service.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default Terms

