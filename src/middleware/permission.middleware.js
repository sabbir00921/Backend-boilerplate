const { CustomError } = require("../helpers/customError");
const UserModel = require("../model/user.model");

const permission = (allowedRoles = [], allowedPermissions = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new CustomError(401, "Unauthorized access");

      // user fetch
      const user = await UserModel.findById(userId).lean();
      if (!user) throw new CustomError(401, "User not found");

      if (user.accountStatus !== "active") {
        throw new CustomError(
          403,
          `Your account is ${user.accountStatus}. Access denied.`
        );
      }

      // Role check
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new CustomError(403, "You do not have role permission.");
      }

      // Permission check
      if (allowedPermissions.length > 0) {
        const hasPermission = user.permissions?.some((p) =>
          allowedPermissions.includes(p)
        );

        if (!hasPermission) {
          throw new CustomError(403, "You do not have required permissions.");
        }
      }

      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { permission };
