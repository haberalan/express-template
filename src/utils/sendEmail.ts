import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";

const sendMail = async (
  template: string,
  contentItems: Object,
  title: string,
  email: string[] | string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const templateFile = path.join(
      __dirname,
      `../../templates/${template}.hbs`
    );
    const templateContent: any = await fs.readFileSync(templateFile);

    const templateCompiled = Handlebars.compile(templateContent.toString())(
      contentItems
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: title,
      html: templateCompiled,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else
        console.log(`Successfully sent email to ${info.accepted.join(", ")}.`);
    });
  } catch (err) {
    throw new Error(err);
  }
};

export default sendMail;
