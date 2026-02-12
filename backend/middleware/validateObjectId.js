import mongoose from 'mongoose';

/**
 * Middleware to validate MongoDB ObjectId params
 * @param {string} paramName - The route parameter name to validate
 */
export const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} format`
    });
  }
  
  next();
};

export default validateObjectId;
