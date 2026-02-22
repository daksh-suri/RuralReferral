import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Activity, Clock, CheckCircle2, XCircle, Users, ActivitySquare, AlertTriangle } from 'lucide-react';
import { fetchHospitalResources, updateHospitalResources, fetchHospitalReferrals, updateReferralStatus } from '../api/hospital';

const HospitalDashboard = () => {
    const [resources, setResources] = useState({ icuBeds: 0, beds: 0, oxygen: 0, ambulances: 0, lastUpdated: null });
    const [editResources, setEditResources] = useState({ icuBeds: 0, beds: 0, oxygen: 0, ambulances: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [referrals, setReferrals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            const resData = await fetchHospitalResources();
            if (resData) {
                setResources(resData);
                if (!isEditing) {
                    setEditResources({
                        icuBeds: resData.icuBeds || 0,
                        beds: resData.beds || 0,
                        oxygen: resData.oxygen || 0,
                        ambulances: resData.ambulances || 0
                    });
                }
            }
            const refData = await fetchHospitalReferrals();
            setReferrals(refData || []);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            loadData();
        }, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [isEditing]);

    const handleResourceChange = (e) => {
        setEditResources({ ...editResources, [e.target.name]: parseInt(e.target.value, 10) || 0 });
    };

    const handleSaveResources = async () => {
        setIsSaving(true);
        try {
            const updated = await updateHospitalResources(editResources);
            setResources(updated.resource);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update resources", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await updateReferralStatus(id, status);
            loadData(); // refresh immediately
        } catch (error) {
            console.error("Failed to update referral status", error);
        }
    };

    if (isLoading && referrals.length === 0) {
        return <div className="p-8 text-center text-surface-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-surface-900 font-display tracking-tight">Hospital Dashboard</h1>
                <p className="text-surface-500 mt-1 font-medium text-sm">Manage live capacity and incoming referrals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resources Panel */}
                <Card className="lg:col-span-1 border-none shadow-clinical rounded-2xl overflow-hidden self-start">
                    <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ActivitySquare className="w-5 h-5 text-indigo-600" />
                            <h2 className="font-bold text-surface-900">Live Resources</h2>
                        </div>
                        {resources.lastUpdated && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(resources.lastUpdated).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <CardContent className="p-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="icuBeds">ICU Beds</Label>
                                        <Input id="icuBeds" name="icuBeds" type="number" min="0" value={editResources.icuBeds} onChange={handleResourceChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="beds">General Beds</Label>
                                        <Input id="beds" name="beds" type="number" min="0" value={editResources.beds} onChange={handleResourceChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="oxygen">Oxygen Cylinders</Label>
                                        <Input id="oxygen" name="oxygen" type="number" min="0" value={editResources.oxygen} onChange={handleResourceChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="ambulances">Ambulances</Label>
                                        <Input id="ambulances" name="ambulances" type="number" min="0" value={editResources.ambulances} onChange={handleResourceChange} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveResources} isLoading={isSaving}>Save</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">ICU Beds</p>
                                        <p className="text-3xl font-bold font-display {(resources.icuBeds === 0) ? 'text-red-500' : 'text-surface-900'}">{resources.icuBeds}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">General Beds</p>
                                        <p className="text-3xl font-bold font-display {(resources.beds === 0) ? 'text-red-500' : 'text-surface-900'}">{resources.beds}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">Oxygen</p>
                                        <p className="text-3xl font-bold font-display {(resources.oxygen === 0) ? 'text-red-500' : 'text-surface-900'}">{resources.oxygen}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">Ambulances</p>
                                        <p className="text-3xl font-bold font-display {(resources.ambulances === 0) ? 'text-red-500' : 'text-surface-900'}">{resources.ambulances}</p>
                                    </div>
                                </div>
                                <Button className="w-full bg-surface-100 hover:bg-surface-200 text-surface-700" onClick={() => setIsEditing(true)}>
                                    Update Capacity
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Referrals Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-surface-900 font-display flex items-center gap-2">
                            <Users className="w-5 h-5 text-surface-500" /> Incoming Patients
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Updates
                        </div>
                    </div>

                    {referrals.length === 0 ? (
                        <div className="p-12 text-center bg-white border border-surface-200 border-dashed rounded-2xl text-surface-500">
                            No active referrals assigned to your facility.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {referrals.map((ref) => (
                                <Card key={ref._id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                                    <div className="p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
                                        <div className="flex-1 space-y-2 w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-surface-900">Patient • {ref.patientAge} yrs</span>
                                                    {ref.urgency === 'High' && <Badge variant="danger" className="animate-pulse">Critical</Badge>}
                                                    {ref.status === 'Pending' && <Badge variant="warning">Action Required</Badge>}
                                                    {ref.status === 'Accepted' && <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>}
                                                    {ref.status === 'Rejected' && <Badge variant="outline" className="text-surface-500 border-surface-200">Rejected</Badge>}
                                                </div>
                                                <span className="text-xs font-medium text-surface-400 hidden md:block">
                                                    {new Date(ref.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-surface-600 font-medium">{ref.symptoms}</p>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-surface-500 pt-1">
                                                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {ref.vitals}</span>
                                            </div>
                                        </div>

                                        {ref.status === 'Pending' && (
                                            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end md:justify-start">
                                                <Button variant="outline" size="sm" onClick={() => handleAction(ref._id, 'Rejected')} className="text-red-600 border-red-200 hover:bg-red-50">
                                                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                                </Button>
                                                <Button size="sm" onClick={() => handleAction(ref._id, 'Accepted')} className="bg-brand-600 hover:bg-brand-700 text-white">
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalDashboard;
