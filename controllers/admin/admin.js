const CryptoJS = require("crypto-js");
var fetch = require('node-fetch');
const config = require('../../config');
const adminQueries = require("../../services/adminQueries");
var validator = require("email-validator");
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const axios = require('axios');
const jwt = require('jsonwebtoken');
var ipfsCompress = require('../ipfsCompress/imagecompress');
var keySize = 256;
var iterations = 100;
const marketplaceQueries = require("../../services/marketplaceQueries");
var AdmZip = require('adm-zip');
const reader = require('xlsx')
var FormData = require('form-data');
const { type } = require("os");




function closeNFT(code) {

    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    //var pass = process.env.EKEY;
    var pass = "Espsoft123#";

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var iv = CryptoJS.lib.WordArray.random(128 / 8);

    var encrypted = CryptoJS.AES.encrypt(code, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    });

    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
    return transitmessage;
}


function openNFT(code) {

    var salt = CryptoJS.enc.Hex.parse(code.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(code.substr(32, 32))
    var encrypted = code.substring(64);
    //var pass = process.env.EKEY;
    var pass = "Espsoft123#";

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    })
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    return decrypted;
}

//============================================  Update on market place ====================================

exports.updateItemMarket = async (db, req, res) => {

    var item_id = req.body.item_id;
    let is_on_sale = 1;



    let keys = {
        // "item_id": item_id,
        "is_on_sale": 1
    }

    db.query(adminQueries.updateItemMarket, [keys, item_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Item updated successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

//============================================  Update on market place ====================================

exports.updateItemAdmin = async (db, req, res) => {

    var item_id = req.body.item_id;
    let approve_by_admin = 1;



    let keys = {
        // "item_id": item_id,
        "approve_by_admin": 1
    }

    db.query(adminQueries.updateItemMarket, [keys, item_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Item Approved successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.admin_connection_id = async (db, req, res) => {
    var id = req.params.collection_id;
    await db.query(adminQueries.adminconnectionid, id, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Succefully .....",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data!!"
            });
        }
    });
}


exports.updateadminCollection = async (db, req, res) => {
    var id = req.body.id;
    var profile_pic = (!req.files['profile_pic']) ? null : req.files['profile_pic'][0].filename;
    var banner = (!req.files['banner']) ? null : req.files['banner'][0].filename;
    var old_profile_pic = req.body.old_profile_pic;
    var old_banner = req.body.old_banner;
    var name = req.body.name;
    var description = req.body.description;
    var website = req.body.website;
    if (!profile_pic) {
        console.log('1');
        profile_pic = old_profile_pic
    }

    if (!banner) {
        console.log('12');

        banner = old_banner
    }
    var users = {
        "name": name,
        "description": description,
        "profile_pic": profile_pic,
        "banner": banner,
        "website": website,
        "facebook": req.body.facebook,
        "insta": req.body.insta,
        "telegram": req.body.telegram,
        "twitter": req.body.twitter,
        "discord": req.body.discord,
    }
    console.log(users);

    db.query(adminQueries.updateadminCollection, [users, id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Updated Successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.user_delete = async (db, req, res) => {
    var id = req.body.id;
    await db.query(adminQueries.user_delete, id, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        else {
            res.status(200).send({
                success: true,
                msg: "Deleted Successfully"
            })
        }
    });
}


//============================================  get faq list  =======================================

exports.getfaqlist = async (db, req, res) => {
    try {
        db.query(adminQueries.getfaqlist, function (error, result) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            if (result.length > 0) {
                return res.status(200).send({
                    success: true,
                    msg: "User List",
                    response: result
                })
            } else {
                return res.status(400).send({
                    success: false,
                    msg: "No Data"
                })
            }
        })

    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}


exports.addUserCollectionFeatured = async (db, req, res) => {
    var id = req.body.id;
    var is_featured = req.body.is_featured;
    if (!id) {
        return res.status(400).send({
            success: false,
            msg: "id required!! "
        });
    }
    if (is_featured === '1') {
        var is_featured1 = 1
    } else {
        var is_featured1 = 0
    }
    var updateData = {
        "is_featured": is_featured1
    }
    await db.query(adminQueries.addUserCollectionFeatured, [updateData, id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        } else {
            res.status(200).send({
                success: true,
                msg: "Added in featured!!"
            });
        }
    });
}

//============================================  get faq add  =======================================

exports.faqadd = async (db, req, res) => {
    var question = req.body.question
    var answer = req.body.answer
    try {
        var dataArr = {
            'question': question,
            'answer': answer
        }
        db.query(adminQueries.faqadd, [dataArr], function (error, result) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            return res.status(200).send({
                success: true,
                msg: "Faq Added!!",
            })

        })

    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}

//==========================================  faq delete  =========================================

exports.faqdelete = async (db, req, res) => {

    var id = req.body.id;

    await db.query(adminQueries.faqdelete, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Faq Deleted!! "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion failed!!"
            });
        }
    });
}


exports.getPrivacypolicy = async (db, req, res) => {
    await db.query(adminQueries.getPrivacypolicy, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Privacy policies of NXFT",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data found!!"
            });
        }
    });
}

exports.updateprivacyAndPolicy = async (db, req, res) => {
    var id = 1;
    var privacy_policy = req.body.privacy_policy;

    try {
        var arr = {
            'privacy_policy': privacy_policy
        }
        let updated = await db.query(adminQueries.updateprivacyAndPolicy, [arr, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated!!"
                });

            } catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}
exports.getTermsConditions = async (db, req, res) => {
    await db.query(adminQueries.getTermsConditions, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Privacy policies of NXFT",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data found!!"
            });
        }
    });
}

exports.deleteUser = async (db, req, res) => {

    var id = req.body.id;
    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "ID required!! "
        });
    }

    await db.query(adminQueries.deleteUser, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "User Blocked Successfully"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion failed!!"
            });
        }
    });
}


exports.activateUser = async (db, req, res) => {

    var id = req.body.id;
    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "ID required!! "
        });
    }

    await db.query(adminQueries.activateUser, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "User Unblocked Successfully"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion failed!!"
            });
        }
    });
}


exports.updateTermsConditions = async (db, req, res) => {
    var id = 1;
    var terms_conditions = req.body.terms_conditions;

    try {
        var arr = {
            'terms_conditions': terms_conditions
        }
        let updated = await db.query(adminQueries.updateTermsConditions, [arr, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated!!."
                });

            } catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}
exports.getAbout = async (db, req, res) => {
    await db.query(adminQueries.getAbout, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Privacy policies of NXFT",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data found!!"
            });
        }
    });
}

