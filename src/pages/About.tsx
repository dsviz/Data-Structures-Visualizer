
import { Link } from 'react-router-dom'

const About = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-20 w-full">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        Data Structure Visualizer is an educational project designed to help students master computer science concepts through interactive visualization.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8 my-12">
                        <div className="bg-white dark:bg-[#1e1d32] p-6 rounded-2xl border border-gray-200 dark:border-[#272546]">
                            <h3 className="text-xl font-bold text-primary mb-3">Our Mission</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                To simplify complex algorithms and data structures, making them accessible and intuitive for learners of all levels.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#1e1d32] p-6 rounded-2xl border border-gray-200 dark:border-[#272546]">
                            <h3 className="text-xl font-bold text-primary mb-3">Technology</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Built with modern web technologies including React, TypeScript, and Tailwind CSS for high performance and responsiveness.
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        Start exploring our <Link to="/" className="text-primary hover:underline">interactive modules</Link> to see algorithms in action.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About
