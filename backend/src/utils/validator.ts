import { BadRequestException } from '@nestjs/common';

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length) {
    throw new BadRequestException(`Missing required fields: ${missing.join(', ')}`);
  }
}
