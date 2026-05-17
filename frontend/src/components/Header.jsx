import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import mylogo from '../assets/logo.png';

function Header() {
    const [dark, setDark] = useState(() => {
        try {
            const stored = localStorage.getItem('theme');
            if (stored) return stored === 'dark';
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (e) { return false; }
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    return (
        <header className="sticky top-0 z-50 bg-green/80 dark:bg-slate-900/60 backdrop-blur-md border-[transparent] dark:border-slate-700 h-14 sm:h-16 flex items-center px-4 sm:px-6">
            <div className="max-w-md mx-auto w-full flex items-center gap-2 justify-between">
                <img src={mylogo} alt="Logo" className='h-10 sm:h-12 w-auto text-white px-0 py-0 rounded'/>
                <button
                    onClick={() => setDark(d => !d)}
                    className="ml-auto p-2 rounded-full bg-white/80 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-600 transition-colors"
                    aria-label="Toggle theme"
                >
                    {dark ? <Sun className="w-5 h-5 text-yellow-300"/> : <Moon className="w-5 h-5 text-slate-700"/>}
                </button>
            </div>
        </header>
    )
};

export default Header;