export const getUrgencyLevel = (urgency) => {
    if (urgency === 'High') return 3;
    if (urgency === 'Medium') return 2;
    return 1;
};

export const calculateReferralScore = ({ travelTime, availableCapacity, totalCapacity, loadFactor, urgency }) => {
    const urgencyLevel = getUrgencyLevel(urgency);
    const timeScore = Math.max(0, 100 - (travelTime * 1.5));
    const capacityScore = totalCapacity > 0
        ? Math.round((availableCapacity / totalCapacity) * 100)
        : 0;
    const loadScore = Math.max(0, 100 - Math.round(loadFactor * 100));

    const coreScore =    
        (timeScore * 0.30) +
        (capacityScore * 0.25) +
        (loadScore * 0.10);

    const urgencyBonus = urgencyLevel === 3 ? 25 : urgencyLevel === 2 ? 15 : 5;
    const finalScore = coreScore + urgencyBonus;

    return Math.max(0, Math.min(100, Math.round(finalScore)));
};
