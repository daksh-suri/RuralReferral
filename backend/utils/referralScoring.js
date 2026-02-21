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
    const urgencyScore = urgencyLevel === 3 ? 100 : urgencyLevel === 2 ? 70 : 40;

    const rawScore =
        (timeScore * 0.4) +
        (capacityScore * 0.35) +
        (loadScore * 0.15) +
        (urgencyScore * 0.1);

    return Math.max(0, Math.min(100, Math.round(rawScore)));
};
