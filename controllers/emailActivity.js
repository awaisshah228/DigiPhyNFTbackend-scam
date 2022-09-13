var nodemailer = require('nodemailer');
var config = require('../config')
exports.Activity = async function (email, subject, text, link, image) {

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'support@digiphynft.com',
            pass: 'DigiPhyNFT@123#'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    console.log('email', email);

    console.log('Subject', subject);

    console.log('link', link);
    var mailOptions = {
        from: 'support@digiphynft.com',
        to: email,
        subject: subject,
        html: ` 
        
        <table cellspacing="0" cellpadding="0" width="100%" class="digiphyemail" style=" max-width: 600px;
         background: linear-gradient(rgb(18 27 34 / 34%), rgb(18 27 34 / 98%)) ,top/cover no-repeat url(https://digiphynft.shop/images/email/music.jpg),#0c091b;
         margin: auto;
         font-family: Inter,sans-serif;
         font-size: 14px;">
         <tbody>
            <tr>
               <td style="padding:25px 35px">
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" ><img src="https://digiphynft.shop/images/email/logo.png" width="150" class="CToWUd" data-bit="iit"></a>
                  <p style="font-size:16px;font-weight:500;color:#fff;float:right">#MusicNFT</p>
                  <span style="margin-top:30px;width:100%;display:block;height:1px;background:center/cover no-repeat url(bgbtn.jpg)"></span>
               </td>
            </tr>
            <tr>
               <td style="padding:15px 36px" align="left">
                  <p style="margin:0 0 30px;color:#fff;line-height:28px;font-size:16px">Dear ${user_name},</p>
                  <p style="margin:0px;color:#fff;line-height:28px;font-size:16px;word-wrap:break-word">We're delighted to have you on board. Digiphy is the "India's Most memorable NFT Marketplace".Digiphy engages Specialists to fabricate fan networks and empowers fans to assume a part to supercharge development of Craftsmen by purchasing NFTs and assist them with catching additional worth from their work. These NFTs allow the fans an opportunity to be essential for a selective local area with the Craftsman and get unique honors and procure royalty*, exceptional honors like early admittance to restrictive in the background content, meet-n-welcome open doors, behind the stage admittance to shows and so on to reinforce direct commitment and unwaveringness with fans.</p>
               </td>
            </tr>
            <tr>
               <td style="padding:15px" align="center">
                  <a href="#" style="display:inline-block;font-size:16px;width:60%;padding:16px 0;background:center/cover no-repeat url(bgsmall.jpg);border-radius:10px;color:#fff;text-decoration:none" target="_blank" >Click Here to Explore the Platform</a>
               </td>
            </tr>
            <tr>
               <td style="padding:15px 36px" align="left">
                  <p style="margin-top:30px;color:#fff;line-height:25px;font-size:16px;font-weight:400;text-align:justify">Regards,<br>TeamDigiphy</p>
               </td>
            </tr>
            <tr>
               <td style="padding:20px 15px" align="center">
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank">
                  <img src="https://digiphynft.shop/images/email/facebook.png" width="34" class="CToWUd" data-bit="iit">
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                  <img src="https://digiphynft.shop/images/email/twitter.png" width="34" class="CToWUd" data-bit="iit">
                  </a>
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                  <img src="https://digiphynft.shop/images/email/instagram.png" width="34" class="CToWUd" data-bit="iit">
                  </a>
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                  <img src="https://digiphynft.shop/images/email/discord.png" width="34" class="CToWUd" data-bit="iit">
                  </a>
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank">
                  <img src="https://digiphynft.shop/images/email/telegram.png" width="34" class="CToWUd" data-bit="iit">
                  </a>
                  
                  
                  
                  </a>
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                  <img src="https://digiphynft.shop/images/email/youtube.png" width="34" class="CToWUd" data-bit="iit">
                  </a>
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                  <img src="https://digiphynft.shop/images/email/medium.png" width="34" class="CToWUd" >
                  </a>
               </td>
            </tr>
            <tr>
               <td style="background:#19132a;padding:15px" align="center">
                  <p style="margin:0;color:#fff">Please reach out to <a href="#" style="text-decoration:none;color:#e33f84" target="_blank">support@Digiphy.com</a> for any queries</p>
                  <font color="#888888">
                  </font>
               </td>
            </tr>
         </tbody>
      </table>`
    };

    //console.log('mailOptions',mailOptions);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);

        }
    });
    

}