
import { Link } from 'react-router-dom'

const About = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-20 w-full prose dark:prose-invert prose-slate">
                <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Visualize. Understand. Master.</h1>
                
                <p className="text-xl text-gray-600 dark:text-[#9794c7] leading-relaxed mb-12">
                    Data Structure Visualizer is more than just a tool—it's a mission to make computer science intuitive, accessible, and engaging for everyone, from students to seasoning engineers.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-16 not-prose">
                    <div className="p-8 rounded-3xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Our Mission</h3>
                        <p className="text-gray-500 dark:text-[#9794c7] leading-relaxed">
                            To break down complex algorithmic barriers through high-fidelity, interactive visualizations that reveal the "magic" behind the code.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-emerald-500 text-3xl">auto_awesome</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">The Vision</h3>
                        <p className="text-gray-500 dark:text-[#9794c7] leading-relaxed">
                            Building the world's most comprehensive, open-source repository of visualized CS concepts, powered by a community of passionate learners.
                        </p>
                    </div>
                </div>

                <section className="mb-16">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Key Features</h2>
                    <ul className="grid sm:grid-cols-2 gap-4 list-none pl-0 not-prose">
                        {[
                            { title: 'Step-by-Step Execution', desc: 'Pause, rewind, and re-watch every operation at your own pace.', icon: 'slow_motion_video' },
                            { title: 'Multi-Language Solutions', desc: 'Toggle between Python, Java, C++, and more for every problem.', icon: 'translate' },
                            { title: 'AI-Powered Tutoring', desc: 'Ask complex questions and get instant, context-aware explanations.', icon: 'psychology' },
                            { title: '3,700+ LeetCode Exercises', desc: 'A massive catalog of problems with integrated solutions and visualizers.', icon: 'library_books' }
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                                <span className="material-symbols-outlined text-primary shrink-0">{item.icon}</span>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-[#9794c7] leading-relaxed">{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="bg-primary/5 rounded-3xl p-10 border border-primary/10 text-center not-prose">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Open Source & Free</h2>
                    <p className="text-gray-600 dark:text-[#9794c7] max-w-2xl mx-auto mb-8">
                        This project is built for students, by students. It is 100% open source and will always remain free for anyone to use and contribute to.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="https://github.com/dsviz/Data-Structures-Visualizer" target="_blank" rel="noreferrer" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                            <span className="material-symbols-outlined">code</span>
                            View Source
                        </a>
                        <Link to="/" className="bg-white dark:bg-[#1e1d32] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                            Start Learning
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default About
