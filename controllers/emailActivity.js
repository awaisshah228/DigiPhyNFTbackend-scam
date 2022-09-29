var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
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
                       
        <table cellspacing="0" cellpadding="0" width="100%" class="digiphyemail" style=" max-width: 600px;margin: auto;font-family: Inter,sans-serif;font-size: 14px; background-image:url('https://digiphynft.shop/images/email/music.png');  background-size:cover;background-repeat:no-repeat ">
         <tbody>
            <tr>
               <td style="padding:25px 35px">
                  <a href="#" style="display:inline-block;margin:0 15px" target="_blank" ><img src="https://digiphynft.shop/images/email/logo.png" width="150" class="CToWUd" data-bit="iit"></a>
                  
                  <span style="margin-top:30px;width:100%;display:block;height:1px;background-image: url('https://digiphynft.shop/images/email/bgbtn.jpg');background-size:cover;background-repeat:no-repeat;backend-position:center;"></span>
               </td>
            </tr>
            <tr>
               <td style="padding:15px 36px" align="left">
                  <br>
                  <p style="margin:0 0 30px;color:#fff;line-height:28px;font-size:16px">Hello,</p>
                  <p style="margin:0px;color:#fff;line-height:28px;font-size:16px;word-wrap:break-word">${text}</p>
               </td>
            </tr>

            <tr>
               <td style="padding:15px 36px" align="left">
                  <p style="margin-top:30px;color:#fff;line-height:25px;font-size:16px;font-weight:400;text-align:justify">Best Regrads,<br>Team DigiPhyNFT</p>
               </td>
            </tr>

            <tr>
               <td style="padding:15px" align="center">
                  <a href="https://marketplace.digiphynft.com" style="display:inline-block;font-size:16px;width:60%;padding:16px 0;background-image:url('https://digiphynft.shop/images/email/bgsmall.jpg');background-size:cover;background-repeat:no-repeat;backend-position:center; border-radius:10px;color:#fff;text-decoration:none" target="_blank" >Click Here to Explore the Platform</a>
               </td>
            </tr>
            
            <tr>
            <td style="padding:20px 15px" align="center">
               <a href="https://www.facebook.com/DigiPhyNFT" style="display:inline-block;margin:0 15px" target="_blank">
               <img src="https://digiphynft.shop/images/email/facebook.png" width="34" class="CToWUd" data-bit="iit">
               <a href="https://twitter.com/DigiPhyNFT" style="display:inline-block;margin:0 15px" target="_blank" >
               <img src="https://digiphynft.shop/images/email/twitter.png" width="34" class="CToWUd" data-bit="iit">
               </a>
               <a href="https://www.instagram.com/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank" >
               <img src="https://digiphynft.shop/images/email/instagram.png" width="34" class="CToWUd" data-bit="iit">
               </a>
               <a href="https://discord.com/invite/GuymFFY2NF" style="display:inline-block;margin:0 15px" target="_blank" >
               <img src="https://digiphynft.shop/images/email/discord.png" width="34" class="CToWUd" data-bit="iit">
               </a>
               <a href="https://www.reddit.com/r/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank">
               <img src="https://digiphynft.shop/images/email/reddit.png" width="34" class="CToWUd" data-bit="iit">
               </a>
               <a href="https://www.linkedin.com/company/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank">
               <img src="https://digiphynft.shop/images/email/linkedin.png" width="34" class="CToWUd" data-bit="iit">
               </a>
               
               
               
               </a>
               <a href="https://www.youtube.com/channel/UC878bT4K6sZqjqKarlZa8Qw
               " style="display:inline-block;margin:0 15px" target="_blank" >
               <img src="https://digiphynft.shop/images/email/youtube.png" width="34" class="CToWUd" data-bit="iit">
               </a>
    
            </td>
         </tr>
         <tr>
               <td style="background:#19132a;padding:15px" align="center">
                  <p style="margin:0;color:#fff">Please reach out to <a href="#" style="text-decoration:none;color:#e33f84" target="_blank">help@digiphynft.com</a> for any queries</p>
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


