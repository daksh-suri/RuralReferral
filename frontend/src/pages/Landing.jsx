import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Building2, UserCircle } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hospitalToken = localStorage.getItem('hospitalToken');
        if (hospitalToken) {
            navigate('/hospital/dashboard');
            return;
        }

        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 selection:bg-brand-100 selection:text-brand-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <div className="mb-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold shadow-lg mb-6 shadow-brand-500/30">
                        <HeartPulse className="w-8 h-8 text-brand-50" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-surface-900 font-display tracking-tight mb-4">
                        Welcome to Referral Opt
                    </h1>
                    <p className="text-lg text-surface-500 max-w-2xl font-medium">
                        Intelligent care routing connecting rural health workers with dynamic hospital capacities. Please select your operational module.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                    {/* Doctor / Health Worker Path */}
                    <Link to="/login" className="group rounded-3xl bg-white border border-surface-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-brand-300 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-6 border border-brand-100 group-hover:scale-110 transition-transform duration-500 relative z-10">
                            <UserCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-surface-900 font-display mb-3 relative z-10">Primary Care Provider</h2>
                        <p className="text-surface-500 font-medium text-sm leading-relaxed mb-6 relative z-10">
                            Health workers and rural doctors initiating intelligent patient transfers based on live metrics.
                        </p>
                        <div className="mt-auto px-6 py-2.5 bg-brand-600 text-white rounded-full text-sm font-semibold w-full group-hover:bg-brand-700 transition-colors relative z-10">
                            Enter Portal
                        </div>
                    </Link>

                    {/* Hospital Path */}
                    <Link to="/hospital/login" className="group rounded-3xl bg-white border border-surface-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-indigo-300 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-100 group-hover:scale-110 transition-transform duration-500 relative z-10">
                            <Building2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-surface-900 font-display mb-3 relative z-10">Hospital Facility</h2>
                        <p className="text-surface-500 font-medium text-sm leading-relaxed mb-6 relative z-10">
                            Facility administrators managing live capacity and receiving dynamic patient inbound requests.
                        </p>
                        <div className="mt-auto px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold w-full group-hover:bg-indigo-700 transition-colors relative z-10">
                            Manage Facility
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
