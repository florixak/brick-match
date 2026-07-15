import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodType } from 'zod';

function formatZodError(error: ZodError): {
  message: string;
  errors: Record<string, string[]>;
} {
  const { fieldErrors, formErrors } = error.flatten();

  const errors = Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([field, messages]) => {
      if (!Array.isArray(messages) || messages.length === 0) {
        return [];
      }
      return [[field, messages]];
    }),
  ) as Record<string, string[]>;

  const fieldMessages = Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => `${field}: ${message}`),
  );

  const message = [...formErrors, ...fieldMessages].join('; ');

  return {
    message: message || 'Validation failed',
    errors,
  };
}

export class ZodValidationPipe<T = unknown> implements PipeTransform {
  constructor(private schema: ZodType<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new BadRequestException(formatZodError(error));
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Validation failed',
      );
    }
  }
}
