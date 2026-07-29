export const formatRegion = (region: string): string => {
  if (!region) return '';
  // Elimina duplicados como "AR AR" -> "AR"
  const parts = region.split(/\s+/);
  const uniqueParts = Array.from(new Set(parts));
  return uniqueParts.join(' ');
};