exports.RegisterActivity = async function (email, subject, text) {

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

   const Token = jwt.sign({
      email: email
  }, config.JWT_SECRET_KEY)

   console.log('email', email);

   console.log('Subject', subject);

   var mailOptions = {
      from: 'support@digiphynft.com',
      to: `${email}`,
      subject: `${subject}`,
      html: `
      
<table cellspacing="0" cellpadding="0" width="100%" class="digiphyemail" style=" max-width: 600px;margin: auto;font-family: Inter,sans-serif;font-size: 14px; background-image:url('https://digiphynft.shop/images/email/music.png');  background-size:cover;background-repeat:no-repeat ">
<tbody>
  <tr>
     <td style="padding:25px 35px">
        <a href="#" style="display:inline-block;margin:0 15px" target="_blank" ><img src="https://digiphynft.shop/images/email/logo.png" width="150" class="CToWUd" data-bit="iit"></a>
       
        <span style="margin-top:30px;width:100%;display:block;height:1px;background-image: url('https://digiphynft.shop/images/email/bgbtn.jpg');background-size:cover;background-repeat:no-repeat;backend-position:center;"></span>
     </td>
  </tr>
  <tr>
     <td style="padding:15px 36px" align="left">
        <p style="margin:0 0 30px;color:#fff;line-height:28px;font-size:16px">Dear ${text},</p>
        <p style="margin:0px;color:#fff;line-height:28px;font-size:16px;word-wrap:break-word">We're delighted to have you on board. Digiphy is the "India's Most memorable NFT Marketplace".Digiphy engages Specialists to fabricate fan networks and empowers fans to assume a part to supercharge development of Craftsmen by purchasing NFTs and assist them with catching additional worth from their work. These NFTs allow the fans an opportunity to be essential for a selective local area with the Craftsman and get unique honors and procure royalty*, exceptional honors like early admittance to restrictive in the background content, meet-n-welcome open doors, behind the stage admittance to shows and so on to reinforce direct commitment and unwaveringness with fans.</p>
     </td>
  </tr>
  <tr>
     <td style="padding:15px" align="center">
     <a href='${config.mailUrl}verifyAccount/${Token}' style="display:inline-block;font-size:16px;width:60%;padding:16px 0;background-image:url('https://digiphynft.shop/images/email/bgsmall.jpg');background-size:cover;background-repeat:no-repeat;backend-position:center; border-radius:10px;color:#fff;text-decoration:none" target="_blank" >Click here to activate your account</a>
     </td>
  </tr>
  <tr>
     <td style="padding:15px 36px" align="left">
        <p style="margin-top:30px;color:#fff;line-height:25px;font-size:16px;font-weight:400;text-align:justify">Regards,<br>Team DigiPhyNFT</p>
     </td>
  </tr>
  <tr>
     <td style="padding:20px 15px" align="center">
        <a href="https://www.facebook.com/DigiPhyNFT" style="display:inline-block;margin:0 15px" target="_blank">
        <img src="https://digiphynft.shop/images/email/facebook.png" width="34" class="CToWUd" data-bit="iit">
        <a href="https://twitter.com/DigiPhyNFT" style="display:inline-block;margin:0 15px" target="_blank" >
        <img src="https://digiphynft.shop/images/email/twitter.png" width="34" class="CToWUd" data-bit="iit">
        </a>
        <a href="https://www.instagram.com/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank" >
        <img src="https://digiphynft.shop/images/email/instagram.png" width="34" class="CToWUd" data-bit="iit">
        </a>
        <a href="https://discord.com/invite/GuymFFY2NF" style="display:inline-block;margin:0 15px" target="_blank" >
        <img src="https://digiphynft.shop/images/email/discord.png" width="34" class="CToWUd" data-bit="iit">
        </a>
        <a href="https://www.reddit.com/r/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank">
        <img src="https://digiphynft.shop/images/email/reddit.png" width="34" class="CToWUd" data-bit="iit">
        </a>
        <a href="https://www.linkedin.com/company/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank">
        <img src="https://digiphynft.shop/images/email/linkedin.png" width="34" class="CToWUd" data-bit="iit">
        </a>
        
        
        
        </a>
        <a href="https://www.youtube.com/channel/UC878bT4K6sZqjqKarlZa8Qw
        " style="display:inline-block;margin:0 15px" target="_blank" >
        <img src="https://digiphynft.shop/images/email/youtube.png" width="34" class="CToWUd" data-bit="iit">
        </a>

     </td>
  </tr>
  <tr>
     <td style="background:#19132a;padding:15px" align="center">
        <p style="margin:0;color:#fff">Please reach out to <a href="#" style="text-decoration:none;color:#e33f84" target="_blank">help@digiphynft.com</a> for any queries</p>
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


exports.Activity1 = async function (email, subject, text, link, image) {

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
                      
       <table cellspacing="0" cellpadding="0" width="100%" class="digiphyemail" style=" max-width: 600px;margin: auto;font-family: Inter,sans-serif;font-size: 14px; background-image:url('https://digiphynft.shop/images/email/music.png');  background-size:cover;background-repeat:no-repeat ">
        <tbody>
           <tr>
              <td style="padding:25px 35px">
                 <a href="#" style="display:inline-block;margin:0 15px" target="_blank" ><img src="https://digiphynft.shop/images/email/logo.png" width="150" class="CToWUd" data-bit="iit"></a>
                 
                 <span style="margin-top:30px;width:100%;display:block;height:1px;background-image: url('https://digiphynft.shop/images/email/bgbtn.jpg');background-size:cover;background-repeat:no-repeat;backend-position:center;"></span>
              </td>
           </tr>
           <tr>
              <td style="padding:15px 36px" align="left">
                 <br>
                 <p style="margin:0px;color:#fff;line-height:28px;font-size:16px;word-wrap:break-word">${text}</p>
              </td>
           </tr>

           <tr>
              <td style="padding:15px" align="center">
                 <a href="https://marketplace.digiphynft.com" style="display:inline-block;font-size:16px;width:60%;padding:16px 0;background-image:url('https://digiphynft.shop/images/email/bgsmall.jpg');background-size:cover;background-repeat:no-repeat;backend-position:center; border-radius:10px;color:#fff;text-decoration:none" target="_blank" >Click here to login and view</a>
              </td>
           </tr>

           <tr>
           <td style="padding:15px 36px" align="left">
              <br>
              <p style="margin:0px;color:#fff;line-height:28px;font-size:16px;word-wrap:break-word">Hope you had a good experience. Looking forward to your next visit.</p>
           </td>
        </tr>

           <tr>
              <td style="padding:15px 36px" align="left">
                 <p style="margin-top:30px;color:#fff;line-height:25px;font-size:16px;font-weight:400;text-align:justify">Best Regrads,<br>Team DigiPhyNFT</p>
              </td>
           </tr>

           
           
           <tr>
           <td style="padding:20px 15px" align="center">
              <a href="https://www.facebook.com/DigiPhyNFT" style="display:inline-block;margin:0 15px" target="_blank">
              <img src="https://digiphynft.shop/images/email/facebook.png" width="34" class="CToWUd" data-bit="iit">
              <a href="https://twitter.com/DigiPhyNFT" style="display:inline-block;margin:0 15px" target="_blank" >
              <img src="https://digiphynft.shop/images/email/twitter.png" width="34" class="CToWUd" data-bit="iit">
              </a>
              <a href="https://www.instagram.com/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank" >
              <img src="https://digiphynft.shop/images/email/instagram.png" width="34" class="CToWUd" data-bit="iit">
              </a>
              <a href="https://discord.com/invite/GuymFFY2NF" style="display:inline-block;margin:0 15px" target="_blank" >
              <img src="https://digiphynft.shop/images/email/discord.png" width="34" class="CToWUd" data-bit="iit">
              </a>
              <a href="https://www.reddit.com/r/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank">
              <img src="https://digiphynft.shop/images/email/reddit.png" width="34" class="CToWUd" data-bit="iit">
              </a>
              <a href="https://www.linkedin.com/company/DigiPhyNFT/" style="display:inline-block;margin:0 15px" target="_blank">
              <img src="https://digiphynft.shop/images/email/linkedin.png" width="34" class="CToWUd" data-bit="iit">
              </a>
              
              
              
              </a>
              <a href="https://www.youtube.com/channel/UC878bT4K6sZqjqKarlZa8Qw
              " style="display:inline-block;margin:0 15px" target="_blank" >
              <img src="https://digiphynft.shop/images/email/youtube.png" width="34" class="CToWUd" data-bit="iit">
              </a>
   
           </td>
        </tr>
        <tr>
              <td style="background:#19132a;padding:15px" align="center">
                 <p style="margin:0;color:#fff">Please reach out to <a href="#" style="text-decoration:none;color:#e33f84" target="_blank">help@digiphynft.com</a> for any queries</p>
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