exports.updateAbout = async (db, req, res) => {
    var id = 1;
    var about = req.body.about;

    try {
        var arr = {
            'about': about
        }
        let updated = await db.query(adminQueries.updateAbout, [arr, id]);
        if (updated) {
            try {
                return res.status(200).send({
                    success: true,
                    msg: "Content updated!!"
                });

            } catch (e) {
                return res.status(500).send({
                    success: false,
                    msg: e
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                msg: "Content not update due to internal error"
            });
        }

    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "Content not update due to internal error"
        });
    }
}


exports.receiveWalletUpdate = async (db, req, res) => {

    var email = req.body.email;
    let receive_address = req.body.receive_address;

    if (!receive_address) {
        return res.status(400).send({
            success: false,
            msg: "Receive address required! "
        });
    }

    if (receive_address.substring(0, 2) != '0x') {
        return res.status(400).send({
            success: false,
            msg: "Public key not valid(Ex. 0x00192Fb...)!!",
        });
    }

    let receive_address_enc = await closeNFT(receive_address);

    let keys = {
        "receive_address": receive_address_enc
    }
    console.log(keys);
    db.query(adminQueries.updateWallet, [keys], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Receive address updated successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.getSettings = async (db, req, res) => {

    var email = req.body.email;
    if (!email) {
        return res.status(400).send({
            success: false,
            msg: "email required! "
        });
    }

    db.query(adminQueries.getSettings, async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            let receive_address = await openNFT(data[0].receive_address);
            let public_key = await openNFT(data[0].public_key);
            res.status(200).send({
                success: true,
                msg: "Receive address updated successfully",
                receive_address: receive_address,
                public_key: public_key,
                resale_charges: data[0].resale_charges,
                minting_fee: data[0].minting_fee,
                royalty_percent: data[0].royalty_percent,
                coin_value: data[0].coin_value,
                maxcoinpercentage: data[0].maxcoinpercentage,
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.adminWalletUpdate = async (db, req, res) => {

    var email = req.body.email;
    let public_key = req.body.public_key;
    let private_key = req.body.private_key;

    if (!public_key) {
        return res.status(400).send({
            success: false,
            msg: "public address required! "

        });
    }


    if (public_key.substring(0, 2) != '0x') {
        return res.status(400).send({
            success: false,
            msg: "Public key not valid(Ex. 0x00192Fb...)!!",
        });
    }

    let admin_address_enc = await closeNFT(public_key);
    let admin_private_enc = await closeNFT(private_key);
    let keys = {
        "public_key": admin_address_enc,
        "private_key": admin_private_enc
    }

    db.query(adminQueries.updateWallet, [keys], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Admin wallet updated successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.updateFee = async (db, req, res) => {

    var email = req.body.email;
    let minting_fee = req.body.minting_fee;
    let resale_charges = req.body.resale_charges;
    let royalty_percent = req.body.royalty_percent
    let coin_value = req.body.coin_value
    let maxcoinpercentage = req.body.maxcoinpercentage



    let keys = {
        "resale_charges": resale_charges,
        "royalty_percent": royalty_percent,
        "coin_value": coin_value,
        "maxcoinpercentage": maxcoinpercentage
    }

    db.query(adminQueries.updateWallet, [keys], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error : Server not responding please try again later! ",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Fee updated successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


















































































// Login User
exports.login = async (db, req, res) => {
    console.log("login");
    var email = req.body.email;
    var password = req.body.password;

    console.log(email);
    try {
        if (email == '') {
            return res.status(400).send({
                success: false,
                msg: "Email required!! "
            });
        }
        if (password == '') {
            return res.status(400).send({
                success: false,
                msg: "Password required!!"
            });
        }
        if (!validator.validate(email)) {
            return res.status(400).send({
                success: false,
                msg: "Enter a valid email address!!"
            });
        }


        db.query(adminQueries.getUsersEmail, email, async function (error, user) {
            //console.log(user);
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Unexpected error occured!!",
                    error
                });
            } else if (user.length == 0) {
                return res.status(400).send({
                    success: false,
                    msg: "No user found!!"
                });
            }

            else {
                var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
                if (user[0].password === hash) {

                    const jwtToken = jwt.sign({
                        email: req.body.email,
                        id: user[0].id,
                    }, config.JWT_SECRET_KEY, {
                        expiresIn: config.SESSION_EXPIRES_IN
                    })

                    return res.status(200).send({
                        success: true,
                        msg: "Login successfully!!",
                        Token: jwtToken,
                        data: {
                            id: user[0].id,
                            user_email: user[0].email,
                            username: user[0].username,
                        }
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        msg: "Password does not match!!"
                    });
                }

            }



        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err
        });
    }

}

exports.getFooter = async (db, req, res) => {

    await db.query(adminQueries.getFooter, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Footer details",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.updateFooter = async (db, req, res) => {

    var description = req.body.description;
    var email = req.body.email;
    var contact = req.body.contact;

    if (description == '') {
        return res.status(400).send({
            success: false,
            msg: "Description required!!"
        });
    }

    if (email == '') {
        return res.status(400).send({
            success: false,
            msg: "Email required!!"
        });
    }
    if (!validator.validate(email)) {
        return res.status(400).send({
            success: false,
            msg: "Enter a valid email address!!"
        });
    }
    if (contact == '') {
        return res.status(400).send({
            success: false,
            msg: "Contact required!!"
        });
    }
    if (contact.length == '') {
        return res.status(400).send({
            success: false,
            msg: "Contact number length must be 10 digit!!"
        });
    }


    await db.query(adminQueries.updateFooter, [description, email, contact], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Footer Updated",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.getWebContent = async (db, req, res) => {

    await db.query(adminQueries.getWebContent, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Web Content Details",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data!!"
            });
        }
    });
}

exports.updateWebContent = async (db, req, res) => {


    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        if (logo == '') {
            return res.status(400).send({
                success: false,
                msg: "Logo required!!"
            });
        }
        var favicon_upload = (!files.favicon) ? null : (!files.favicon.name) ? null : files.favicon;
        var logo_upload = (!files.logo) ? null : (!files.logo.name) ? null : files.logo;
        if (title == '') {
            return res.status(400).send({
                success: false,
                msg: "Title required!!"
            });
        }
        if (description == '') {
            return res.status(400).send({
                success: false,
                msg: "Description required!!"
            });
        }

        if (!favicon_upload) {
            var favicon = '';

        } else {
            var oldpath = files.favicon.path;

            var filePath = "./uploads/"
            let newfilename = filePath + files.favicon.name

            // Read the file
            await fs.readFile(oldpath, async function (err, data) {
                if (err) throw err;
                // Write the file
                await fs.writeFile(newfilename, data, function (err) {
                    if (err) throw err;

                });
            });
            var favicon = files.favicon.name;

        }
        if (!logo_upload) {
            var logo = '';
        } else {
            var oldpath = files.logo.path;
            var filePath = "./uploads/"
            let newfilename = filePath + files.logo.name

            // Read the file
            await fs.readFile(oldpath, async function (err, data) {
                if (err) throw err;
                // Write the file
                await fs.writeFile(newfilename, data, function (err) {
                    if (err) throw err;

                })
            });
            var logo = files.logo.name;
        }


        var title = fields.title;
        var description = fields.description;

        db.query(adminQueries.getWebContent, function (error, result) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            var webContent = {
                "favicon": favicon,
                "logo": logo,
                "title": title,
                "description": description
            }
            if (!favicon) {
                webContent.favicon = result[0].favicon;
            }
            if (!logo) {
                webContent.logo = result[0].logo;
            }

            db.query(adminQueries.updateWebContent, webContent, function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
                if (data) {
                    res.status(200).send({
                        success: true,
                        msg: "Web Content Updated",

                    });
                } else {
                    res.status(400).send({
                        success: false,
                        msg: "No data found!!"
                    });
                }
            });
        });
    });

}

exports.insertMarketPlace = async (db, req, res) => {

    try {

        var form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {

            if (item_image == '') {
                return res.status(400).send({
                    success: false,
                    msg: "Item image required!!"
                });
            }
            var item_image_upload = (!files.item_image) ? null : (!files.item_image.name) ? null : files.item_image;
            if (fields.title == '') {
                return res.status(400).send({
                    success: false,
                    msg: "Title required!!"
                });
            }
            if (fields.price == '') {
                return res.status(400).send({
                    success: false,
                    msg: "Price required!!"
                });
            }
            if (!item_image_upload) {
                var item_image = '';

            } else {
                var oldpath = files.item_image.path;

                var filePath = "./uploads/"
                let newfilename = filePath + files.item_image.name

                // Read the file
                await fs.readFile(oldpath, async function (err, data) {
                    if (err) throw err;
                    // Write the file
                    await fs.writeFile(newfilename, data, function (err) {
                        if (err) throw err;

                    });
                });
                var item_image = files.item_image.name;

            }
            var title = fields.title;
            var description = fields.description;
            var author = fields.author;
            var web_link = fields.web_link;
            var price = fields.price;
            var datetime = new Date();

            var users = {
                "title": title,
                "author": author,
                "description": description,
                "item_image": item_image,
                "web_link": web_link,
                "price": price,
                "datetime": datetime
            }
            db.query(adminQueries.insertMarketPlace, [users], function (error, result) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
                if (result) {
                    res.status(200).send({
                        success: true,
                        msg: "Inserted Successfully",
                    });
                } else {
                    res.status(200).send({
                        success: true,
                        msg: "Insertion Failed",
                    });
                }
            })
        });

    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err
        });
    }

}

