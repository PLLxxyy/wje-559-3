function datePart(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

export function generateTicketNo(sequence: number): string {
  return `TS-${datePart()}-${String(sequence).padStart(4, '0')}`;
}

export function generateRequestNo(sequence: number): string {
  return `SR-${datePart()}-${String(sequence).padStart(4, '0')}`;
}
