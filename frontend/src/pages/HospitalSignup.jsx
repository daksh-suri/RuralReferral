import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { Building2 } from 'lucide-react';
import { hospitalSignup } from '../api/hospital';

const HospitalSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        locationNode: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (formData.name && formData.email && formData.password.length >= 6) {
                await hospitalSignup(formData);
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/hospital/login');
                }, 2000);
            } else {
                setError('Please fill all fields and ensure password is >= 6 chars');
            }
            setIsLoading(false);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMsg);
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
                            Referral Opt
                        </h1>
                    </div>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-white py-16 overflow-y-auto hide-scrollbar">
                <div className="w-full max-w-[440px]">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-surface-900 font-display tracking-tight">Register Facility</h2>
                        <p className="mt-3 text-surface-500 text-base font-medium">
                            Join the Referral Opt network to seamlessly receive critical patients.
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="p-8 text-center bg-indigo-50 border border-indigo-200 rounded-2xl">
                            <h3 className="text-xl font-bold text-indigo-900 font-display">Registration Approved</h3>
                            <p className="text-indigo-700 mt-2 font-medium">Redirecting to secure login facility...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium flex items-start gap-3 shadow-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <Label htmlFor="name">Hospital Name</Label>
                                    <Input
                                        id="name" name="name" type="text"
                                        placeholder="City General Hospital"
                                        value={formData.name} onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email" name="email" type="email"
                                        placeholder="admin@hospital.com"
                                        value={formData.email} onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="locationNode">Routing Region</Label>
                                    <select
                                        id="locationNode" name="locationNode"
                                        className="flex h-12 w-full items-center justify-between rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                        value={formData.locationNode} onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Location</option>
                                        <option value="City Center">City Center</option>
                                        <option value="North District">North District</option>
                                        <option value="East District">East District</option>
                                        <option value="West District">West District</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="password">Access Phrase</Label>
                                    <Input
                                        id="password" name="password" type="password"
                                        placeholder="••••••••"
                                        value={formData.password} onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full text-base py-6 bg-indigo-600 hover:bg-indigo-700 text-white border-none" isLoading={isLoading}>
                                Submit Application
                            </Button>
                        </form>
                    )}

                    {!isSuccess && (
                        <div className="mt-10 text-center text-sm">
                            <span className="text-surface-500">Already registered? </span>
                            <Link to="/hospital/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalSignup;
