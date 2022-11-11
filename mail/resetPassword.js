import { config } from "../config/auth.config.js";
import transport from "../config/nodemailer.config.js";

const resetPasswordLink = (name, email, confirmationCode) => {
  transport
    .sendMail({
      from: config.user,
      to: email,
      subject: "Please confirm your account",
      attachments: [
        {
          filename: "",
          path: "",
          cid: "", //my mistake was putting "cid:logo@cid" here!
        },
      ],
      html: `<table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
          <td bgcolor="#74cbe7" align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                      <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"></td>
                  </tr>
              </table>
          </td>
      </tr>
      
      <tr>
          <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
              <td bgcolor="#ffffff" align="left"
                  style="padding: 20px 30px 15px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                  <p>Dear ${name},</p>
                  You are receiving this email because we received a password reset request for your account.
              </td>
          </tr>      
              <tr>
                      <td bgcolor="#ffffff" align="left"
                          style="padding: 0px 30px 15px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                          <!-- <h3 style="color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif;"><strong>Order Summary</strong></h3> -->
                          <b>
                              <a style="text-decoration:none;color:#74cbe7;" href="http://localhost:5000/reset/${email}/${confirmationCode}">Reset Password.</a> 
                             
                          </b>
                     
                      </td>
                  </tr>
                 
              </table>
          </td>
      </tr>
  </table>`,
    })
    .catch((err) => console.log(err));
};
export default resetPasswordLink;