exports.getMarketPlace = async (db, req, res) => {


    await db.query(adminQueries.getMarketPlace, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Market Places",
                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.listItem = async (db, req, res) => {
    let login_user_id = req.body.login_user_id;
    try {


        var qry = `Select i.id,i.nft_type as nft_type, ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.user_name as full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,i.datetime,i.description,itemLikeCount(ie.id) as like_count,isLiked(ie.id,${login_user_id}) as is_liked,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.user_collection_id as collection_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,concat('${config.mailUrl}backend/uploads/',i.local_image) as local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  and i.is_on_sale=1 order by id desc `;

        console.log(qry);
        await db.query(qry, function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data.length > 0) {
                res.status(200).send({
                    success: true,
                    response: data
                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "No data found!!"
                });
            }
        });
    } catch (ee) {
        return res.status(200).send({
            success: false,
            msg: "No Data",
            error: ee
        });
    }
}


exports.listAdminItem = async (db, req, res) => {

    var category_id = req.body.category_id;
    var limit = req.body.limit;

    if (!category_id) {
        return res.status(400).send({
            success: false,
            msg: "category_id required!!"
        });
    }
    if (!limit) {
        return res.status(400).send({
            success: false,
            msg: "limit required!!"
        });
    }

    var qry = `Select i.id,ie.id as item_edition_id, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,i.description,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.token_id,ie.price,coalesce(ie.start_date,ie.datetime) as start_date,i.end_date,ie.expiry_date,ie.edition_text,ie.edition_no,ie.is_sold,concat('${config.mailUrl}backend/infinity8_backend/uploads/',i.local_image) as local_image from item_edition as ie left join item as i on i.id=ie.item_id where (ie.owner_id=1 or (ie.owner_id in (select id from users where is_featured=1) and ie.is_sold=0 )) and i.is_active=1 and ie.is_sold=0 and ie.id in (select min(id) from item_edition group by item_id,owner_id,is_sold) and (ie.expiry_date >= now() or ie.expiry_date is null) and i.is_active=1`;

    if (category_id != '0') {
        if (category_id === '-1') {
            qry = qry + ' and ie.start_date>now() and ie.start_date is not null'
        } else {
            qry = qry + ' and i.item_category_id =' + category_id;
            qry = qry + ' and (ie.start_date<now() or ie.start_date is null)';
        }
    } else {
        qry = qry + ' and (ie.start_date<now() or ie.start_date is null)';
    }

    qry = qry + ' order by ie.id desc  ';

    if (limit != '0') {
        qry = qry + ' LIMIT ' + limit
    }

    //console.log(qry);
    await db.query(qry, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,

                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.listSingleItem = async (db, req, res) => {

    var item_edition_id = req.body.item_edition_id;
    await db.query(adminQueries.listSingleItem, [item_edition_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,

                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.insertCategory = async (db, req, res) => {

    var name = req.body.name;
    var email = req.body.email;
    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required!! "
        });
    }


    var users = {
        "name": name,
    }

    await db.query(adminQueries.insertCategory, [users], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Category Added!!"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Insertion failed!!"
            });
        }
    });
}

