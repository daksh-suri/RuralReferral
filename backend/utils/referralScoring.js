export const getUrgencyLevel = (urgency) => {
    if (urgency === 'High') return 3;
    if (urgency === 'Medium') return 2;
    return 1;
};

export const calculateReferralScore = ({ travelTime, availableCapacity, totalCapacity, specialtyMatchScore = 1 }) => {
    // scale travel time correctly so a 15 min trip is 'good' and 60 is 'bad'
    const normalizedTravelScore = Math.max(0, 100 - travelTime);

    const capacityRatio = totalCapacity > 0 ? (availableCapacity / totalCapacity) : 0;

    // Using user's weights logic, scaled to 100:
    // (Travel time ~ 50%, capacity ~ 30%, specialty ~ 20%)
    const rawScore = (normalizedTravelScore * 0.5) + ((capacityRatio * 100) * 0.3) + ((specialtyMatchScore * 100) * 0.2);

    return Math.max(0, Math.min(100, Math.round(rawScore)));
};
