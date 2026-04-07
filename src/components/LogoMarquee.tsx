import React from 'react';
import { motion } from 'framer-motion';

const LogoMarquee: React.FC = () => {
    // Company logos (using text for now, can be replaced with actual logo images)
    const companies = [
        { name: 'Goldman Sachs', abbr: 'GS' },
        { name: 'Morgan Stanley', abbr: 'MS' },
        { name: 'JP Morgan', abbr: 'JPM' },
        { name: 'BlackRock', abbr: 'BLK' },
        { name: 'Vanguard', abbr: 'VG' },
        { name: 'Fidelity', abbr: 'FID' },
        { name: 'Charles Schwab', abbr: 'CS' },
        { name: 'TD Ameritrade', abbr: 'TDA' },
    ];

    // Duplicate for seamless loop
    const duplicatedCompanies = [...companies, ...companies];

    return (
        <div className="relative w-full overflow-hidden py-8">
            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Scrolling Container */}
            <motion.div
                className="flex gap-16"
                animate={{
                    x: [0, -50 + '%'],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 30,
                        ease: "linear",
                    },
                }}
            >
                {duplicatedCompanies.map((company, index) => (
                    <div
                        key={`${company.name}-${index}`}
                        className="group flex-shrink-0 flex items-center justify-center px-8 py-4 rounded-2xl bg-gray-50/50 border border-gray-200/30 hover:border-gray-300 transition-all duration-300 cursor-pointer min-w-[180px]"
                    >
                        <div className="flex flex-col items-center gap-1 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300">
                            {/* Logo Placeholder - Using styled text */}
                            <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                {company.abbr}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                                {company.name}
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default LogoMarquee;