exports.getCategory = async (db, req, res) => {
    await db.query(adminQueries.Category, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Category Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}
exports.getDigitalCategory = async (db, req, res) => {
    await db.query(adminQueries.getDigitalCategory, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            return res.status(200).send({
                success: true,
                msg: "Category Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.getUserDigitalCategory = async (db, req, res) => {
    await db.query(adminQueries.getUserDigitalCategory, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            return res.status(200).send({
                success: true,
                msg: "Category Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.getUserRealEstateCategory = async (db, req, res) => {
    await db.query(adminQueries.getUserRealEstateCategory, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Category Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.getRealEstateCategory = async (db, req, res) => {
    await db.query(adminQueries.getRealEstateCategory, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Category Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.singleCategory = async (db, req, res) => {

    var id = req.body.id;

    await db.query(adminQueries.singleCategory, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Category Single Item Details",
                response: data[0]
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}
exports.getNftType = async (db, req, res) => {
    await db.query(adminQueries.getNftType, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "NFT type Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}
exports.updateCategory = async (db, req, res) => {

    var id = req.body.id;
    var name = req.body.name;
    var nft_type_id = req.body.nft_type_id;

    if (name == '') {
        return res.status(400).send({
            success: false,
            msg: "name required!! "
        });
    }
    var users = {
        "name": name,
        "nft_type_id": nft_type_id
    }

    await db.query(adminQueries.updateCategory, [users, id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Category Item Updated Successfully "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Updation failed!!"
            });
        }
    });
}

exports.addFeatured = async (db, req, res) => {
    var user_id = req.body.user_id;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required!! "
        });
    }
    var updateData = {
        "is_featured": 1
    }
    await db.query(adminQueries.updateUser, [updateData, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        else {
            res.status(200).send({
                success: true,
                msg: "User Updated!!"
            });
        }
    });
}

exports.removeFeatured = async (db, req, res) => {
    var user_id = req.body.user_id;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required!! "
        });
    }
    var updateData = {
        "is_featured": 0
    }
    await db.query(adminQueries.updateUser, [updateData, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        else {
            res.status(200).send({
                success: true,
                msg: "User Updated!!"
            });
        }
    });
}


exports.showNFT = async (db, req, res) => {
    var item_id = req.body.item_id;
    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "item_id required!! "
        });
    }
    var updateData = {
        "is_active": 1
    }
    await db.query(adminQueries.updateItem, [updateData, item_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        else {
            res.status(200).send({
                success: true,
                msg: "NFT Unhide!!"
            });
        }
    });
}

exports.hideNFT = async (db, req, res) => {
    var item_id = req.body.item_id;
    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "item_id required!! "
        });
    }
    var updateData = {
        "is_active": 0
    }
    await db.query(adminQueries.updateItem, [updateData, item_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        else {
            res.status(200).send({
                success: true,
                msg: "NFT Hide!!"
            });
        }
    });
}


exports.deleteCategory = async (db, req, res) => {

    var id = req.body.id;

    await db.query(adminQueries.deleteCategory, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Category Deleted!!"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion failed!!"
            });
        }
    });
}

/* -------------------Insert Item -------------------------*/

exports.insertItem = async (db, req, res) => {

    var name = req.body.name;
    var description = req.body.description;
    var image = req.body.image;
    var file_type = req.body.file_type;
    //  var owner = req.body.owner;
    var item_category_id = req.body.item_category_id;
    var price = req.body.price;
    var sell_type = req.body.sell_type;
    var user_collection_id = req.body.user_collection_id;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var expiry_date = req.body.expiry_date;
    var image1 = req.body.image1;

    var quantity = (!req.body.quantity || req.body.quantity == 0) ? 1 : req.body.quantity;
    var ip = null;
    var datetime = new Date();
    var image_low = req.body.image;
    //   if(file_type==='image'){
    var recCompress = await ipfsCompress.compressImages(["https://nxft.mypinata.cloud/ipfs/" + image], file_type);
    if (recCompress.success == false) {
        // return res.status(400).send({
        //     success: false,
        //     msg: "Image compress issue "
        // });
        var image_low = image;
    } else {
        var image_low = recCompress.imageHash[0];
    }
    //  return res.json({
    //     image_low:image_low,
    //     image:image
    //  })       
    //}
    if (!name) {
        return res.status(400).send({
            success: false,
            msg: "name required!! "
        });
    }
    if (!image) {
        return res.status(400).send({
            success: false,
            msg: "image required!! "
        });
    }
    // if (!owner) {
    //     return res.status(400).send({
    //         success: false,
    //         msg: "owner required!! "
    //     });
    // }
    // if (!token_id) {
    //     return res.status(400).send({
    //         success: false,
    //         msg: "token_id required "
    //     });
    // }
    if (!price) {
        return res.status(400).send({
            success: false,
            msg: "price required!! "
        });
    }

    if (!quantity) {
        return res.status(400).send({
            success: false,
            msg: "quantity required!! "
        });
    }

    var users = {
        "name": name,
        "description": description,
        "image": image_low,
        "image_original": image,
        "owner": "Headlinesales",
        "item_category_id": item_category_id,
        "price": price,
        "sell_type": sell_type,
        "created_by": 1,
        "owner_id": 1,
        "user_collection_id": user_collection_id,
        "start_date": start_date,
        "end_date": end_date,
        "expiry_date": expiry_date,
        "is_on_sale": 1,
        "quantity": quantity,
        "ip": ip,
        "datetime": datetime,
        "file_type": file_type
    }

    await db.query(adminQueries.insertItem, [users], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured in insertItem!!",
                error
            });
        }

        /**---------------------------IPFS Json ---------------------------------- */
        var additem = {
            "name": name,
            "description": description,
            "image": 'ipfs://' + image
        }
        var userfile = 'item_'.concat(data.insertId, '.json');
        console.log(userfile);


        fs.writeFile(`./metadata/${userfile}`, JSON.stringify(additem), async (err, fd) => {

            // Checking for errors
            if (err) throw err;

            console.log("Done writing"); // Success




            const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

            let formdata = new FormData();

            console.log("Done writing"); // Success
            formdata.append('file', fs.createReadStream('./metadata/' + userfile));


            //   console.log(fs.createReadStream('./metadata/'+userfile)); // Success
            var filedata = await axios.post(url,
                formdata,
                {
                    maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                    headers: {
                        // 'Content-Type' : `application/json;boundary=${formdata._boundary}`,
                        'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
                        'pinata_api_key': '105327714c080a01a4b5',
                        'pinata_secret_api_key': 'e18cf3c1a8a7376852a4674735896bda9b7870cb4e11cc05c9e614711f955b35'
                    }
                }
            )
            console.log(filedata.data.IpfsHash);

            db.query(marketplaceQueries.updatemeta, [filedata.data.IpfsHash, data.insertId], (error, data235) => {
                //console.log(data235);
            })




            /*-------------------------------------------------------------------------------------*/


            /*-------------------------------------------------------------------------------------*/
            for (let i = 0; i < image1.length; i++) {

                if (i >= 0) {

                    var insertData = {
                        "item_id": data.insertId,
                        "name": image1[i],
                        "ip": null,
                        "datetime": new Date()
                    }
                    await db.query(marketplaceQueries.additemimages, [insertData])
                };

            }




            /*  -----------------------------------Insertinto Edition */

            for (var i = 1; i <= quantity; i++) {


                var item_ed = {
                    "edition_text": `Edition ${i} of ${quantity}`,
                    "edition_no": i,
                    "item_id": data.insertId,
                    "is_sold": 0,
                    "owner_id": 1,
                    "user_collection_id": user_collection_id,
                    "start_date": start_date,
                    "end_date": end_date,
                    "expiry_date": expiry_date,
                    "price": price,
                    "ip": null,
                    "datetime": new Date()
                };

                await db.query(adminQueries.insertEdition, [item_ed])
            }
            /* ---------------------------------------------------------- */
            db.query(adminQueries.getSettings, async function (error, settingData) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error : Server not responding please try again later! ",
                        error
                    });
                }

                if (data) {
                    // create NFT and update into table /
                    var apiData = await openNFT(settingData[0].public_key);
                    var apiData2 = await openNFT(settingData[0].private_key);
                    console.log(({
                        "from_address": `${apiData}`,
                        "from_private_key": `${apiData2}`,
                        "contract_address": `${config.contractAddress}`,
                        "to_address": `${config.contractOwnerAddress}`,
                        "MetaDataHash": `${filedata.data.IpfsHash}`,
                        "TokenName": `${name}`,
                        "TokenId": `${data.insertId}`,
                        "totalSupply": `${quantity}`
                    }));
                    const response1 = await fetch(`${config.blockchainApiUrl}mint`, {
                        method: 'POST', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "from_address": `${apiData}`,
                            "from_private_key": `${apiData2}`,
                            "contract_address": `${config.contractAddress}`,
                            "to_address": `${config.contractOwnerAddress}`,
                            "MetaDataHash": `${filedata.data.IpfsHash}`,
                            "TokenName": `${name}`,
                            "TokenId": `${data.insertId}`,
                            "totalSupply": `${quantity}`
                        })
                    });
                    const data1 = await response1.json();
                    //console.log(data1);
                    if (!data1.hash) {
                        return res.status(400).send({
                            success: false,
                            msg: "Error occured in mint NFT!!",
                            error
                        });
                    }
                    //console.log(data1);
                    var updateData = {
                        "token_hash": data1.hash,
                        "token_id": data.insertId
                    }
                    await db.query(adminQueries.updateItem, [updateData, data.insertId], async function (error, data) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured in update item!! ",
                                error
                            });
                        }
                    })

                    res.status(200).send({
                        success: true,
                        msg: "Insert Item in Category Successfully "
                    });
                } else {
                    res.status(200).send({
                        success: false,
                        msg: "Insertion failed!!"
                    });
                }
            })
        });
    });
}



