export const hospitals = [
    { id: '1', name: 'City General Hospital', location: 'City Center', availableCapacity: 10, totalCapacity: 50, capacityRatio: 0.2, loadFactor: 0.8 },
    { id: '2', name: 'Rural Care Center', location: 'North District', availableCapacity: 0, totalCapacity: 20, capacityRatio: 0, loadFactor: 1.0 },
    { id: '3', name: 'Eastern Specialist', location: 'East District', availableCapacity: 25, totalCapacity: 100, capacityRatio: 0.25, loadFactor: 0.75 },
    { id: '4', name: 'Westside Clinic', location: 'West District', availableCapacity: 5, totalCapacity: 15, capacityRatio: 0.33, loadFactor: 0.67 }
];

export const graph = {
    'Village A': { 'City Center': 45, 'North District': 20, 'East District': 60, 'West District': 50 },
    'Village B': { 'City Center': 30, 'North District': 40, 'East District': 25, 'West District': 60 },
    'City Center': { 'Village A': 45, 'Village B': 30, 'North District': 35, 'East District': 20, 'West District': 15 },
    'North District': { 'Village A': 20, 'Village B': 40, 'City Center': 35, 'East District': 45, 'West District': 50 },
    'East District': { 'Village A': 60, 'Village B': 25, 'City Center': 20, 'North District': 45, 'West District': 55 },
    'West District': { 'Village A': 50, 'Village B': 60, 'City Center': 15, 'North District': 50, 'East District': 55 }
};
