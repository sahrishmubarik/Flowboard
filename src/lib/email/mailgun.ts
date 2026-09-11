import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mail = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

export default mail;