exports.getAdminItem = async (db, req, res) => {

    await db.query(adminQueries.getAdminItem, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.getItem = async (db, req, res) => {

    await db.query(adminQueries.getItem, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Item Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.updateWallet = async (db, req, res) => {
    var user_id = req.body.user_id;
    var public = req.body.public;
    var private = req.body.private;

    var updateData = {
        public: public,
        private: private
    }


    await db.query(adminQueries.updateWallet, [updateData, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Wallet Updated!!",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.updateItem = async (db, req, res) => {

    var item_id = req.body.item_id;
    var name = req.body.name;
    var description = req.body.description;
    var image = req.body.image;
    var file_type = req.body.file_type
    var item_category_id = req.body.item_category_id;
    var price = req.body.price;
    var expiry_date = req.body.expiry_date;
    var start_date = req.body.start_date;

    if (!name) {
        return res.status(400).send({
            success: false,
            msg: "name required!! "
        });
    }
    if (!image) {
        return res.status(400).send({
            success: false,
            msg: "image required!! "
        });
    }
    if (!file_type) {
        return res.status(400).send({
            success: false,
            msg: "file_type required!! "
        });
    }
    if (!price) {
        return res.status(400).send({
            success: false,
            msg: "Price required!! "
        });
    }
    await db.query(adminQueries.getItem, async function (error, result) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        var updateData = {
            "name": name,
            "description": description,
            "image": image,
            "file_type": file_type,
            "file_type": file_type,
            "item_category_id": item_category_id,
            "price": price,
            "expiry_date": expiry_date,
            "start_date": start_date
        }
        if (!image) {
            users.image = result[0].image;
        }

        await db.query(adminQueries.updateItem, [updateData, item_id], function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            var qry = `update item_edition set price=${price} where item_id =${item_id} and is_sold=0`;
            db.query(qry);

            if (data) {
                res.status(200).send({
                    success: true,
                    msg: "Item Updated Successfully "
                });
            } else {
                res.status(200).send({
                    success: false,
                    msg: "Updation failed!!"
                });
            }
        });
    });
}

exports.deleteItem = async (db, req, res) => {

    var item_edition_id = req.body.item_edition_id;
    if (!item_edition_id) {
        return res.status(400).send({
            success: false,
            msg: "item_edition_id required!! "
        });
    }

    await db.query(adminQueries.deleteItem, [item_edition_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "You can't delete NFT purchased by other or in bid process!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Item Delete Successfully"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion failed!!"
            });
        }
    });
}


exports.getUsers = async (db, req, res) => {
    await db.query(adminQueries.getUsers, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Users Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    });
}

