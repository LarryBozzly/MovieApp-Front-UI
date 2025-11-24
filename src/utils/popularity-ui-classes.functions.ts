export function getPopularityClasses(popularity: number): string {
  if (popularity <= 40) return 'bg-red-100 text-red-700 border-red-300';
  if (popularity <= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (popularity <= 90) return 'bg-blue-100 text-blue-700 border-blue-300';
  return 'bg-green-600 text-white border-green-700';
}
