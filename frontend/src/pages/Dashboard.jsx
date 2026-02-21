import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getReferrals } from '../api/referrals';
import { getRoutingMetrics } from '../api/metrics';
import { Activity, Clock, CheckCircle2, AlertCircle, ArrowRight, PlusCircle, Building2, MapPin, Network, GitGraph, Zap, Cpu } from 'lucide-react';

const getPriorityColor = (priorityLevel) => {
    if (priorityLevel === "HIGH") return "text-red-600 font-bold";
    if (priorityLevel === "MEDIUM") return "text-orange-500 font-bold";
    return "text-green-600 font-bold";
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        avgTravel: 0
    });
    const [recentReferrals, setRecentReferrals] = useState([]);
    const [routingMetrics, setRoutingMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [data, metricsData] = await Promise.all([
                    getReferrals(),
                    getRoutingMetrics().catch(() => null)
                ]);

                // Calculate Mock Stats based on fetched data
                const pendingCount = data.filter(r => r.status === 'Pending').length;
                const acceptedCount = data.filter(r => r.status === 'Accepted').length;

                const totalMins = data.reduce((acc, curr) => {
                    const t = curr.travelTime;
                    if (typeof t === 'number' && !isNaN(t)) return acc + t;
                    // fall back to parsing string form if present
                    const match = String(curr.estimatedTravelTime ?? '').match(/(\d+)/);
                    if (match) return acc + parseInt(match[1]);
                    return acc;
                }, 0);

                const avgMins = data.length > 0 ? Math.round(totalMins / data.length) : 0;

                setStats({
                    total: data.length,
                    pending: pendingCount,
                    accepted: acceptedCount,
                    avgTravel: avgMins
                });

                // Top 3 most recent
                setRecentReferrals(data.slice(0, 3));
                setRoutingMetrics(metricsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, highlight }) => (
        <Card className={`relative overflow-hidden group ${highlight ? 'bg-brand-900 border-brand-800' : 'bg-white'}`}>
            {highlight && (
                <div className="absolute top-0 right-0 p-8 w-48 h-48 bg-brand-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-20 z-0 pointer-events-none"></div>
            )}
            <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex justify-between items-start">
                    <p className={`text-sm font-semibold tracking-wide uppercase ${highlight ? 'text-brand-300' : 'text-surface-500'}`}>{title}</p>
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${highlight ? 'bg-brand-800 text-brand-100' : colorClass}`}>
                        <Icon strokeWidth={2.5} className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h3 className={`text-4xl font-bold tracking-tight font-display mt-4 ${highlight ? 'text-white' : 'text-surface-900'}`}>
                        {value}
                        {subtitle && <span className={`text-sm font-medium ml-1.5 ${highlight ? 'text-brand-300' : 'text-surface-500'}`}>{subtitle}</span>}
                    </h3>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-surface-900 font-display tracking-tight">Operations Console</h1>
                    <p className="text-surface-500 mt-1 font-medium text-sm">Real-time status of your clinic's patient routes.</p>
                </div>
                <Button onClick={() => navigate('/create-referral')} size="lg" className="rounded-xl shadow-clinical w-full sm:w-auto">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Initiate Transfer
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-40 rounded-2xl bg-surface-200 animate-pulse border border-surface-200" />
                    ))
                ) : (
                    <>
                        <MetricCard
                            title="Active Cases"
                            value={stats.total}
                            icon={Activity}
                            highlight={true}
                        />
                        <MetricCard
                            title="Pending Review"
                            value={stats.pending}
                            icon={AlertCircle}
                            colorClass="bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100"
                        />
                        <MetricCard
                            title="Admitted"
                            value={stats.accepted}
                            icon={CheckCircle2}
                            colorClass="bg-green-50 text-green-600 ring-1 ring-inset ring-green-100"
                        />
                        <MetricCard
                            title="Avg Transit"
                            value={stats.avgTravel}
                            subtitle="mins"
                            icon={Clock}
                            colorClass="bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100"
                        />
                    </>
                )}
            </div>

            {/* Bottom Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start">

                {/* Recent Referrals List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-surface-900 font-display">Active Transfers</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/referrals')} className="text-brand-600 font-semibold gap-1">
                            View registry <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-6 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 rounded-xl bg-surface-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : recentReferrals.length > 0 ? (
                                <div className="divide-y divide-surface-100/80">
                                    {recentReferrals.map((referral, index) => {
                                        const scoreVal = referral.score;
                                        const scoreDisplay = scoreVal != null && !isNaN(Number(scoreVal))
                                            ? (Number(scoreVal) === Math.round(scoreVal) ? Math.round(scoreVal) : Number(scoreVal).toFixed(1))
                                            : 'N/A';
                                        const travelDisplay = referral.travelTime != null
                                            ? `${referral.travelTime} mins`
                                            : (referral.estimatedTravelTime || '—');
                                        return (
                                            <div key={referral.id ?? index} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-surface-50/50 transition-colors gap-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Severity Score Indicator */}
                                                    <div className="w-12 h-12 rounded-full border-[3px] border-surface-200 flex items-center justify-center font-bold text-xs text-surface-700 font-display shadow-sm bg-white shrink-0 min-w-[3rem]">
                                                        {scoreDisplay}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-surface-900 text-base flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-surface-400 shrink-0" />
                                                            {referral.assignedHospital || 'Regional Medical Center'}
                                                        </h4>
                                                        <div className="flex items-center text-sm text-surface-500 mt-1 font-medium">
                                                            <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                                            {travelDisplay}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                                    {referral.priorityLevel && (
                                                        <span className={getPriorityColor(referral.priorityLevel)}>
                                                            {referral.priorityLevel}
                                                        </span>
                                                    )}
                                                    <Badge variant={referral.status === 'Accepted' ? 'success' : 'warning'} className="px-3 py-1">
                                                        {referral.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4 border border-surface-200/50 shadow-inner-light">
                                        <Activity className="w-8 h-8 text-surface-300" />
                                    </div>
                                    <h3 className="text-surface-900 font-bold mb-2 font-display text-lg">No active transfers</h3>
                                    <p className="text-surface-500 text-sm max-w-sm mx-auto font-medium">Your clinic has not initiated any patient transfers yet. Click "Initiate Transfer" to begin.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Panel / Fast Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-surface-900 font-display flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-brand-600" />
                        Routing Engine Metrics
                    </h2>
                    <Card className="bg-surface-900 text-white border-none shadow-clinical overflow-hidden rounded-2xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl z-0"></div>
                        <CardContent className="p-6 relative z-10 space-y-5">
                            {!routingMetrics ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-8 h-8 text-surface-500 mx-auto mb-3" />
                                    <p className="text-surface-400 font-medium text-sm">Metrics unavailable</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="text-surface-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Graph Nodes</div>
                                            <div className="text-2xl font-bold font-display">{routingMetrics.nodes}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="text-surface-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><GitGraph className="w-3.5 h-3.5" /> Graph Edges</div>
                                            <div className="text-2xl font-bold font-display">{routingMetrics.edges}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="text-surface-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Last Computation</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold font-display text-brand-300">{routingMetrics.lastComputationMs}</span>
                                            <span className="text-surface-400 text-sm font-semibold">ms</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                                        <span className="text-surface-400 font-medium">Dijkstra Executions Today</span>
                                        <span className="font-bold bg-brand-500/20 text-brand-200 px-2 py-0.5 rounded-md border border-brand-500/30">{routingMetrics.executionsToday}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