exports.getRealEstateUsers = async (db, req, res) => {

    await db.query(adminQueries.getRealEstateUsers, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Real estate user Detail!!",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.getTelentUsers = async (db, req, res) => {

    await db.query(adminQueries.getTelentUsers, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Telent User Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}





exports.dashboardItem = async (db, req, res) => {

    await db.query(adminQueries.dashItem, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Item Details",
                response: data[0]
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.getProfilePic = async (db, req, res) => {
    var email = req.body.email;

    await db.query(adminQueries.getProfile, [email], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Profile Pic",
                response: data[0]
            });
        } else {
            res.status(204).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.insertProfilePic = async (db, req, res) => {


    var email = req.body.email;
    var profile_pic = (!req.files['profile_pic']) ? null : req.files['profile_pic'][0].filename;


    db.query(adminQueries.getProfile, [email], function (error, result1) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }

        if (!profile_pic) {
            profile_pic = result1[0].profile_pic;
        }



        db.query(adminQueries.updateProfile, [profile_pic, email], function (error, result) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            if (result) {
                res.status(200).send({
                    success: true,
                    msg: "Update Profile Successfully",
                });
            } else {
                res.status(200).send({
                    success: true,
                    msg: "update Profile Failed",
                });
            }
        })
    });


}



exports.changePassword = async (db, req, res) => {

    var email = req.body.email;
    var currentPassword = req.body.currentPassword;
    var password = req.body.password;
    var password2 = req.body.password2;

    try {
        if (currentPassword == '') {
            return res.status(400).send({
                success: false,
                msg: "Current password required!! "
            });
        }

        if (password == '') {
            return res.status(400).send({
                success: false,
                msg: "New password required!! "
            });
        }
        if (password2 == '') {
            return res.status(400).send({
                success: false,
                msg: "Re-type password required!! "
            });
        }
        if (password != password2) {
            return res.status(400).send({
                success: false,
                msg: "New password and re-type password not match!!"
            });
        }
        if (password.length < 6) {
            return res.status(400).send({
                success: false,
                msg: "password length should be 6 characters or more!!"
            });
        }



        db.query(adminQueries.getPassword, [email], function (error, result) {

            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured in getPassword",
                    error
                });
            }
            // console.log('result',result);
            const hashpassword = CryptoJS.SHA256(currentPassword).toString(CryptoJS.enc.Hex);
            if (result[0].password == hashpassword) {

                const newpassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

                db.query(adminQueries.updatepassword, [newpassword, email], function (error, result) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in updatepassword!!",
                            error
                        });
                    }
                    if (result) {
                        return res.status(200).send({
                            success: true,
                            msg: "Password Changed Successfully"
                        })
                    } else {
                        return res.status(400).send({
                            success: false,
                            msg: "Password Changed Failed due to Error"
                        })
                    }
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Current Password Wrong"
                })

            }
        });
    }
    catch (err) {
        //  console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err
        });
    }

}


exports.getRealEstateImage = async (db, req, res) => {

    await db.query(adminQueries.getRealEstateImage, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Real estate images!!",
                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.updateWebImage = async (db, req, res) => {

    var id = req.body.id;
    var slider1 = (!req.files['slider1']) ? null : req.files['slider1'][0].filename;
    var slider2 = (!req.files['slider2']) ? null : req.files['slider2'][0].filename;
    var slider3 = (!req.files['slider3']) ? null : req.files['slider3'][0].filename;
    var text1 = req.body.text1;
    var text2 = req.body.text2;
    var text3 = req.body.text3;
    var realEstateImage = (!req.files['realEstateImage']) ? null : req.files['realEstateImage'][0].filename;
    var logo = (!req.files['logo']) ? null : req.files['logo'][0].filename;
    var favicon = (!req.files['favicon']) ? null : req.files['favicon'][0].filename;

    await db.query(adminQueries.getWebImage, async function (error, result1) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        if (!slider1) {
            slider1 = result1[0].slider1;
        }
        if (!slider2) {
            slider2 = result1[0].slider2;
        }
        if (!slider3) {
            slider3 = result1[0].slider3;
        }
        if (!text1) {
            text1 = result1[0].text1;
        }
        if (!text2) {
            text2 = result1[0].text2;
        }
        if (!text3) {
            text3 = result1[0].text3;
        }
        if (!realEstateImage) {
            realEstateImage = result1[0].realEstateImage;
        }
        if (!logo) {
            logo = result1[0].logo;
        }
        if (!favicon) {
            favicon = result1[0].favicon;
        }
        var users = {
            "slider1": slider1,
            "slider2": slider2,
            "slider3": slider3,
            "logo": logo,
            "favicon": favicon,
            "realEstateImage": realEstateImage,
            "text1": text1,
            "text2": text2,
            "text3": text3
        }

        await db.query(adminQueries.updateWebImage, [users, id], function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data) {
                res.status(200).send({
                    success: true,
                    msg: "Web Images Updated",

                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "No data found!!"
                });
            }
        });
    });
}


exports.getWebImage = async (db, req, res) => {

    await db.query(adminQueries.getWebImage, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            const t1 = data[0].text1.replace(/(<([^>]+)>)/gi, "");
            const t2 = data[0].text2.replace(/(<([^>]+)>)/gi, "");
            const t3 = data[0].text3.replace(/(<([^>]+)>)/gi, "");
            res.status(200).send({
                success: true,
                msg: "Web Images",
                response: data,
                id: data[0].id,
                slider1: data[0].slider1,
                slider2: data[0].slider2,
                slider3: data[0].slider3,
                text1: t1,
                text2: t2,
                text3: t3,
                logo: data[0].logo
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.updateRealEstateImage = async (db, req, res) => {

    var id = req.body.id;
    var slider1 = (!req.files['slider1']) ? null : req.files['slider1'][0].filename;
    var slider2 = (!req.files['slider2']) ? null : req.files['slider2'][0].filename;
    var slider3 = (!req.files['slider3']) ? null : req.files['slider3'][0].filename;
    var text1 = req.body.text1;
    var text2 = req.body.text2;
    var text3 = req.body.text3;

    await db.query(adminQueries.getRealEstateImage, async function (error, result1) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        if (!slider1) {
            slider1 = result1[0].slider1;
        }
        if (!slider2) {
            slider2 = result1[0].slider2;
        }
        if (!slider3) {
            slider3 = result1[0].slider3;
        }

        if (!text1) {
            text1 = result1[0].text1;
        }
        if (!text2) {
            text2 = result1[0].text2;
        }
        if (!text3) {
            text3 = result1[0].text3;
        }

        var users = {
            "slider1": slider1,
            "slider2": slider2,
            "slider3": slider3,
            "text1": text1,
            "text2": text2,
            "text3": text3
        }
        //console.log(users)
        await db.query(adminQueries.updateRealEstateImage, [users, id], function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data) {
                res.status(200).send({
                    success: true,
                    msg: "Real estate images and text updated!!",

                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "No data found!!"
                });
            }
        });
    });
}


exports.addUserNftFeatured = async (db, req, res) => {
    var id = req.body.id;
    var is_featured = req.body.is_featured;
    console.log('is_featured', is_featured)
    if (!id) {
        return res.status(400).send({
            success: false,
            msg: "id required!! "
        });
    }
    var updateData = {
        "is_featured": is_featured
    }
    await db.query(adminQueries.addUserNftFeatured, [updateData, id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        } else {
            res.status(200).send({
                success: true,
                msg: "Added in featured!!"
            });
        }
    });
}
/* -------------------End Item -------------------------*/


