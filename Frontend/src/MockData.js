export const mockSummary = {
  totalPreparedKg: 450,
  totalWastedKg: 45,
  wastePercentage: 10,
  costSavedINR: 3500,
  efficiencyStatus: "High Efficiency",
};

export const mockWeeklyForecast = [
  { day: 'Mon', predicted: 410, actual: 430 },
  { day: 'Tue', predicted: 390, actual: 400 },
  { day: 'Wed', predicted: 450, actual: 460 },
  { day: 'Thu', predicted: 420, actual: 440 },
  { day: 'Fri', predicted: 480, actual: 495 },
  { day: 'Sat', predicted: 320, actual: 310 },
  { day: 'Sun', predicted: 280, actual: 290 },
];

export const mockAlerts = [
  { id: 1, type: 'danger', message: 'Anomaly: 35 extra plates prepared for Breakfast today.', time: '10:30 AM' },
  { id: 2, type: 'warning', message: 'High Waste Alert: 18% Rice wasted during Lunch interval.', time: '02:15 PM' },
  { id: 3, type: 'success', message: 'AI Recommendation: Reduce Dinner prep by 12% based on weekend mass exodus.', time: '04:00 PM' },
];