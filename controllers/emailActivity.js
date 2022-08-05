var nodemailer = require('nodemailer');
var config = require('../config')
exports.Activity = async function (email, subject, text, link, image) {

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'developer@espsofttech.com',
            pass: 'Espsoft123#'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    console.log('email', email);

    console.log('Subject', subject);

    console.log('link', link);
    var mailOptions = {
        from: 'developer@espsofttech.com',
        to: email,
        subject: subject,
        html: ` 
        <style type="text/css">
<!--
.style1 {
	font-family: Arial, Helvetica, sans-serif;
	font-size: 14px;
	display: block;
	font-weight: normal;
	padding: 16px 0 8px 0;
	color: #000000;
}
-->
</style>
<div style="FONT-FAMILY:Helvetica-Neue,Helvetica,Arial,sans-serif">
        <table cellspacing="0" cellpadding="6" width="100%" style="background:#ffffff">
        <tbody>
        <tr>
        <td style="border:#ffffff 1px solid">
        <table cellspacing="0" cellpadding="0" width="640px" style="margin:0 auto" bgcolor="white">
        <tbody>
        <tr>
        <td>
            <table cellspacing="0" cellpadding="0" width="100%">
                <tbody>
                    <tr valign="middle">
                        <td colspan="2" align="center" bgcolor="#333333" style="text-align:center;width:100%;padding:12px 0px;border-bottom:1px solid #eaeaea">
                            <div>
                                <a href="#" target="_blank" >
                                    <img align="left" alt="DigiPhyNFT Logo" src="https://espsofttech.in/digiphynft/backend/uploads/image-1654674806051.png" width="180" style="max-width:400px;padding-bottom:0;display:inline!important;float: inherit;vertical-align:bottom;border:0;height:auto;outline:none;text-decoration:none" class="CToWUd">                              </a>                          </div>
                        </td>
                      </tr>
                        <tr>
                            <td colspan="2">
                                <table style="text-align:left;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif;padding-top:20px;color:#37393a" width="100%" cellspacing="0" cellpadding="10" border="0" align="left">
                                    <tbody>
                                        <tr>
                                            <td align="center"><div>
                                              <div>${text}</div>
                                            </div></td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding:16px">
                                                <div>
                                                    <a href="${config.mailUrl}${link}" style="background-color:#0d58c8;color:#ffffff;display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif;font-size:16px;font-weight:normal;line-height:40px;text-align:center;text-decoration:none;width:200px" target="_blank" >View Detail</a>                                                </div>                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <table width="100%" cellspacing="0" cellpadding="10" style="background:#f8f8f8;margin-top:10px">
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" style="padding:0 0 20px 0">
                                                                <table cellspacing="0" cellpadding="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td align="center" width="580">
                                                                              <div style="text-align:left;font-size:26px;font-weight:400;padding-top:30px"></div>
                                                                                
                                                                                    <img width="580" src="${image}" class="CToWUd">                                                                          </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td align="center" width="580">&nbsp;                                                                        </td>
                                                                      </tr>
                                                                        </tbody>
                                                                    </table>                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="text-align:left">
                                                    <span style="color:#37393a;font-size:1em;display:block;font-weight:normal;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif">Regards <br /> — DigiPhyNFT Team</span>                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                          </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding:60px 10px;text-align:left;font-size:12px;color:#808080">
              
                                        <br>
              
                                            <br>
                                                
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
        </table>
        <img src="https://ci4.googleusercontent.com/proxy/0euvWLzznUAdrrGW6axQu9EsfXL7_6GxTkwJXcHMuspzeRNp8FcjggNNSiY-JGDJ8z4DbOXNQp4KIPTZGVU1rxrMwTDYTuQi_8byNugrg1teFLBDeSl-qzOQlrLf_5J09vckt8nuI2XdYRyBtc51W8-MtkRh6exxSbukw1tjdhyhvMvjDg4Km59N4U3mO6S4-d8_qLLADYjFCESLB7XgLben3uVL4vcgREVoCHPLX6k3tMUx_FICjsmAUoTqIEH2GMf5wgZievaPA2FQOsBv4s_5yQ8C8XOv0k5NOqjY2urKBqyOq4G918U_MsrE-E3O0QXlCZiNFMR4DS4XsZfIO7jkNZNjY1fmhbbJ5FmqHSpFOVjPj-L0nDeH1Aa9yyLBjJ8RUt5mreprdNhk7hv3wgqbGqA6IEDjln3sjelbl0HCClCvviJF3ImLBwtYrS_qya6aceNru1Yu8h5K36tjqdlYk05fH1VZgaFH2SnzfmoMSRZh6_24w61qjJmllDy5lyanOd0W7ata=s0-d-e1-ft#http://url7878.makersplace.com/wf/open?upn=-2BPV2hBq-2FD7DUfRz313ixDR4OP7mK3ScXbRYQPgG4McsDWBvGxOavCkt0egDMf4b2MzJOqSn6f8bSm0zGobt5IGcNocHC4GA5YoQaHHfw1RO7GmjU08o22B1HLW-2Fq-2FN3jJKNDg1SS-2BSCtQWUppObUIwIZAn1dnxWCpXLKq7tqll-2B8rhp45PZ-2FNrigL7mTnNsMQJBbqpQ-2F1l39X0wIMXhjb-2B-2BPdbUuwbBmXLgH4uU4sqgvdtK88KY3UvGN12jSTb-2FB-2BSps-2FmbaghPBh0Pipfp5DQL4Qmdp-2BJ9AzYB2PBiDsEc-3D" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd">
        <font color="#888888"></font>
        </div>`
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