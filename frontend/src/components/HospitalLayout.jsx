import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

const HospitalLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('hospitalToken');
        localStorage.removeItem('hospitalUser');
        navigate('/hospital/login');
    };

    const navItems = [
        { path: '/hospital/dashboard', label: 'Hospital Dashboard', icon: LayoutDashboard },
    ];

    const user = JSON.parse(localStorage.getItem('hospitalUser') || '{}');

    return (
        <div className="flex h-screen bg-surface-50 font-sans selection:bg-brand-100 selection:text-brand-900">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-100/50 border-r border-surface-200 hidden md:flex flex-col relative z-10 backdrop-blur-md">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-soft shadow-inner-light">
                        <Building2 className="w-5 h-5 text-indigo-50" />
                    </div>
                    <h1 className="text-xl font-bold text-surface-900 tracking-tight font-display">
                        Referral Opt
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-2">
                    <p className="px-4 text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-4">Facility Controls</p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-white text-indigo-700 shadow-sm border border-surface-200/50"
                                        : "text-surface-600 hover:bg-surface-200/50 hover:text-surface-900"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
                                )}
                                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-indigo-600" : "text-surface-400 group-hover:text-surface-600")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6">
                    <div className="bg-white rounded-xl p-4 border border-surface-200/60 shadow-sm mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">H</div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-surface-900 truncate">{user.name || 'Hospital'}</p>
                                <p className="text-xs text-surface-500 font-medium truncate">Facility Admin</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-surface-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-semibold"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 z-50 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-surface-900 font-display">Referral Opt ({user.name})</span>
                </div>
                <button onClick={handleLogout} className="text-surface-500 p-2 rounded-md hover:bg-surface-100">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full pt-16 md:pt-0 bg-surface-50">
                <div className="flex-1 overflow-y-auto w-full hide-scrollbar">
                    <div className="p-4 md:p-10 lg:p-12 w-full max-w-[1400px] mx-auto min-h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HospitalLayout;