//---------------------------------addadmincollection--------------------//
exports.insertadminCollection = async (db, req, res) => {
    var profile_pic = (!req.files['profile_pic']) ? null : req.files['profile_pic'][0].filename;
    var banner = (!req.files['banner']) ? null : req.files['banner'][0].filename;
    var name = req.body.name;
    var description = req.body.description;
    var user_id = req.body.user_id;
    var website = req.body.website;
    var games_category = req.body.games_category;

    // if(!games_category){
    //     res.status(400).send({
    //         success: false,
    //         msg: "Games category required!"
    //     });        
    // }

    var dataArr = {
        "user_id": user_id,
        "name": name,
        "description": description,
        "profile_pic": profile_pic,
        "banner": banner,
        "website": website,
        "facebook": req.body.facebook,
        "insta": req.body.insta,
        "telegram": req.body.telegram,
        "twitter": req.body.twitter,
        "discord": req.body.discord,
    }
    await db.query(adminQueries.insertadminCollection, [dataArr], function (error, data) {
        if (error) {
            console.log(error);
            return res.status(400).send({
                success: false,
                msg: "Something want wrong, Please try again!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Collection created successfully!"
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something want wrong, Please try again!"
            });
        }
    });
}
//===============================getadmin collection===========================================//
exports.getAdminCollection = async (db, req, res) => {
    // console.log("in getAllUserCollection");
    await db.query(adminQueries.getadmincollection, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "All user Collection Detail!!",
                response: data
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}

//=========================updateadmin collection=======================//



exports.updateUserCollection = async (db, req, res) => {
    // console.log("in updateUserCollection");
    var user_id = req.body.user_id;
    var collection_id = req.body.collection_id;
    var name = req.body.name;
    var description = req.body.description;

    var userColl = {
        name: name,
        description: description,
        ip: "null",
        datetime: new Date()
    }

    await db.query(adminQueries.updateadminCollection, [userColl, collection_id, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            db.query(adminQueries.getSingleadminCollection, [collection_id, user_id], function (error, data1) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }

                res.status(200).send({
                    success: true,
                    msg: "User Collection Updated",
                    responce: data1[0]

                });
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}

exports.deleteUser = async (db, req, res) => {

    var id = req.body.id;
    if (id == '') {
        return res.status(400).send({
            success: false,
            msg: "ID required!! "
        });
    }

    await db.query(adminQueries.deleteUser, [id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "User Blocked Successfully"
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion failed!!"
            });
        }
    });
}


