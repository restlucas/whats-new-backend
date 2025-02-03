"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendInviteEmail = (invitationId, teamName, email) => __awaiter(void 0, void 0, void 0, function* () {
    // const token = jwt.sign(
    //   { invitationId, email },
    //   process.env.JWT_SECRET as string,
    //   {
    //     expiresIn: "1d",
    //   }
    // );
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.WHATSNEW_EMAIL,
            pass: process.env.WHATSNEW_EMAIL_PASS,
        },
    });
    const link = `${process.env.WHATSNEW_FRONTEND_URL}auth/creator`;
    const mailOptions = {
        from: process.env.WHATSNEW_EMAIL,
        to: email,
        subject: `What's New | Invitation to participate in ${teamName}`, // Assunto do e-mail
        html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
  </head>
  <body
    style="
      padding: 1rem;
      padding: 0;
      background-color: #1f2937;
      font-family: Arial, sans-serif;
    "
  >
    <table
      width="100%"
      height="400px"
      cellspacing="0"
      cellpadding="0"
      style="text-align: start"
    >
      <tr>
        <td align="center" valign="middle">
          <table
            width="50%"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #303945;
              border-radius: 6px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -4px rgba(0, 0, 0, 0.1);
              padding: 24px;
              color: #ffffff;
            "
          >
            <tr>
              <td style="text-align: start">
                <h3 style="font-size: 24px; font-weight: bold; margin: 0">
                  What's New
                </h3>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; text-align: left">
                <p style="margin: 0; font-size: 16px; margin: 2rem 0 1rem 0; color: #ffffff;">
                  You have been invited to join the ${teamName} team!
                </p>
                <p style="margin: 0; font-size: 16px; margin-bottom: 3.5rem; color: #ffffff;">
                  To continue please click in the link below and make login:
                </p>
                <a target="_blank" href="${link}" style="margin: 0; font-size: 16px; text-align: center">
                  ${link}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    };
    try {
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending invite email:", error);
        throw new Error("Failed to send invite email");
    }
});
exports.sendInviteEmail = sendInviteEmail;
