import { Request, Response } from "express";
import User from "#src/models/user.model";

export const getAvatar = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    const dataBSON = JSON.stringify(user.avatar);

    const dataJSON = await JSON.parse(dataBSON);

    const dataBuffer = await Buffer.from(dataJSON.buffer.data);

    res.end(dataBuffer);
  } catch (err) {
    res.status(400).json({ global: "There was an error." });
  }
};
