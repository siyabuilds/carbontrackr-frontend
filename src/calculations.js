// Calculations for carbon footprint tracking
export const calculateTotalEmissions = (logs) => {
  return logs.reduce((total, log) => {
    const val = typeof log.co2 === "number" ? log.co2 : parseFloat(log.co2);
    return total + (isFinite(val) ? val : 0);
  }, 0);
};

export const calculateEmissionsByCategory = (logs) => {
  const categoryTotals = {};
  logs.forEach((log) => {
    const val = typeof log.co2 === "number" ? log.co2 : parseFloat(log.co2);
    categoryTotals[log.category] =
      (categoryTotals[log.category] || 0) + (isFinite(val) ? val : 0);
  });

  return categoryTotals;
};

export const formatEmissions = (value) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (!isFinite(num) || Number.isNaN(num)) {
    return `0.00 kg CO₂`;
  }

  return `${num.toFixed(2)} kg CO₂`;
};
