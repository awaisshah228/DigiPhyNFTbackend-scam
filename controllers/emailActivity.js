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
        <style type="text/css">
        .digiphyemail{
        max-width: 600px;
        background: linear-gradient(rgb(18 27 34 / 34%), rgb(18 27 34 / 98%)) ,top/cover no-repeat url(music.jpg),#0c091b;
        margin: auto;
        font-family: Inter,sans-serif;
        font-size: 14px;
        }
     </style>
<table cellspacing="0" cellpadding="0" width="100%" class="digiphyemail" >
                <tbody>
                   <tr>
                      <td style="padding:25px 35px">
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank" ><img src="logo.png" width="150" class="CToWUd" data-bit="iit"></a>
                         <p style="font-size:16px;font-weight:500;color:#fff;float:right">#MusicNFT</p>
                         <span style="margin-top:30px;width:100%;display:block;height:1px;background:center/cover no-repeat url(bgbtn.jpg)"></span>
                      </td>
                   </tr>
                   <tr>
                      <td style="padding:15px 36px" align="left">
                         <p style="margin:0 0 30px;color:#fff;line-height:28px;font-size:16px">Dear ${user_name},</p>
                         <p style="margin:0px;color:#fff;line-height:28px;font-size:16px;word-wrap:break-word">We're glad to have you on board.Digiphy is the "India's First Music NFT Marketplace".Digiphy empowers Artists to build fan communities and enable fans to play a role to supercharge growth of Artists by buying Music NFTs and help them capture more value from their work. These music NFTs give the fans a chance to be part of an exclusive community with the Artist and get special privileges and earn royalty*, special privileges like early access to exclusive behind the scenes content, meet-n-greet opportunities, unreleased music, backstage access to concerts etc to strengthen direct engagement and loyalty with fans.</p>
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
                         <img src="images/email/facebook.png" width="34" class="CToWUd" data-bit="iit">
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                         <img src="twitter.png" width="34" class="CToWUd" data-bit="iit">
                         </a>
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                         <img src="images/email/instagram.png" width="34" class="CToWUd" data-bit="iit">
                         </a>
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                         <img src="images/email/discord.png" width="34" class="CToWUd" data-bit="iit">
                         </a>
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank">
                         <img src="images/email/telegram.png" width="34" class="CToWUd" data-bit="iit">
                         </a>
                         
                         
                         
                         </a>
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                         <img src="images/email/youtube.png" width="34" class="CToWUd" data-bit="iit">
                         </a>
                         <a href="#" style="display:inline-block;margin:0 15px" target="_blank" >
                         <img src="images/email/medium.png" width="34" class="CToWUd" >
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