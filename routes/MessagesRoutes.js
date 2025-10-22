import {Router} from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFiles} from "../controllers/MessageController.js";
import multer
 from "multer";


const messagesRoutes=Router();
const upload=multer({dest:"uploads/files"});
messagesRoutes.post("/get-messages",verifyToken,getMessages);
messagesRoutes.post("/upload-files",verifyToken,upload.single("file"),uploadFiles);



export default messagesRoutes;