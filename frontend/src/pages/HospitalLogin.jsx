import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { Building2, ShieldCheck, Activity } from 'lucide-react';
import { hospitalLogin } from '../api/hospital';

const HospitalLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await hospitalLogin({ email, password });
            if (data && data.token) {
                navigate('/hospital/dashboard');
            } else {
                setError('Invalid credentials');
            }
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex selection:bg-indigo-100 selection:text-indigo-900 bg-surface-50">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 p-12 h-full flex flex-col pt-16">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-soft">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight font-display">
                            Referral Opt - Hospital
                        </h1>
                    </div>

                    <div className="mt-auto pb-12">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight font-display">
                            Facility Management <br />
                            Portal.
                        </h2>
                        <p className="text-lg text-indigo-100 max-w-md font-medium leading-relaxed">
                            Manage live resource capacity and securely receive instant patient referrals.
                        </p>

                        <div className="mt-12 flex gap-6 text-indigo-200 text-sm font-semibold tracking-wide">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Live Resource Sync
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Secure Dispatch
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-white">
                <div className="w-full max-w-[420px]">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-surface-900 font-display tracking-tight">Facility Access</h2>
                        <p className="mt-3 text-surface-500 text-base font-medium">
                            Please enter your hospital credentials to access the network.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium flex items-start gap-3 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <Label htmlFor="email">Work Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@hospital.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Secure Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full text-base py-6 bg-indigo-600 hover:bg-indigo-700 text-white" isLoading={isLoading}>
                            Sign in to network
                        </Button>
                    </form>

                    <div className="mt-10 text-center text-sm">
                        <span className="text-surface-500">Don't have an account? </span>
                        <Link to="/hospital/signup" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Request access
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalLogin;
