import {Router } from "express";
import { logout, signup } from "../controllers/AuthController.js"
import { login }  from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getUserInfo } from "../controllers/AuthController.js";
import { updateProfile } from "../controllers/AuthController.js";
import { addProfileImage } from "../controllers/AuthController.js";
import { removeProfileImage } from "../controllers/AuthController.js";
import multer from "multer";



const authRoutes=Router();
const  upload=multer({dest:"uploads/profiles/"})

authRoutes.post("/signup",signup)
authRoutes.post("/login" ,login)
authRoutes.get("/user-info",verifyToken,getUserInfo)
authRoutes.post("/update-profile",verifyToken,updateProfile);
authRoutes.post("/add-profile-image",verifyToken,upload.single("profile-image"),addProfileImage);


authRoutes.delete("/remove-profile-image",verifyToken,removeProfileImage);
authRoutes.post("/logout",logout)

/** Routes for authentication and profile operations
 *  Mounted at /api/auth in server/index.js
 *
 * POST /signup        -> signup controller (creates user, sets JWT)
 * POST /login         -> login controller (verifies, sets JWT)
 * GET  /user          -> getUserInfo (requires auth middleware to set request.userId)
 * POST /update-profile-> updateProfile (requires auth; expects { firstName, lastName, color })
 * POST /add-profile-image
 *    -> uses multer.single("profile-image") before controller to parse file upload
 * POST /remove-profile-image
 *    -> removes current profile image (requires auth)
 */

export default authRoutes;

// Multer usage notes:
// - upload.single("profile-image") parses multipart/form-data for exactly one file
// - The field name "profile-image" MUST match the client FormData key:
//     const fd = new FormData(); fd.append("profile-image", file)
// - Multer must run BEFORE the controller so request.file is available there
// - File type/size limits are configured inside middlewares/multer.js
// - On success, controller should read request.file and save its path to user.image

// add-profile-image route:
// - Flow: auth middleware (if any) -> upload.single("profile-image") -> addProfileImage controller
// - After multer runs, request.file contains the uploaded file metadata (path, filename, mimetype, size, etc.)
// - Do NOT move multer after the controller; the controller depends on request.file
// authRoutes.post("/add-profile-image", upload.single("profile-image"), addProfileImage);

// remove-profile-image route:
// - No multer needed; it removes the existing file referenced by user.image
// - Controller should delete the file (if present) and clear user.image in DB
// authRoutes.post("/remove-profile-image", removeProfileImage);