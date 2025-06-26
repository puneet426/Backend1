import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()
router.route("/register").post(
upload.fields([
{
    name:"avatar",
    maxCount:1
},
{
    name:"coverImage",
    maxCount:1
},
]),




registerUser)


router.post("/debug-upload", upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  res.json({ message: "Upload success", body: req.body, files: req.files });
});
/*
// Cover image testing

router.post("/test-cover", upload.fields([
  { name: "coverImage", maxCount: 1 }
]), (req, res) => {
  console.log("Got coverImage:", req.files?.coverImage);
  res.send("coverImage received!");
});
*/
export default router