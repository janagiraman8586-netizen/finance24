/**
 * Financial Formatting & Date Utilities
 */

export function toSafeISODate(input?: string | Date | null): string {
  if (!input) return new Date().toISOString();
  
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? new Date().toISOString() : input.toISOString();
  }

  const trimmed = String(input).trim();
  if (!trimmed) return new Date().toISOString();

  // Try standard parse
  const directDate = new Date(trimmed);
  if (!isNaN(directDate.getTime())) {
    return directDate.toISOString();
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    // If year is the third part (e.g. 25-09-2026)
    if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const reconstructed = new Date(Date.UTC(year, month, day, 12, 0, 0));
      if (!isNaN(reconstructed.getTime())) {
        return reconstructed.toISOString();
      }
    }
  }

  return new Date().toISOString();
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || '0'));
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
}

export function floatVal(val: number | string | null | undefined): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const parsed = parseFloat(String(val || '0'));
  return isNaN(parsed) ? 0 : parsed;
}
