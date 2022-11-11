import { config } from "../config/auth.config.js";
import transport from "../config/nodemailer.config.js";

const sendConfirmationEmail = (name, email, confirmationCode) => {
  transport
    .sendMail({
      from: config.user,
      to: email,
      subject: "Please confirm your account",
      attachments: [
        {
          filename: "slate.png",
          path: "../server/public/slate.png",
          cid: "logo", //my mistake was putting "cid:logo@cid" here!
        },
      ],
      html: `<table border="0" cellpadding="0" cellspacing="0" width="100%">
      
      
      <tr>
          <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                      <td bgcolor="#ffffff" align="left"
                          style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                          <!-- <h3 style="color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif;"><strong>Order Summary</strong></h3> -->
                          <b>
                              <p style="margin: 0;">To verify your account , Please  
                              <a style="text-decoration:none;color:#74cbe7;" href="http://localhost:5000/confirmation/${email}/${confirmationCode}">Click here.</a> 
                              </p>
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
export default sendConfirmationEmail;
