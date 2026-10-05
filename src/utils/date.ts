const pad = (value: number) => String(value).padStart(2, '0');

// Aplica a máscara DD/MM/AAAA enquanto o usuário digita.
export function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Converte DD/MM/AAAA em Date. Retorna null para datas inexistentes (ex.: 31/02/2026).
export function parseDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1900 || year > 2100) return null;

  const date = new Date(year, month - 1, day);
  const exists = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return exists ? date : null;
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return '-';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function isBeforeToday(date: Date | null | undefined): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}
