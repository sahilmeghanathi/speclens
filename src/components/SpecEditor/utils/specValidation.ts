export interface ValidationError {
  line: number;
  column: number;
  message: string;
  code: 'syntax_error' | 'schema_error' | 'type_error';
}

export interface ParseResult {
  success: boolean;
  data?: Record<string, any>;
  error?: ValidationError;
}

/**
 * Parse JSON safely with error information.
 */
export function parseJSONSafely(json: string): ParseResult {
  try {
    const data = JSON.parse(json);
    return { success: true, data };
  } catch (err: any) {
    // Try to extract line/column info from error message
    const match = /position (\d+)/.exec(err.message as string);
    const position = match ? Number.parseInt(match[1], 10) : 0;

    // Rough estimate of line/column
    const lines = json.substring(0, position).split('\n');
    const line = lines.length;
    const column = (lines.at(-1)?.length ?? 0) + 1;

    return {
      success: false,
      error: {
        line,
        column,
        message: err.message.replace(/JSON.parse: /, ''),
        code: 'syntax_error',
      },
    };
  }
}

/**
 * Validate spec structure against SpecLens schema.
 */
export function validateSpecSchema(spec: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!spec) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Spec cannot be empty',
      code: 'schema_error',
    });
    return errors;
  }

  if (typeof spec !== 'object') {
    errors.push({
      line: 1,
      column: 1,
      message: 'Spec must be an object',
      code: 'type_error',
    });
    return errors;
  }

  if (!spec.type) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Spec must have a "type" field',
      code: 'schema_error',
    });
  }

  if (spec.children && !Array.isArray(spec.children)) {
    errors.push({
      line: 1,
      column: 1,
      message: '"children" must be an array',
      code: 'type_error',
    });
  }

  if (spec.props && typeof spec.props !== 'object') {
    errors.push({
      line: 1,
      column: 1,
      message: '"props" must be an object',
      code: 'type_error',
    });
  }

  // Recursively validate children
  if (spec.children && Array.isArray(spec.children)) {
    for (const child of spec.children) {
      const childErrors = validateSpecSchema(child);
      errors.push(...childErrors);
    }
  }

  return errors;
}

/**
 * Full validation: parse JSON and validate schema.
 */
export function validateSpec(json: string): ValidationError[] {
  const parseResult = parseJSONSafely(json);

  if (!parseResult.success && parseResult.error) {
    return [parseResult.error];
  }

  return validateSpecSchema(parseResult.data);
}
