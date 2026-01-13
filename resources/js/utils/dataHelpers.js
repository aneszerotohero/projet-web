/**
 * Utilitaires pour gérer les données manquantes et NaN
 */

export const sanitizeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue;
  }
  return Number(value);
};

export const formatGrade = (grade, defaultText = '—') => {
  const safe = sanitizeNumber(grade);
  return safe === 0 && defaultText ? defaultText : safe.toFixed(2);
};

export const formatPercentage = (value, total, defaultText = '—') => {
  if (!total || total === 0) return defaultText;
  const safe = sanitizeNumber(value);
  const percent = ((safe / total) * 100).toFixed(1);
  return isNaN(percent) ? defaultText : `${percent}%`;
};

export const hasValidData = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

export const EmptyStateMessage = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {Icon && <Icon className="w-16 h-16 text-gray-300 mb-4" />}
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-gray-500 text-sm mt-1">{description}</p>
  </div>
);