exports.addBulkNftByAdmin = async (db, req, res) => {
    console.log("in addBulkNftByAdmin");
    var folderName = Math.random().toString(36).slice(2);
    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        var zip_file_upload = (!files.zip_file) ? null : (!files.zip_file.name) ? null : files.zip_file;
        if (!zip_file_upload) {
            return res.status(400).send({
                success: false,
                msg: "Please select zip file!! "
            });
        } else {
            var dir = './uploads/' + folderName
            fs.mkdirSync(dir);
            var oldpath = files.zip_file.path;
            var filePath = dir + '/'
            let newfilename = filePath + files.zip_file.name
            await fs.readFile(oldpath, async function (err, data) {
                if (err) {
                    return res.status(400).send({
                        success: false,
                        msg: "Please select zip file!! "
                    });
                }
                await fs.writeFile(newfilename, data, function (err) {
                    if (err) {
                        return res.status(400).send({
                            success: false,
                            msg: "Please select zip file!! "
                        });
                    }
                    var zip = new AdmZip(newfilename);
                    zip.extractAllTo(filePath);
                });
            });
        }


        var excel_file_upload = (!files.excel_file) ? null : (!files.excel_file.name) ? null : files.excel_file;
        if (!excel_file_upload) {
            return res.status(400).send({
                success: false,
                msg: "Please select excel file!! "
            });
        } else {
            var dir = './uploads/' + folderName
            var oldpath = files.excel_file.path;
            var filePath = dir + '/'
            let newExlFilename = filePath + files.excel_file.name
            await fs.readFile(oldpath, async function (err, data) {
                if (err) {
                    return res.status(400).send({
                        success: false,
                        msg: "Something want wrong, Please try again!"
                    });
                }
                await fs.writeFile(newExlFilename, data, function (err) {
                    if (err) {
                        return res.status(400).send({
                            success: false,
                            msg: "Something want wrong, Please try again!"
                        });
                    } else {
                        var excel_file = files.excel_file.name
                        if (excel_file) {
                            var filepath = path.join('uploads/' + folderName + '/', excel_file);
                            const file = reader.readFile(filepath)
                            const sheets = file.SheetNames
                            // db.query(marketplaceQueries.getSingleCollectionDetails, [fields.user_collection_id], async function (error, userCollections) {
                            //     if (error) {
                            //         return res.status(400).send({
                            //             success: false,
                            //             msg: "Something want wrong, Please try again!"
                            //         });
                            //     }

                            //     var totalNftCount = userCollections[0].totalNft + sheets.length
                            //     if (userCollections[0].max_nft_supply < totalNftCount) {
                            //         return res.status(400).send({
                            //             success: false,
                            //             msg: "Collection limit exceeded!!"
                            //         });
                            //     } else {
                            const temp1 = reader.utils.sheet_to_json(
                                file.Sheets[file.SheetNames[0]])

                            if (temp1.length == '0') {
                                return res.status(400).send({
                                    success: false,
                                    msg: "No data found in excel file!!"
                                });
                            } else {

                                var title = Object.keys(temp1[0])[0]
                                if (title != 'Title') {
                                    return res.status(400).send({
                                        success: false,
                                        msg: "Excel File not valid Please select valid file!!"
                                    });
                                }

                                var createFolderData = {
                                    'folder_name': folderName
                                }
                                db.query(marketplaceQueries.createFolder, [createFolderData], async function
                                    (error, createFolderRes) {

                                    await db.query(adminQueries.getSettings, async function (error, commissionPercent) {
                                        if (error) {

                                            return res.status(400).send({
                                                success: false,
                                                msg: "error occured in item insert",
                                                error
                                            });
                                        }

                                        var p = 1;
                                        for (let i = 0; i < sheets.length; i++) {
                                            const temp = reader.utils.sheet_to_json(
                                                file.Sheets[file.SheetNames[i]]);


                                            temp.forEach(async (resExl) => {

                                                if (resExl.Description) {
                                                    var desc = resExl.Description;
                                                    var desc1 = desc.substring(0, 60);
                                                } else {
                                                    var desc1 = ""
                                                }



                                                var singleData = {
                                                    'bulk_nft_master_id': createFolderRes.insertId,
                                                    'name': resExl.Title,
                                                    'description': desc1,
                                                    "image": resExl.Image,
                                                    "image_original": resExl.Image,
                                                    "file_type": 'image',
                                                    "item_category_id": fields.item_category_id,
                                                    "user_collection_id": fields.user_collection_id,
                                                    "start_date": resExl.start_date,
                                                    "price": resExl.price,
                                                    "owner_id": fields.user_id,
                                                    "created_by": fields.user_id,
                                                    "sell_type": resExl.sell_type,
                                                    "expiry_date": resExl.expiry_date,
                                                    "quantity": resExl.quantity,
                                                    "productId": resExl.productId,
                                                    "local_image": resExl.Image,
                                                    "metadata": resExl.metadata,
                                                    "external_link": resExl.external_link,
                                                    "coin_percentage": resExl.coin_percentage,
                                                    "unlockable_content": resExl.unlockable_content,
                                                    "nft_type": resExl.nft_type,
                                                    "address": resExl.user_address,
                                                    "royalty_percent": resExl.royalty_percentage,
                                                    "commission_percent": commissionPercent[0].commission_percent,
                                                    "approve_by_admin": 1,
                                                    "is_on_sale": 1

                                                }

                                                var t = 1;

                                                for (var s = 3; s < 1500; s++) {
                                                    var attr = Object.keys(resExl)
                                                 
                                                    if (attr[s] != 'attributes_name_' + t) {
                                                        break
                                                    }
                                                    var key1 = attr[s]
                                                     s = s + 1
                                                    console.log('attr1111111111111',attr[s],key1)

                                                   
                                                    if (attr[s] != 'attributes_value_' + t) {
                                                        break
                                                    }
                                                 

                                                


                                                    db.query(marketplaceQueries.insertItem, [singleData], async function (error, data) {

                               



                                                        if (error) {
                                                            return res.status(400).send({
                                                                success: false,
                                                                msg: "Something want wrong, Please try again!!"
                                                            });
                                                        } else {


                                                            var value = attr[s]
                                                            attrArr = {
                                                                'item_id': data.insertId,
                                                                'type': resExl[key1],
                                                                'value': resExl[value]
                                                            }
                                                         

                                                    console.log('attr22222222222222',resExl[key1],resExl[value])

                                                            await db.query(marketplaceQueries.insertItemAttr, [attrArr]);

                                                            /*  -----------------------------------Insertinto Edition */

                                                            for (var i = 1; i <= resExl.quantity; i++) {
                                                                console.log('1111');

                                                                var item_ed = {
                                                                    "edition_text": `${i} of ${resExl.quantity}`,
                                                                    "edition_no": i,
                                                                    "item_id": data.insertId,
                                                                    "is_sold": 0,
                                                                    "owner_id": fields.user_id,
                                                                    "user_collection_id": fields.user_collection_id,
                                                                    "start_date": resExl.start_date,
                                                                    "end_date": resExl.end_date,
                                                                    "expiry_date": resExl.expiry_date,
                                                                    "user_address": resExl.user_address,
                                                                    "price": resExl.price,
                                                                    "ip": null,
                                                                    "datetime": new Date()
                                                                };



                                                                await db.query(marketplaceQueries.insertEdition, [item_ed])
                                                            }
                                                            console.log('InsertId:', data.insertId);
                                                            var updateData = {
                                                                "token_id": data.insertId
                                                            }
                                                            await db.query(adminQueries.updateItem, [updateData, data.insertId])

                                                           
                                                            p++;
                                                            if (p == sheets.length) {
                                                                return res.status(200).send({
                                                                    success: true,
                                                                    msg: "NFTs data imported successfully!!"
                                                                });
                                                            }

                                                        }
                                                    })
                                                }

                                            })

                                        }
                                    })
                                })
                            }
                            // }

                            // })
                        } else {
                            return res.status(400).send({
                                success: false,
                                msg: "Please select excel file!! "
                            });
                        }
                    }
                });
            });
        }


    });

}


exports.getBulkNFT = async (db, req, res) => {
    let user_id = req.body.user_id;
    await db.query(adminQueries.getBulkNFT,[user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Bulk NFT Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data Found"
            });
        }
    });
}

exports.getLocalImageHash = async (db, req, res) => {
    console.log("in getLocalImageHash");
    var localImage = req.body.localImage
    var id = req.body.id
    console.log(localImage);

    // return res.status(200).send({
    //     success: true, 
    //     msg: "Data get successfully!!",
    //     response: "Qmd4VdHiTrCn1dvYyC12ZB793khKgpovZ31VXcydNUYP3m"
    // });

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let formdata = new FormData();
    formdata.append('file', fs.createReadStream(localImage))
  

    const response2 = await fetch(url, {
        method: 'POST', headers: {
            // 'Content-Type' : `application/json;boundary=${formdata._boundary}`,
            'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
            'pinata_api_key': '105327714c080a01a4b5',
            'pinata_secret_api_key': 'e18cf3c1a8a7376852a4674735896bda9b7870cb4e11cc05c9e614711f955b35'
       },
        body: formdata
    });
    const filedata = await response2.json();
    console.log('file',filedata)
    if (filedata.IpfsHash) {
        let data  ={
            image : filedata.IpfsHash
        }
        await db.query(adminQueries.updateipfshash,[data,id])
        
        return res.status(200).send({
            success: true,
            msg: "Data get successfully!!",
            response: filedata.IpfsHash
        });
    } else {
        return res.status(400).send({
            success: false,
            msg: "Error occured!!"
        });
    }
}


exports.getBankDetailinAdmin = async (db, req, res) => {
    await db.query(adminQueries.getbankdetailinadmin, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured!!",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Get Bank Details",
                response: data
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "No Data Found"
            });
        }
    });
}


exports.updateBankAccountinadmin = async (db, req, res) => {

    let user_id = req.body.user_id;
    let account_id = req.body.account_id;

    try{
    let data1 ={
        account_id: account_id
    }


    await db.query(adminQueries.updateBankAccountinadmin,[data1,user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error Occured!!",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Account id updated Successfully ! ",
            });
        } 
    });
}catch(err){
    return res.status(400).send({
        success: false,
        msg: "Error occured!!"
    });
}
}