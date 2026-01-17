
interface TeamMember {
    name: string;
    role: string;
    image: string;
    github: string;
    linkedin?: string;
    website?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        name: "Shubham Kumar Sharma",
        role: "Developer",
        image: "https://github.com/shubhamkumarsharma03.png",
        github: "https://github.com/shubhamkumarsharma03",
        linkedin: "https://www.linkedin.com/in/shubhamkumarsharma03",
        website: "https://shubhamksharma.me"
    },
    {
        name: "Kisna Sharma",
        role: "Developer",
        image: "https://github.com/Kisnasharma.png",
        github: "https://github.com/Kisnasharma"
    },
    {
        name: "Piyush Saini",
        role: "Developer",
        image: "https://github.com/Piyush851.png",
        github: "https://github.com/Piyush851",
        linkedin: "https://www.linkedin.com/in/piyush-saini-0527ps"
    }
];

const Team = () => {
    return (
        <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-20 w-full">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">The Team</h1>
                <p className="text-xl text-gray-500 dark:text-[#9794c7] mb-12">Made for students, by students.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TEAM_MEMBERS.map((member, index) => (
                        <div key={index} className="bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                            <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
                            <div className="px-6 pb-6 -mt-12 relative">
                                <div className="size-24 rounded-full border-4 border-white dark:border-[#1e1d32] bg-white dark:bg-[#131221] overflow-hidden mb-4">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                                <p className="text-primary text-sm font-medium mb-4">{member.role}</p>
                                <div className="flex gap-4">
                                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        GitHub
                                    </a>
                                    {member.linkedin && (
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            LinkedIn
                                        </a>
                                    )}
                                    {member.website && (
                                        <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Team
