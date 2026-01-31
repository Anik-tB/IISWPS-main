// Utility functions for exporting data

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printReport() {
  window.print();
}

export function formatSensorDataForExport(sensors: any[]) {
  return sensors.map(sensor => ({
    'Sensor ID': sensor.id,
    'Temperature (°F)': sensor.temperature.toFixed(1),
    'Vibration (m/s²)': sensor.vibration.toFixed(2),
    'RPM': sensor.rpm,
    'Load (%)': (sensor.load * 100).toFixed(0),
    'Risk Class': sensor.risk_class || 'N/A',
    'Accident Probability (%)': sensor.accident_probability
      ? (sensor.accident_probability * 100).toFixed(1)
      : 'N/A',
    'Timestamp': sensor.timestamp,
  }));
}
