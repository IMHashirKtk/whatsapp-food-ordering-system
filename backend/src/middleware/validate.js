import { ZodError } from "zod";
import AppError from "../utils/AppError.js";

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (validated.body) {
        req.body = validated.body;
      }

      if (validated.params) {
        Object.assign(req.params, validated.params);
      }

      if (validated.query) {
        Object.assign(req.query, validated.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(
            error.issues.map((issue) => issue.message).join(", "),
            400,
          ),
        );
      }

      next(error);
    }
  };
};

export default validate;
