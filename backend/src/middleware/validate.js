import { ZodError } from "zod";

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      req.validated = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: error.flatten(),
        });
      }

      next(error);
    }
  };
};

export default validate;
