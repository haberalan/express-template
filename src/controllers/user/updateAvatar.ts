import multer from "multer";
import sharp from "sharp";
import { Request, Response } from "express";
import User from "#src/models/user.model";
import { IUser } from "#src/types/IUser.types";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed."));
    }
  },
});

export const updateAvatar = [
  upload.any(),
  async (req: Request & { user: IUser }, res: Response) => {
    const user_id = req.user._id;

    try {
      if (!req.files[0]) throw { global: "Please provide an image." };

      const avatar = await sharp(req.files[0].buffer)
        .resize(200, 200)
        .png({ quality: 100 })
        .toBuffer();

      const user = await User.updateAvatar(user_id, avatar);

      res.status(200).json({ username: user.username });
    } catch (err) {
      res.status(400).json(err);
    }
  },
];
