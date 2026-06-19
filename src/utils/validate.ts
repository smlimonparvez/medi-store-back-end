import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Middleware factory — pass a Zod schema, get back an Express middleware
// that validates req.body and calls next() or returns a 400 with all errors
const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed. Please check your input.",
        errors,
      });
    }

    // Replace req.body with the parsed (and coerced) data
    req.body = result.data;
    next();
  };

export default validate;
