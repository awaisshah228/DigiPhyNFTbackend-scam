const CryptoJS = require("crypto-js");
var fetch = require('node-fetch');
const config = require('../config');
var validator = require("email-validator");
var ipfsCompress = require('./ipfsCompress/imagecompress');
var pgpEncryption = require('./pgpEncription/pgpEncryption');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const axios = require('axios');
var nodemailer = require('nodemailer')
const key = require('../mail_key.json');
var speakeasy = require('speakeasy');
/* stripe includes*/
const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
require("dotenv").config();
const stripe = require("stripe")(`${config.stripe_key}`);
const bodyParser = require("body-parser");
const cors = require("cors");
var FormData = require('form-data');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var keySize = 256;
var iterations = 100;
const { base64encode, base64decode } = require('nodejs-base64');
var reverse = require('reverse-string');
/*-------------------*/

const marketplaceQueries = require("../services/marketplaceQueries");
const adminQueries = require("../services/adminQueries");
const { json } = require("body-parser");
const { compileFunction } = require("vm");




const mysql = require('mysql2');
const { JWT_SECRET_KEY } = require("../config");
const { end } = require("../utils/connection");
// create the pool
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
// query database using promises
var emailActivity = require('./emailActivity');
const { log } = require("console");

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
    console.log("code= ", code);
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
exports.test = async (db, req, res) => {
    console.log("in test");
    var apiData = await openNFT(config.apiKey);

    res.send(apiData);
}

exports.testmail = async (id, name) => {

    emailActivity.Activity('amit.espsofttech@gmail.com', 'test mail', 'test mail', 'fdsfsdf', 'fdsfsdfdsf');
}

exports.swapDigiphyCoin = async (db, req, res) => {
    console.log("in swapDigiphyCoin");

    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var from_address = req.body.from_address;
    var to_address = req.body.to_address;
    var hash = req.body.hash;
    var token = req.body.token;
    var payment_currency = req.body.payment_currency;
    var payment_currency_amount = req.body.payment_currency_amount;
    var currency = req.body.currency;

    var transaction = {
        "user_id": user_id,
        "transaction_type_id": '13',
        "amount": 0,
        "from_address": from_address,
        "to_address": to_address,
        "hash": hash,
        "token": token,
        "payment_currency": payment_currency,
        "payment_currency_amount": payment_currency_amount,
        "currency": currency,
        "status": 1
    }

    await db.query(marketplaceQueries.insertTransaction, [transaction], async function (error, trxdata) {

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured in insertTransaction!!",
                error
            });
        }
        if (trxdata) {
            return res.status(200).send({
                success: true,
                msg: "Coin purchased successfully!! "

            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }

    });
}










































































exports.imageSave = async (db, req, res) => {

    var limit = 1
    var qry = `select * from item where image is not null and local_image is null ORDER BY id`;
    await db.query(qry, async function (error, data) {
        if (error) {
            // https://ipfs.io/ipfs/QmWBB2sY9CYKehoKRmjhZgJ7UHhrFNfBjDKzcToM1S7yTQ
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }


        for (var i = 0; i < data.length; i++) {


            var img = data[i].image;
            const resData = await ipfsCompress.compressImages1('https://ipfs.io/ipfs/' + img);

            let local_image = resData.images[0];
            await db.query(`UPDATE item set local_image='${local_image}' WHERE id = ${data[i].id}`);
        }
    });
}

exports.getJWTToken = async (db, req, res) => {
    console.log("in getJWTToken");
    const jwtToken = jwt.sign({
        email: req.body.email,
        id: req.body.user_id,
    }, config.JWT_SECRET_KEY, {
        expiresIn: config.SESSION_EXPIRES_IN
    })
    return res.status(200).send({
        success: true,
        responce: jwtToken
    })
}

exports.addTelent = async (db, req, res) => {
    console.log("in addTelent");
    var user_id = req.body.user_id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var description = req.body.description;
    var facebook = req.body.facebook;
    var youtube = req.body.youtube;
    var twitter = req.body.twitter;
    var insta = req.body.insta;
    var nft_hash = req.body.nft_hash;
    var country_id = req.body.country_id;
    var city = req.body.city;
    var follower = req.body.follower;

    if (!first_name) {
        return res.status(400).send({
            success: false,
            msg: "First Name required"
        });
    }

    if (!last_name) {
        return res.status(400).send({
            success: false,
            msg: "Last Name required"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }

    if (!email) {
        return res.status(400).send({
            success: false,
            msg: "email required"
        });
    }

    var insertData = {
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "description": description,
        "facebook": facebook,
        "youtube": youtube,
        "twitter": twitter,
        "insta": insta,
        "country_id": country_id,
        "city": city,
        "follower": follower
    }

    await db.query(marketplaceQueries.addTelent, [insertData], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured in!!",
                error
            });
        }
        if (data) {

            /* update telent_status in users */
            var updateData = {
                "telent_status": "0"
            }
            await db.query(marketplaceQueries.updateUser, [updateData, user_id], function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
            })
            /* ------------------*/

            res.status(200).send({
                success: true,
                msg: "Your request submitted successfully!! ",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.EstateUser = async (db, req, res) => {
    console.log("in EstateUser");
    var user_id = req.body.user_id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var country_id = req.body.country_id;
    var city = req.body.city;
    var description = req.body.description;
    var website = req.body.website;
    var insta = req.body.insta;

    if (!first_name) {
        return res.status(400).send({
            success: false,
            msg: "First Name required"
        });
    }

    if (!last_name) {
        return res.status(400).send({
            success: false,
            msg: "Last Name required"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }

    if (!email) {
        return res.status(400).send({
            success: false,
            msg: "email required"
        });
    }

    var insertData = {
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "country_id": country_id,
        "city": city,
        "description": description,
        "website": website,
        "insta": insta,

    }

    await db.query(marketplaceQueries.addRealEstateUser, [insertData], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {

            /* update telent_status in users */
            var updateData = {
                "real_estate_status": "0"
            }
            await db.query(marketplaceQueries.updateUser, [updateData, user_id], function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
            })
            /* ------------------*/

            res.status(200).send({
                success: true,
                msg: "Your request submitted successfully!! ",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.TrendingNfts = async (db, req, res) => {
    console.log("in getUserItem");
    let user_id = req.body.user_id;
    let login_user_id = req.body.login_user_id;
    let is_featured = req.body.is_featured;
    let user_collection_id = req.body.user_collection_id;
    let recent = req.body.recent;
    let limit = req.body.limit;
    try {
        var qry = `Select i.id,i.nft_type as nft_type, ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,itemLikeCount(ie.id) as like_count,isLiked(ie.id,${login_user_id}) as is_liked,i.description,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,concat('${config.mailUrl}backend/infinity8_backend/uploads/',i.local_image) as local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  and i.is_featured=1`

        await db.query(qry, function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data.length > 0) {
                console.log('qry', qry, data)
                return res.status(200).send({
                    success: true,
                    msg: "User Item Details",
                    response: data
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "No Data"
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


exports.recentNfts = async (db, req, res) => {
    let login_user_id = req.body.login_user_id;
    try {
        var qry = `Select i.id,i.nft_type as nft_type, ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,itemLikeCount(ie.id) as like_count,isLiked(ie.id,${login_user_id}) as is_liked,i.description,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,concat('${config.mailUrl}backend/infinity8_backend/uploads/',i.local_image) as local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  and i.is_on_sale=1 order by id desc`

        await db.query(qry, function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data.length > 0) {
                return res.status(200).send({
                    success: true,
                    msg: "User Item Details",
                    response: data
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "No Data"
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

exports.listWishlist = async (db, req, res) => {

    var user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(marketplaceQueries.listWishlist, [user_id], function (error, data) {
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
                msg: "Your Wishlist ",
                data: data

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.addWishlist = async (db, req, res) => {

    var item_id = req.body.item_id;
    var user_id = req.body.user_id;

    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "Item ID required"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    var insertData = {
        "user_id": user_id,
        "item_id": item_id
    }

    await db.query(marketplaceQueries.addWishlist, [insertData], function (error, data) {
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
                msg: "Item added to your wishlist ",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.listWishlist = async (db, req, res) => {

    var user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(marketplaceQueries.listWishlist, [user_id], function (error, data) {
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
                msg: "Your Wishlist ",
                data: data

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.removeWishlist = async (db, req, res) => {

    var wishlist_id = req.body.wishlist_id;

    await db.query(marketplaceQueries.removeWishlist, [wishlist_id], function (error, data) {
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
                msg: "Item Removed from your wishlist "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}


exports.addCart = async (db, req, res) => {

    var item_id = req.body.item_id;
    var user_id = req.body.user_id;

    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "Item ID required"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    var insertData = {
        "user_id": user_id,
        "item_id": item_id,
        "quantity": 1
    }

    await db.query(marketplaceQueries.addCart, [insertData], function (error, data) {
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
                msg: "Item added to your cart ",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.listCart = async (db, req, res) => {

    var user_id = req.body.user_id;
    var cart_id = 0;


    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }
    await db.query(marketplaceQueries.listCart, [user_id, user_id], function (error, data) {
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
                msg: "Your Wishlist ",
                cart_total: data[0].cart_total,
                data: data

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}

exports.removeCart = async (db, req, res) => {

    var cart_id = req.body.cart_id;

    await db.query(marketplaceQueries.removeCart, [cart_id], function (error, data) {
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
                msg: "Item Removed from your wishlist "
            });
        } else {
            res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}


exports.itemDetails = async (db, req, res) => {
    var item_edition_id = req.body.item_edition_id;
    var user_id = req.body.user_id;
    if (!user_id) {
        user_id = 0;
    }

    await db.query(marketplaceQueries.itemdetail, [item_edition_id, user_id, item_edition_id, item_edition_id], async function (error, data) {
        console.log('data', data[0])

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        if (data[0].owner_id == 1) {
            var apiData = await openNFT(data[0].itemaddress);
            data[0].address = apiData;
        }
        await db.query(marketplaceQueries.getWalletDetail, [user_id], async function (error, walletData) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured in wallet detail!!",
                    error
                });
            }

            await db.query(marketplaceQueries.getImages, [item_edition_id, item_edition_id], async function (error, imageData) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured in ImageData!!",
                        error
                    });
                }

                await db.query(marketplaceQueries.getProperties, [item_edition_id, item_edition_id], async function (error, propertiesData) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "Error occured in propertiesData!!",
                            error
                        });
                    }

                    //var apiData = await openNFT(config.apiKey);

                    ////GET TRANSFER FEE 
                    // const response1 = await fetch('https://espsofttech.in:8001/api/erc1155/getFeeFortransfer', {
                    //     method: 'POST', headers: {
                    //         'Accept': 'application/json',
                    //         'Content-Type': 'application/json'
                    //     },
                    //     body: JSON.stringify({
                    //         "from_address": `${config.contractOwnerAddress}`,
                    //         "from_private_key": `${apiData}`,
                    //         "contract_address": `${config.contractAddress}`,
                    //         "to_address": `${config.contractOwnerAddress}`,
                    //         "token_owner_address": `${config.contractOwnerAddress}`,
                    //         "tokenId": 324,
                    //         "amount": 1
                    //     })
                    // });
                    // const feedata = await response1.json();
                    // if (!feedata.tnx_fee) {
                    //     return res.status(400).send({
                    //         success: false,
                    //         msg: "Error occured in txn_fee get!!",
                    //         error
                    //     });
                    // }
                    const response2 = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/buy', {
                        method: 'GET', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    const usdPrice = await response2.json();


                    if (data.length > 0) {
                        itemcategoryid = data[0].item_category_id;
                    }
                    else {
                        itemcategoryid = 0;
                    }
                    await db.query(marketplaceQueries.itemCategory, [itemcategoryid, item_edition_id], function (error, data1) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured!!",
                                error
                            });
                        }
                        if (data.length > 0) {
                            var wallet_balance_usd = 0;
                            var wallet_balance_eth = 0;
                            if (walletData.length > 0) {
                                wallet_balance_usd = walletData[0].balance;
                                wallet_balance_eth = walletData[0].balance / usdPrice['data']['amount'];
                            }

                            var extrafee = 3;
                            return res.status(200).send({
                                success: true,
                                // txn_fee_eth: (feedata.tnx_fee + (extrafee / usdPrice['data']['amount'])).toFixed(6),
                                // txn_fee_usd: ((feedata.tnx_fee * usdPrice['data']['amount']) + extrafee).toFixed(2),

                                //txn_fee_eth: 0.01,
                                //txn_fee_usd: 0.01,

                                price_eth: (data[0].price / usdPrice['data']['amount']).toFixed(6),
                                wallet_balance_usd: wallet_balance_usd.toFixed(2),
                                wallet_balance_eth: wallet_balance_eth.toFixed(6),
                                response: data[0],
                                data: data1,
                                imageData: imageData,
                                propertiesData: propertiesData

                            });

                        }
                        else {
                            return res.status(400).send({
                                success: false,
                                msg: "No Data"
                            });
                        }
                    });
                });
            });
        })
    });
}


exports.ItemDetailForEdit = async (db, req, res) => {
    console.log("in ItemDetailForEdit");
    var item_id = req.body.item_id;
    await db.query(marketplaceQueries.ItemDetailForEdit, [item_id], async function (error, data) {
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
        }
        else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.getUserTelent = async (db, req, res) => {
    console.log("in getUserTelent");
    var limit = req.body.limit;
    var is_featured = req.body.is_feature;
    var qry = `Select t.*, u.user_name,u.banner,u.profile_pic,u.telent_status from telent as t inner Join users as u ON t.user_id=u.id and u.deactivate_account=0 inner join (select * from item where id in (select max(id) from item group by created_by)) as i on i.created_by=t.user_id where u.is_featured=${is_featured}`;

    if (limit > 0) {
        qry = qry + ' limit ' + limit;
    }
    await db.query(qry, async function (error, data) {
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

        }
        else {
            res.status(400).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}


exports.updateTelentForApproved = async (db, req, res) => {
    console.log("in updateTelentForApproved");
    var email = req.body.email;
    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.updateTelentForApproved, [user_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        /// SEND MAIL STARTS
        qry = `select * from users where id =${user_id}`;

        await db.query(qry, async function (error, mailData) {
            emailActivity.Activity(mailData[0].email, 'Verified', `Dear applicant, You are now verfied by admin , You can add your NFTs.`, `featurescreator/${user_id}`, `https://espsofttech.in/newsletter/images/defult/headlogo_3.png`);

        });
        /// SEND MAIL ENDS    
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Email has been Sent",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}

exports.realEstateUserApprove = async (db, req, res) => {
    console.log("in realEstateUserApprove");
    var email = req.body.email;
    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.realEstateUserApprove, [user_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        var transporter = nodemailer.createTransport({
            host: 'espsofttechnologies.com',
            port: 465,
            secure: true,
            auth: {
                user: 'developer@espsofttechnologies.com',
                pass: 'Espsoft123#'
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        var mailOptions = {
            from: 'developer@espsofttech.com',
            //   from : 'bilal.espsofttech@gmail.com', 
            to: `${email}`,
            subject: 'Account item Verified Link',
            html: `<div style="background-color:#f4f4f4">
        <div>
        <div style="margin:0px auto;max-width:800px">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
        <tbody>
        <tr>
        <td style="direction:ltr;font-size:0px;padding:10px 0px;text-align:center">
        </td>
        </tr>
        </tbody>
        </table>

        </div>
        <div style="background:black;background-color:#6f43ec;margin:0px auto;border-radius:5px;max-width:800px">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
        <tbody>
        <tr>
        <td style="direction:ltr;font-size:0px;padding:8px 0;text-align:center">
        <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
        <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
        <tbody>
        <tr>
        <td align="center" style="font-size:0px;padding:0px 25px 0px 25px;word-break:break-word">
        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px">
        <tbody>
        <tr>
        <td style="width:126px">
        <img height="auto" src="https://espsofttech.in/digiphynft/backend/uploads/image-1654674806051.png" style="border:0;display:block;float: inherit;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150"  class="CToWUd">
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        <div style="height:20px">
        &nbsp;
        </div>
        <div style="background:#fff;margin:0px auto;border-radius:5px;max-width:800px">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
        <tbody>
        <tr>
        <td style="direction:ltr;font-size:0px;padding:0px;text-align:center">
        <div style="margin:0px auto;max-width:800px">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
        <tbody>
        <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
        <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
        <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
        <tbody>
        <tr>
        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1;text-align:left;color:#000"><b>Dear ${email}</b></div>
        </td>
        </tr>
        <tr>
        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
        <h3> You are Verified, Now Add Item </h3>
        <h4>Please Click on given link </h4>
        <a href='${config.mailUrl}featurescreator/${user_id}'>Click here </a>
        </div>
        </td>
        </tr>
        <tr>
        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
        Thanks <br>
        DigiPhyNFT Team
        </div>
        </td>
        </tr>

        </tbody>
        </table>
        </div>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        <div style="height:20px">
        &nbsp;
        </div>
        <div style="background:#000;background-color:#000;margin:0px auto;border-radius:5px;max-width:800px">
        <font color="#888888">
        </font><font color="#888888">
        </font><font color="#888888">
        </font><table align="center" border="0" cellpadding="0" cellspacing="0" style="background:#b09af7;background-color:#000;width:100%;border-radius:5px">
        <tbody>
        <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
        <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
        <font color="#888888">
        </font><font color="#888888">
        </font><font color="#888888">
        </font><table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
        <tbody>
        <tr>
        <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
        <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:left;color:#fff"><b>DigiPhyNFT Team

        </b></div>
        </td>
        <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
        <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:right;color:#fff"><b style="color:white"><a href="mailto:support@DigiPhyNFT.io" target="_blank">support@DigiPhyNFT.io</a></b></div><font color="#888888">
        </font></td></tr></tbody></table><font color="#888888">
        </font></div><font color="#888888">
        </font></td></tr></tbody></table><font color="#888888">
        </font></div><font color="#888888">
        </font></div><font color="#888888">
        </font></div>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                //   console.log(error);
            } else {
                //console.log('Email sent: ' + info.response);
            }
        });

        if (data) {
            res.status(200).send({
                success: true,
                msg: "Real estate user approved successfully!!",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}



exports.updateTelentForReject = async (db, req, res) => {
    console.log("in updateTelentForReject");
    var email = req.body.email;
    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.updateTelentForReject, [user_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        await db.query(marketplaceQueries.DeleteTelent, [user_id], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            /// SEND MAIL STARTS
            qry = `select * from users where id =${user_id}`;

            await db.query(qry, async function (error, mailData) {
                emailActivity.Activity(mailData[0].email, 'Talent application rejected', `Dear applicant, your Request Rejected By Admin , Please Again fill form`, `featurescreator/${user_id}`, `https://espsofttech.in/newsletter/images/defult/headlogo_3.png`);

            });
            /// SEND MAIL ENDS    


            if (data) {
                res.status(200).send({
                    success: true,
                    msg: "Email has been Sent",
                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "Something Wrong due to internal Error"
                });
            }
        });
    });
}

exports.realEstateUserReject = async (db, req, res) => {
    console.log("in realEstateUserReject");
    var email = req.body.email;
    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.realEstateUserReject, [user_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        await db.query(marketplaceQueries.DeleteRealEstateUser, [user_id], async function (error, data2) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }


            var transporter = nodemailer.createTransport({
                host: 'espsofttechnologies.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'developer@espsofttechnologies.com',
                    pass: 'Espsoft123#'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });


            var mailOptions = {
                from: 'developer@espsofttech.com',
                //   from : 'bilal.espsofttech@gmail.com', 
                to: `${email}`,
                subject: 'Account item Verified Link',
                html: `<div style="background-color:#f4f4f4">
        <div>
            <div style="margin:0px auto;max-width:800px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
                    <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:10px 0px;text-align:center">
                        </td>
                    </tr>
                    </tbody>
                </table>
            
            </div>
        <div style="background:black;background-color:#6f43ec;margin:0px auto;border-radius:5px;max-width:800px">
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
                <tbody>
                <tr>
                    <td style="direction:ltr;font-size:0px;padding:8px 0;text-align:center">
                        <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                            <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                            <tbody>
                                <tr>
                                    <td align="center" style="font-size:0px;padding:0px 25px 0px 25px;word-break:break-word">
                                        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px">
                                        <tbody>
                                            <tr>
                                                <td style="width:126px">
                                                    <img height="auto" src="https://espsofttech.in/digiphynft/backend/uploads/image-1654674806051.png" style="border:0;display:block;float: inherit;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="150"  class="CToWUd">
                                                </td>
                                            </tr>
                                        </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
            <div style="height:20px">
                &nbsp;
            </div>
            <div style="background:#fff;margin:0px auto;border-radius:5px;max-width:800px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-radius:5px">
                    <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:0px;text-align:center">
                            <div style="margin:0px auto;max-width:800px">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:100%">
                                <tbody>
                                    <tr>
                                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                                            <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                                            <table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                    <tbody>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                            <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1;text-align:left;color:#000"><b>Dear ${email}</b></div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                            <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                            <h3> Your Request Rejected By Admin , Please Again fill form </h3>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                            <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                            Thanks <br>
                            DigiPhyNFT Team
                            </div>
                        </td>
                    </tr>
                    
                    </tbody>
                </table>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div style="height:20px">
                &nbsp;
            </div>
            <div style="background:#000;background-color:#000;margin:0px auto;border-radius:5px;max-width:800px">
                <font color="#888888">
                    </font><font color="#888888">
                    </font><font color="#888888">
                </font><table align="center" border="0" cellpadding="0" cellspacing="0" style="background:#b09af7;background-color:#000;width:100%;border-radius:5px">
                    <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                            <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                                <font color="#888888">
                                    </font><font color="#888888">
                                </font><font color="#888888">
                                </font><table border="0" cellpadding="0" cellspacing="0" style="vertical-align:top" width="100%">
                                <tbody>
                                    <tr>
                                        <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
                                            <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:left;color:#fff"><b>DigiPhyNFT Team

                                            </b></div>
                                        </td>
                                        <td align="center" style="font-size:0px;padding:0px 25px;word-break:break-word">
                                            <div style="font-family:Arial,sans-serif;font-size:13px;line-height:25px;text-align:right;color:#fff"><b style="color:white"><a href="mailto:support@DigiPhyNFT.io" target="_blank">support@DigiPhyNFT.io</a></b></div><font color="#888888">
                                        </font></td></tr></tbody></table><font color="#888888">
                            </font></div><font color="#888888">
                        </font></td></tr></tbody></table><font color="#888888">
            </font></div><font color="#888888">
        </font></div><font color="#888888">
        </font></div>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            if (data) {
                res.status(200).send({
                    success: true,
                    msg: "Real estate user rejected!!",
                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "Something Wrong due to internal Error"
                });
            }
        });
    });
}

exports.allSearch = async (
    db, req, res) => {
    console.log("in allSearch");

    var search = (!req.body.search) ? '' : req.body.search;
    var min = req.body.min;
    var max = req.body.max;
    var resale = req.body.resale;
    var country_id = req.body.country_id;
    var nftMin = ` `;
    var nftMax = ` `;
    var publisherCountry = ` `;
    var userCountry = ` `;
    var telentLocation = ` `;
    var nftLocation = ` `;
    var userLocation = ` `;

    var resaleId = ` `;

    if (!search) {
        return res.status(400).send({
            success: false,
            msg: "Search parameter required"
        });
    }
    if (min) {
        nftMin = ` and date(i.datetime)>= '${min}' `;
    }
    if (max) {
        nftMax = ` and date(i.datetime)<= '${max}' `;
    }
    if (country_id > 0) {
        publisherCountry = ` and  t.country_id=${country_id} `;
        userCountry = ` and country_id=${country_id}`;
    }
    if (resale == 1) {
        resaleId = ` and  isResale(ie.id)=0 `;
    }
    if (resale == 0) {
        var resaleId = ` and  isResale(ie.id)=1 `;
    }
    qry = "select t.user_id as id,t.email,u.user_name,concat(t.first_name,' ',t.last_name) as full_name,u.profile_pic,'talent' as type from telent as t left join users as u on u.id=t.user_id where (t.first_name like '" + `${search}` + "%' or t.last_name like '" + `${search}` + "%' or u.user_name like '" + `${search}` + "%' or u.email like '" + `${search}` + "%' or concat(t.first_name,' ',t.last_name) like '" + `${search}` + "%') " + `${publisherCountry}` + " and u.deactivate_account=0  union all select ie.id,u.email,u.user_name,i.name,i.image as profile_pic,'nft' as type from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=i.created_by where i.name like '" + `${search}` + "%' " + `${nftMin}` + " and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id) " + `${resaleId}` + " and i.is_active=1 union all select id,email,full_name as user_name,full_name as name,profile_pic,'talent' as type from users where (email like '" + `${search}` + "%' or full_name like '" + `${search}` + "%') " + `${userCountry}` + "";
    console.log(qry);
    try {
        await db.query(qry, async function (err, result) {
            if (err) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured ",
                    error
                });
            }
            else if (result.length > 0) {
                return res.status(200).send({
                    success: true,
                    msg: 'data  found',
                    query: qry,
                    response: result

                });
            }
            else {
                return res.status(400).send({
                    success: false,
                    msg: "No data found ",
                    data: []
                });
            }
        })



    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: `unable to add customer address due to internal error :${err}`
        });
    }
}


exports.insertUserCollection = async (db, req, res) => {
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
    await db.query(marketplaceQueries.getCollectionAlreadyExist, [name], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(400).send({
                success: false,
                msg: "Collection already exist",
            });
        }
        await db.query(marketplaceQueries.insertUserCollection, [dataArr], function (error, data) {
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
    })
}

exports.insertRealEstateCollection = async (db, req, res) => {
    console.log("in insertRealEstateCollection");
    var user_id = req.body.user_id;
    var name = req.body.name;
    var description = req.body.description;
    var nft_type_id = 2;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required!!"

        });
    }
    if (!name) {
        return res.status(400).send({
            success: false,
            msg: "name required!!"
        });
    }
    if (!description) {
        return res.status(400).send({
            success: false,
            msg: "description required!!"
        });
    }
    var users = {
        user_id: user_id,
        name: name,
        description: description,
        nft_type_id: nft_type_id
    }

    await db.query(marketplaceQueries.insertUserCollection, [users], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            var qry = `Select id ,user_id,name,description,nft_type_id from user_collection where id=${data.insertId}`;
            db.query(qry, [data.insertId, user_id], async function (error, data2) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }

                res.status(200).send({
                    success: true,
                    msg: "Collection Inserted Successfully",
                    data: data2[0]
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
















exports.getUserCollection = async (db, req, res) => {
    console.log("in getUserCollection");
    var user_id = req.body.user_id;
    await db.query(marketplaceQueries.getUserCollection, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "User Collection Details",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No data found!"
            });
        }
    });
}


exports.getUserOwnerItem = async (db, req, res) => {
    console.log("in getUserCollection owner");
    var user_id = req.body.user_id;
    await db.query(marketplaceQueries.getUserOwnerItem, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "User Buy Item Details",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No data found!"
            });
        }
    });
}

exports.getAllUserCollection = async (db, req, res) => {
    console.log("in getAllUserCollection");
    await db.query(marketplaceQueries.getAllUserCollection, function (error, data) {
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

exports.getAllRealEstateCollection = async (db, req, res) => {
    console.log("in getAllRealEstateCollection");
    await db.query(marketplaceQueries.getAllRealEstateCollection, function (error, data) {
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

exports.getRealEstateCollection = async (db, req, res) => {
    console.log("in getRealEstateCollection");
    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.getRealEstateCollection, [user_id], function (error, data) {
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
                msg: "Collection Details",
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

exports.getSingleUserCollection = async (db, req, res) => {
    console.log("in getSingleUserCollection");
    var user_id = req.body.user_id;
    var collection_id = req.body.collection_id;
    if (!collection_id) {
        return res.status(400).send({
            success: false,
            msg: "collection_id required!!"
        });
    }
    await db.query(marketplaceQueries.getSingleUserCollection, [collection_id, user_id], function (error, data) {
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
                msg: "User Collection Details",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.updateUserCollection = async (db, req, res) => {
    console.log("in updateUserCollection");
    var profile_pic = (!req.files['profile_pic']) ? null : req.files['profile_pic'][0].filename;
    var banner = (!req.files['banner']) ? null : req.files['banner'][0].filename;
    var old_profile_pic = req.body.old_profile_pic;
    var old_banner = req.body.old_banner;
    var user_id = req.body.user_id;
    var collection_id = req.body.collection_id;
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

    var userColl = {
        "name": name,
        "description": description,
        "profile_pic": profile_pic,
        "banner": banner,
        "website": website,
        "facebook": req.body.facebook,
        "insta": req.body.insta,
        "telegram": req.body.telegram,
        "twitter": req.body.twitter,
        "discord": req.body.discord
    }

    await db.query(marketplaceQueries.updateUserCollection, [userColl, collection_id, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            db.query(marketplaceQueries.getSingleUserCollection, [collection_id, user_id], function (error, data1) {
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




exports.deleteUserCollection = async (db, req, res) => {
    console.log("in deleteUserCollection");
    var collection_id = req.body.collection_id;
    var address = req.body.address;

    await db.query(marketplaceQueries.getCollectionItemCount, [collection_id], async function (error, cnt) {
        if (cnt[0].itemCount > 0) {
            return res.status(400).send({
                success: false,
                msg: "You can't delete collection if any NFT exists in it !!"
            });
        }
        await db.query(marketplaceQueries.deleteUserCollection, [collection_id], function (error, data) {
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
                    msg: "User Collection Deleted!!",

                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "Something Wrong due to internal Error"
                });
            }
        });
    });
}




exports.getUserItem = async (db, req, res) => {
    console.log("in getUserItem");
    var user_id = req.body.user_id;
    var user_collection_id = req.body.user_collection_id;
    var limit = req.body.limit;
    try {
        var qry = `Select it.id as item_id,ie.id as item_edition_id,ie.owner_id,it.created_by,it.name,it.is_on_sale,it.sell_type,it.approve_by_admin,it.description,it.image,it.file_type,it.owner,it.item_category_id,it.token_id,ie.price,cl.id as collection_id,cl.user_id,ie.is_sold,ie.expiry_date,ic.name as category_name,case when it.edition_type=2 then 'Open'  else ie.edition_text end as edition_text from item_edition as ie left join item as it on it.id=ie.item_id LEFT JOIN user_collection as cl ON cl.id = it.user_collection_id LEFT JOIN item_category as ic ON it.item_category_id=ic.id where ie.item_id in (select min(id)
        from item where created_by=${user_id} group by id,owner_id)`;

        if (user_id > 0) {
            qry = qry + ` and it.created_by=${user_id}`;
        }

        if (user_collection_id > 0) {
            qry = qry + ` and cl.id=${user_collection_id}`;
        }
        if (limit > 0) {
            qry = qry + `  GROUP BY it.id order by ie.datetime desc limit ${limit}`;
        }
        else {
            qry = qry + ` GROUP BY it.id order by ie.datetime desc `;
        }

        console.log('qry',qry);
        await db.query(qry, function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data.length > 0) {
                return res.status(200).send({
                    success: true,
                    msg: "User Item Details",
                    response: data
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "No Data"
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

exports.getRealEstateItem = async (db, req, res) => {
    console.log("in getRealEstateItem");
    var user_id = req.body.user_id;
    var user_collection_id = req.body.user_collection_id;
    var limit = req.body.limit;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required!!"
        });
    }

    if (!user_collection_id) {
        return res.status(400).send({
            success: false,
            msg: "user_collection_id required!!"
        });
    }

    if (!limit) {
        return res.status(400).send({
            success: false,
            msg: "limit required!!"
        });
    }
    var qry = "Select it.id as item_id,ie.id as item_edition_id,case when length(it.name)>=30 then concat(left(it.name,30),'...')  else it.name end as name,it.description,it.image,it.file_type,u.full_name as owner,it.item_category_id,coalesce(it.start_date,it.datetime) as start_date,it.token_id,it.price,cl.id as collection_id,cl.user_id,ic.name as item_category,ie.is_sold,ie.expiry_date from item_edition as ie left join item as it on it.id=ie.item_id LEFT JOIN user_collection as cl ON cl.id = it.user_collection_id left join users as u on u.id=it.owner_id left join item_category as ic on ic.id=it.item_category_id where ie.id in (select min(id) from item_edition where is_sold=0 group by item_id) and it.nft_type_id=2 and it.is_active=1"

    if (user_id > 0) {
        qry = qry + ` and cl.user_id=${user_id}`
    }

    if (user_collection_id > 0) {
        qry = qry + ` and cl.id=${user_collection_id}`
    }
    if (limit > 0) {
        qry = qry + ` order by rand() limit ${limit}`
    }

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
                msg: "User Item Details",
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

// exports.addRealEstate = async (db, req, res) => {
//     console.log("in addRealEstate");
//     var user_id = req.body.user_id;
//     var name = req.body.name;
//     var description = req.body.description;
//     var image = req.body.image;
//     var image1 = req.body.image1;
//     var file_type = req.body.file_type;
//     var title_deed = req.body.title_deed;
//     var passport = req.body.passport;
//     var item_category_id = req.body.item_category_id;
//     var price = req.body.price;
//     var edition_type = 1;
//     var quantity = 1;
//     var nft_type_id = 2;
//     var sell_type = req.body.sell_type;
//     var edition_type = 1;
//     var user_collection_id = req.body.user_collection_id;
//     var start_date = req.body.start_date;
//     var end_date = req.body.end_date;
//     var expiry_date = req.body.expiry_date;
//     var image_low = req.body.image;
//     var user_address = req.body.user_address;
//     if (file_type === 'image') {
//         var recCompress = await ipfsCompress.compressImages(["https://infinity8.mypinata.cloud/ipfs/" + image]);
//         if (recCompress.success == false) {
//             // return res.status(400).send({
//             //     success: false,
//             //     msg: "Image compress issue "
//             // });
//             var image_low = image;
//         } else {
//             var image_low = recCompress.imageHash[0];
//         }
//         //  return res.json({
//         //     image_low:image_low,
//         //     image:image
//         //  })        
//     }


//     if (!name) {
//         return res.status(400).send({
//             success: false,
//             msg: "name required!! "
//         });
//     }
//     if (!image) {
//         return res.status(400).send({
//             success: false,
//             msg: "image required!! "
//         });
//     }
//     if (!description) {
//         return res.status(400).send({
//             success: false,
//             msg: "description required!! "
//         });
//     }

//     if (!price) {
//         return res.status(400).send({
//             success: false,
//             msg: "Price required!! "
//         });
//     }
//     if (!sell_type) {
//         return res.status(400).send({
//             success: false,
//             msg: "Sell type required!! "
//         });
//     }
//     if (!title_deed) {
//         return res.status(400).send({
//             success: false,
//             msg: "title_deed required!! "
//         });
//     }

//     if (!passport) {
//         return res.status(400).send({
//             success: false,
//             msg: "passport required!! "
//         });
//     }

//     var users = {
//         "name": name,
//         "description": description,
//         "image": image_low,
//         "image_original": image,
//         "file_type": file_type,
//         "title_deed": title_deed,
//         "passport": passport,
//         "item_category_id": item_category_id,
//         "user_collection_id": user_collection_id,
//         "start_date": start_date,
//         "end_date": end_date,
//         "price": price,
//         "owner_id": user_id,
//         "created_by": user_id,
//         "sell_type": sell_type,
//         "edition_type": edition_type,
//         "expiry_date": expiry_date,
//         "quantity": quantity,
//         "nft_type_id": nft_type_id
//     }

//     var mint_quantity = quantity;


//     await db.query(marketplaceQueries.insertItem, [users], async function (error, data) {
//         if (error) {
//             console.log("error in insertItem");
//             return res.status(400).send({
//                 success: false,
//                 msg: "error occured in item insert",
//                 error
//             });
//         }
//         /**---------------------------IPFS Json ---------------------------------- */
//         var additem = {
//             "name": name,
//             "description": description,
//             "image": 'https://ipfs.io/ipfs/' + image
//         }
//         var userfile = 'item_'.concat(data.insertId, '.json');



//         fs.writeFile(`./metadata/${userfile}`, JSON.stringify(additem), async (err, fd) => {

//             // Checking for errors
//             if (err) throw err;

//             console.log("Done writing"); // Success




//             const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

//             let formdata = new FormData();

//             //console.log("Done writing"); // Success
//             formdata.append('file', fs.createReadStream('./metadata/' + userfile));


//             //   console.log(fs.createReadStream('./metadata/'+userfile)); // Success
//             // var filedata = await axios.post(url,
//             //     formdata,
//             //     {
//             //         maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
//             //         headers: {
//             //             // 'Content-Type' : `application/json;boundary=${formdata._boundary}`,
//             //             'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
//             //             'pinata_api_key': '105327714c080a01a4b5',
//             //             'pinata_secret_api_key': 'e18cf3c1a8a7376852a4674735896bda9b7870cb4e11cc05c9e614711f955b35'
//             //         }
//             //     }
//             // )
//             // console.log(filedata.data.IpfsHash);

//             const response2 = await fetch(url, {
//                 method: 'POST', headers: {
//                     // 'Content-Type' : `application/json;boundary=${formdata._boundary}`,
//                     'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
//                     'pinata_api_key': '105327714c080a01a4b5',
//                     'pinata_secret_api_key': 'e18cf3c1a8a7376852a4674735896bda9b7870cb4e11cc05c9e614711f955b35'
//                 },
//                 body: formdata
//             });
//             const filedata = await response2.json();


//             db.query(marketplaceQueries.updatemeta, [filedata.IpfsHash, data.insertId], (error, data235) => {

//             })




//             /*-------------------------------------------------------------------------------------*/

//             /**------------------------------------------ Insert-into Item_Images------------------- */


//             for (let i = 0; i < image1.length; i++) {

//                 if (i >= 0) {

//                     var insertData = {
//                         "item_id": data.insertId,
//                         "name": image1[i],
//                         "ip": null,
//                         "datetime": new Date()
//                     }
//                     await db.query(marketplaceQueries.additemimages, [insertData])
//                 };

//             }


//             /**--------------------------------------------------------------------------------------- */
//             /**  -----------------------------------Insertinto Edition */

//             for (var i = 1; i <= quantity; i++) {


//                 var item_ed = {
//                     "edition_text": `${i} / ${quantity}`,
//                     "edition_no": i,
//                     "item_id": data.insertId,
//                     "is_sold": 0,
//                     "owner_id": user_id,
//                     "price": price,
//                     "start_date": start_date,
//                     "expiry_date": expiry_date,
//                     "end_date": end_date,
//                     "user_collection_id": user_collection_id,
//                     "user_address": user_address,
//                     "ip": null,
//                     "datetime": new Date()
//                 };

//                 await db.query(marketplaceQueries.insertEdition, [item_ed])
//             }
//             /** ---------------------------------------------------------- */
//             if (data) {

//                 await db.query(marketplaceQueries.getWalletDetail, [user_id], async function (error, walletData) {
//                     /* create NFT and update into table */

//                     //var contract=`${config.contractAddress}`; // TEST CONTRACT
//                     var contract = `${config.contractAddress}`; //LIVE CONTRACT
//                     var apiData = await openNFT(config.apiKey);
//                     var apiData1 = await openNFT(config.apiKey);

//                     const response1 = await fetch(`${config.blockchainApiUrl}mint`, {
//                         method: 'POST', headers: {
//                             'Accept': 'application/json',
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify({
//                             "from_address": `${config.contractOwnerAddress}`,
//                             "from_private_key": `${apiData}`,
//                             "to_address": `${config.contractOwnerAddress}`,
//                             "contract_address": `${contract}`,
//                             "MetaDataHash": `${filedata.IpfsHash}`,
//                             "TokenName": `${name}`,
//                             "TokenId": `${data.insertId}`,
//                             "totalSupply": `${mint_quantity}`
//                         })
//                     });

//                     const data1 = await response1.json();
//                     console.log("minted.");
//                     if (!data1.hash) {
//                         return res.status(400).send({
//                             success: false,
//                             msg: "error occured in mint NFT",
//                             error
//                         });
//                     }

//                     var updateData = {
//                         "token_hash": data1.hash,
//                         "token_id": data.insertId
//                     }

//                     await db.query(marketplaceQueries.updateItem, [updateData, data.insertId], async function (error, data3) {
//                         if (error) {
//                             return res.status(400).send({
//                                 success: false,
//                                 msg: "error occured in update item table",
//                                 error
//                             });
//                         }
//                     });
//                 })
//                 await db.query(marketplaceQueries.getItemEdition, [data.insertId], async function (error, iedata) {
//                     if (error) {

//                         return res.status(400).send({
//                             success: false,
//                             msg: "error occured in item insert",
//                             error
//                         });
//                     }
//                     return res.status(200).send({
//                         success: true,
//                         msg: "Item Inserted Successfully",
//                         item_edition_id: iedata[0].id
//                     });
//                 });
//             } else {
//                 return res.status(400).send({
//                     success: false,
//                     msg: "Something Wrong due to internal Error"
//                 });
//             }
//         });
//     });

// }

exports.walletResalePayment = async (db, req, res) => {
    console.log("in walletResalePayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var item_id = req.body.item_id;
    var item_edition_id = req.body.item_edition_id;
    var resale_quantity = req.body.resale_quantity;

    await db.query(marketplaceQueries.adminWallet, async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }

        await db.query(marketplaceQueries.userWallet, [user_id], async function (error, data1) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            var transaction = {
                user_id: user_id,
                item_id: item_id,
                item_edition_id: item_edition_id,
                purchased_quantity: resale_quantity,
                transaction_type_id: "9",
                from_address: data1[0].public,//user From Address
                to_address: data[0].public, // admin To Address
                amount: amount * -1,
                status: 1,
                currency: 'USD'
            }

            await db.query(marketplaceQueries.insertTransaction, transaction)

            if (data1) {
                res.status(200).send({
                    success: true,
                    msg: "Resell fee paid Succesfully",

                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "Resell fee payment error Error"
                });
            }
        });
    });
}



exports.walletPayment = async (db, req, res) => {
    console.log("in walletPayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;

    await db.query(marketplaceQueries.adminWallet, async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }

        await db.query(marketplaceQueries.userWallet, [user_id], async function (error, data1) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            var transaction = {
                user_id: user_id,
                transaction_type_id: "5",
                from_address: data1[0].public,//user From Address
                to_address: data[0].public, // admin To Address
                amount: amount * -1,
                status: 1,
                currency: 'USD'
            }

            await db.query(marketplaceQueries.insertTransaction, transaction, async function (error, trxData) {

                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured",
                        error
                    });
                }
                else {
                    res.status(200).send({
                        success: true,
                        msg: "User Withdraw Succesfull",
                        transaction_id: trxData.insertId
                    });
                }
            });
        });
    });
}

/* ---------------------------  STRIPE PAYMENT GATEWAY IMPLEMENTATION ---------------*/
exports.stripePayment = async (db, req, res) => {
    console.log("in stripePayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var cardNumber = req.body.cardNumber;
    var expMonth = req.body.expMonth;
    var expYear = req.body.expYear;
    var cvc = req.body.cvc;

    try {
        await db.query(marketplaceQueries.getUserDetail, [user_id], async function (error, userData) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured in userData!!",
                    error
                });
            }

            const response4 = await fetch('https://infinity8.io:7007/stripe/create-card', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `${config.stripe_key}`
                },
                body: JSON.stringify({
                    "cardNumber": `${cardNumber}`,
                    "expMonth": `${expMonth}`,
                    "expYear": `${expYear}`,
                    "cvc": `${cvc}`
                })
            });

            const data4 = await response4.json();
            var cardid = data4.CardID;

            if (data4.success == false) {
                return res.status(400).send({
                    success: false,
                    data: data4,
                    msg: data4.message
                });
            }
            const response1 = await fetch('https://infinity8.io:7007/stripe/create-customer', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `${config.stripe_key}`
                },
                body: JSON.stringify({
                    "name": `${userData[0].user_name}`,
                    "email": `${userData[0].email}`,
                    "address": {
                        line1: 'Infinity8',
                        postal_code: 'Infinity8',
                        city: 'Infinity8',
                        state: 'CA',
                        country: 'US',

                    }
                })
            });

            const data1 = await response1.json();
            var customerID = data1.CustomerID;

            const response2 = await fetch('https://infinity8.io:7007/stripe/capture-payment', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `${config.stripe_key}`
                },
                body: JSON.stringify({
                    "cardId": `${cardid}`,
                    "customerId": `${customerID}`,
                    "amount": `${Math.round(amount * 100)}`,
                    "currency": "INR",
                    "description": "Amount"
                })
            });
            const data2 = await response2.json();

            if (data2.success == 'false') {
                return res.status(400).send({
                    success: false,
                    msg: data2.message
                });
            }

            const response3 = await fetch('https://infinity8.io:7007/stripe/confirm-capture-payment', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `${config.stripe_key}`
                },
                body: JSON.stringify({
                    "paymentId": `${data2.paymentId}`
                })
            });
            const data3 = await response3.json();


            if (data3.success) {

                return res.status(200).send({
                    success: true,
                    msg: data3.message
                });

            }
            else {
                return res.status(400).send({
                    success: false,
                    msg: data3.message
                });
            }

        });
    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err
        });
    }
}

exports.paypalMintPayment = async (db, req, res) => {
    console.log("in paypalMintPayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var payment_id = req.body.payment_id;

    try {
        var insertdata = {
            user_id: user_id,
            amount: amount,
            payment_id: payment_id,
            transaction_type_id: 7,
            currency: "INR",
            status: 1,

        }

        await db.query(marketplaceQueries.insertTransaction, [insertdata], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error: error
                });
            }
            else {
                return res.status(200).send({
                    success: true,
                    msg: 'Payment captured!!',
                    transaction_id: data.insertId
                });

            }
        });
    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err: err
        });
    }
}


exports.circleMintPayment = async (db, req, res) => {
    console.log("in circleMintPayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var number = req.body.number;
    var cvv = req.body.cvv;
    var expMonth = req.body.expMonth;
    var expYear = req.body.expYear;

    try {

        const { v4: uuidv4 } = require('uuid');

        const response0 = await uuidv4();

        const response1 = await fetch(`${config.circleApiUrl}encryption/public`, {
            method: 'GET', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.circleApiKey}`
            }
        });
        const data1 = await response1.json();


        var encriptData = await pgpEncryption.pgpEncrypt(data1.data.publicKey, `{
             "number": ${number},
             "cvv": ${cvv}
        }`);



        const response2 = await fetch(`${config.circleApiUrl}cards`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.circleApiKey}`
            },
            body: JSON.stringify({
                "encryptedData": encriptData.encrypted,
                "billingDetails": {
                    "name": "Infinity 8",
                    "city": "Infinity8",
                    "country": "US",
                    "postalCode": "4569",
                    "line1": "Infinity8",
                    "line2": "",
                    "district": "NA"
                },
                "metadata": {
                    "email": "info@infinity8.io",
                    "phoneNumber": "+919999999999",
                    "ipAddress": "192.168.1.1",
                    "sessionId": "DE6FA86F60BB47B379307F851E238617"
                },
                "idempotencyKey": `${response0}`,
                "keyId": `${config.circleApiKeyId}`,
                "expMonth": `${expMonth}`,
                "expYear": `${expYear}`
            })
        });
        const data2 = await response2.json();


        var source_id = data2.data.id;

        var encriptData = await pgpEncryption.pgpEncrypt(data1.data.publicKey, `{
         "number": ${number},
         "cvv": ${cvv}
     }`);

        const response3 = await fetch(`${config.circleApiUrl}payments`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.circleApiKey}`
            },
            body: JSON.stringify({
                "metadata": {
                    "email": "info@infinity.io",
                    "phoneNumber": "+919999999999",
                    "ipAddress": "192.168.1.1",
                    "sessionId": "DE6FA86F60BB47B379307F851E238617"
                },
                "amount": {
                    "amount": `${amount}`,
                    "currency": "INR"
                },
                "source": {
                    "id": source_id,
                    "type": "card"
                },
                "encryptedData": encriptData.encrypted,
                "keyId": `${config.circleApiKeyId}`,
                "idempotencyKey": `${response0}`,
                "verification": "cvv",
                "verificationSuccessUrl": "na",
                "verificationFailureUrl": "na",
                "description": "Payment"
            })
        });
        const data3 = await response3.json();

        if (data3.code) {

            return res.status(400).send({
                success: false,
                msg: data3.message
            });

        }
        if (!data3.code) {

            var insertdata = {
                user_id: user_id,
                amount: amount,
                transaction_type_id: 7,
                currency: "INR",
                status: 1,

            }

            await db.query(marketplaceQueries.insertTransaction, [insertdata], async function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error: error
                    });
                }

                return res.status(200).send({
                    success: true,
                    msg: 'Payment captured!!',
                    transaction_id: data.insertId
                });


            });

        } else {
            return res.status(400).send({
                success: false,
                msg: data3.message,
                err: err
            });
        }
    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err: err
        });
    }
}


exports.paypalResalePayment = async (db, req, res) => {
    console.log("in paypalResalePayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var payment_id = req.body.payment_id;
    var item_id = req.body.item_id;
    var item_edition_id = req.body.item_edition_id;
    var resale_quantity = req.body.resale_quantity;

    try {
        var insertdata = {
            user_id: user_id,
            amount: amount,
            purchased_quantity: resale_quantity,
            payment_id: payment_id,
            item_id: item_id,
            item_edition_id: item_edition_id,
            transaction_type_id: 9,
            currency: "INR",
            status: 1,

        }

        await db.query(marketplaceQueries.insertTransaction, [insertdata], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error: error
                });
            }
            else {
                return res.status(200).send({
                    success: true,
                    msg: 'Payment captured!!',
                    transaction_id: data.insertId
                });

            }
        });
    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err: err
        });
    }
}

exports.circleResalePayment = async (db, req, res) => {
    console.log("in paypalResalePayment");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var item_id = req.body.item_id;
    var item_edition_id = req.body.item_edition_id;
    var resale_quantity = req.body.resale_quantity;
    var number = req.body.number;
    var cvv = req.body.cvv;
    var expMonth = req.body.expMonth;
    var expYear = req.body.expYear;

    try {

        const { v4: uuidv4 } = require('uuid');

        const response0 = await uuidv4();


        const response1 = await fetch(`${config.circleApiUrl}encryption/public`, {
            method: 'GET', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.circleApiKey}`
            }
        });
        const data1 = await response1.json();


        var encriptData = await pgpEncryption.pgpEncrypt(data1.data.publicKey, `{
             "number": ${number},
             "cvv": ${cvv}
        }`);



        const response2 = await fetch(`${config.circleApiUrl}cards`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.circleApiKey}`
            },
            body: JSON.stringify({
                "encryptedData": encriptData.encrypted,
                "billingDetails": {
                    "name": "Infinity 8",
                    "city": "Infinity8",
                    "country": "US",
                    "postalCode": "4569",
                    "line1": "Infinity8",
                    "line2": "",
                    "district": "NA"
                },
                "metadata": {
                    "email": "info@infinity8.io",
                    "phoneNumber": "+919999999999",
                    "ipAddress": "192.168.1.1",
                    "sessionId": "DE6FA86F60BB47B379307F851E238617"
                },
                "idempotencyKey": `${response0}`,
                "keyId": `${config.circleApiKeyId}`,
                "expMonth": `${expMonth}`,
                "expYear": `${expYear}`
            })
        });
        const data2 = await response2.json();


        var source_id = data2.data.id;

        var encriptData = await pgpEncryption.pgpEncrypt(data1.data.publicKey, `{
         "number": ${number},
         "cvv": ${cvv}
     }`);
        const response3 = await fetch(`${config.circleApiUrl}payments`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.circleApiKey}`
            },
            body: JSON.stringify({
                "metadata": {
                    "email": "info@infinity.io",
                    "phoneNumber": "+919999999999",
                    "ipAddress": "192.168.1.1",
                    "sessionId": "DE6FA86F60BB47B379307F851E238617"
                },
                "amount": {
                    "amount": `${amount}`,
                    "currency": "INR"
                },
                "source": {
                    "id": source_id,
                    "type": "card"
                },
                "encryptedData": encriptData.encrypted,
                "keyId": `${config.circleApiKeyId}`,
                "idempotencyKey": `${response0}`,
                "verification": "cvv",
                "verificationSuccessUrl": "na",
                "verificationFailureUrl": "na",
                "description": "Payment"
            })
        });
        const data3 = await response3.json();

        if (data3.code) {

            return res.status(400).send({
                success: false,
                msg: data3.message
            });

        }
        if (!data3.code) {

            var insertdata = {
                user_id: user_id,
                amount: amount,
                purchased_quantity: resale_quantity,
                item_id: item_id,
                item_edition_id: item_edition_id,
                transaction_type_id: 9,
                currency: "INR",
                status: 1,

            }

            await db.query(marketplaceQueries.insertTransaction, [insertdata], async function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error: error
                    });
                }
                else {
                    return res.status(200).send({
                        success: true,
                        msg: 'Payment captured!!',
                        transaction_id: data.insertId
                    });

                }
            });
        }
    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err: err
        });
    }
}


exports.getJWTToken = async (db, req, res) => {
    console.log("in getJWTToken");
    const jwtToken = jwt.sign({
        email: req.body.email,
        id: req.body.user_id,
    }, config.JWT_SECRET_KEY, {
        expiresIn: config.SESSION_EXPIRES_IN
    })
    return res.status(200).send({
        success: true,
        responce: jwtToken
    })
}

/* ---------------------------  STRIPE PAYMENT GATEWAY IMPLEMENTATION ---------------*/

exports.addNftByUser = async (db, req, res) => {
    console.log("in addNftByUser");
    let user_id = req.body.user_id;
    let name = req.body.name;
    let description = req.body.description;
    let image = req.body.image;
    let image1 = req.body.image1;
    let property = req.body.property;
    let multiple_image_type = req.body.multiple_image_type;
    let file_type = req.body.file_type;
    let item_category_id = req.body.item_category_id;
    let price = req.body.price;
    let quantity = req.body.quantity;
    let sell_type = req.body.sell_type;
    let user_collection_id = req.body.user_collection_id;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;
    let expiry_date = req.body.expiry_date;
    var image_low = req.body.image;
    let user_address = req.body.address;
    let transaction_id = req.body.transaction_id;
    let royalty_percent = req.body.royalty_percent;
    let tokenId = req.body.tokenId;
    let productId = req.body.productId;
    let attributes = JSON.parse(req.body.attributes);
    let metadata = req.body.metadata;
    let external_link = req.body.external_link;
    let coin_percentage = req.body.coin_percentage;
    let unlockable_content = req.body.unlockable_content
    let nft_type = req.body.nft_type
    // let hybrid_shipment_address = req.body.hybrid_shipment_address
    // let hybrid_shipment_city = req.body.hybrid_shipment_city
    // let hybrid_shipment_zipcode = req.body.hybrid_shipment_zipcode
    // let hybrid_shipment_country = req.body.hybrid_shipment_country
    // let approve_by_admin = req.body.approve_by_admin;
    let is_on_sale = req.body.is_on_sale
    // if(file_type==='image'){
    let recCompress = await ipfsCompress.compressImages(["https://infinity8.mypinata.cloud/ipfs/" + image], file_type);
    console.log(recCompress.images[0]);
    // return res.status(400).send({
    //     recCompress
    // })
    if (recCompress.success == false) {
        console.log("compress false");
        // return res.status(400).send({
        //     success: false,
        //     msg: "Image compress issue "
        // });
        var image_low = image;
    } else {
        console.log("compressed")
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
    if (!file_type) {
        return res.status(400).send({
            success: false,
            msg: "file_type required!! "
        });
    }
    if (!description) {
        return res.status(400).send({
            success: false,
            msg: "description required!! "
        });
    }

    if (!price) {
        return res.status(400).send({
            success: false,
            msg: "Price required!! "
        });
    }
    if (!sell_type) {
        return res.status(400).send({
            success: false,
            msg: "Sell type required!! "
        });
    }

    await db.query(adminQueries.getSettings, async function (error, commissionPercent) {
        if (error) {

            return res.status(400).send({
                success: false,
                msg: "error occured in item insert",
                error
            });
        }
        var users = {
            "name": name,
            "description": description,
            "image": image_low,
            "image_original": image,
            "file_type": file_type,
            "item_category_id": item_category_id,
            "user_collection_id": user_collection_id,
            "start_date": start_date,
            "price": price,
            "owner_id": user_id,
            "created_by": user_id,
            "sell_type": sell_type,
            "expiry_date": expiry_date,
            "quantity": quantity,
            'token_id': tokenId,
            "productId":productId,
            "local_image": recCompress.images[0],
            "metadata": metadata,
            "external_link": external_link,
            "coin_percentage": coin_percentage,
            "unlockable_content": unlockable_content,
            "nft_type": nft_type,
            "address": user_address,
            "hybrid_shipment_address": hybrid_shipment_address,
            "hybrid_shipment_city": hybrid_shipment_city,
            "hybrid_shipment_zipcode": hybrid_shipment_zipcode,
            "hybrid_shipment_country": hybrid_shipment_country,
            "royalty_percent": royalty_percent,
            "commission_percent": commissionPercent[0].commission_percent,
            "approve_by_admin": approve_by_admin,
            "is_on_sale": is_on_sale

        }
        console.log("users", users);

        await db.query(marketplaceQueries.insertItem, [users], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured in item insert",
                    errors: error
                });
            }

            var transactionData = {
                "item_id": data.insertId
            }
            db.query(marketplaceQueries.updateTransaction, [transactionData, transaction_id]);

            // /**---------------------------IPFS Json ---------------------------------- */
            var additem = {
                "name": name,
                "description": description,
                "image": 'https://infinity8.mypinata.cloud/ipfs/' + image
            }
            var userfile = 'item_'.concat(data.insertId, '.json');


            try {
                fs.writeFile(`./metadata/${userfile}`, JSON.stringify(additem), async (err, fd) => {

                    // Checking for errors
                    if (err) throw err;



                    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

                    let formdata = new FormData();

                    console.log("Done writing"); // Success

                    formdata.append('file', fs.createReadStream('./metadata/' + userfile))

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
                    //console.log("before updtemeta");
                    db.query(marketplaceQueries.updatemeta, [filedata.IpfsHash, data.insertId], (error, data235) => {

                    })



                    /*-------------------------------------------------------------------------------------*/
                    // for (let i = 0; i < image1.length; i++) {

                    //     if (i >= 0) {

                    //         var insertData = {
                    //             "item_id": data.insertId,
                    //             "name": image1[i],
                    //             "ip": null,
                    //             "datetime": new Date()
                    //         }
                    //         await db.query(marketplaceQueries.additemimages, [insertData])
                    //     };

                    // }

                    if (attributes.length > 0) {
                        for (var i = 0; i < attributes.length; i++) {
                            var array = {
                                'item_id': data.insertId,
                                'type': attributes[i].type,
                                'value': attributes[i].value
                            }
                            await db.query(marketplaceQueries.insertItemAttr, [array], async function (error, attrData) {

                            })
                        }
                    }


                    /*  -----------------------------------Insertinto Edition */

                    for (var i = 1; i <= quantity; i++) {


                        var item_ed = {
                            "edition_text": `${i} of ${quantity}`,
                            "edition_no": i,
                            "item_id": data.insertId,
                            "is_sold": 0,
                            "owner_id": user_id,
                            "user_collection_id": user_collection_id,
                            "start_date": start_date,
                            "end_date": end_date,
                            "expiry_date": expiry_date,
                            "user_address": user_address,
                            "price": price,
                            "ip": null,
                            "datetime": new Date()
                        };

                        await db.query(marketplaceQueries.insertEdition, [item_ed])
                    }
                    /* ---------------------------------------------------------- */
                    await db.query(marketplaceQueries.getItemEdition, [data.insertId], async function (error, iedata) {
                        if (error) {

                            return res.status(400).send({
                                success: false,
                                msg: "error occured in item insert",
                                error
                            });
                        }

                        if (data) {
                            await db.query(marketplaceQueries.getWalletDetail, [user_id], async function (error, walletData) {
                                if (error) {

                                    return res.status(400).send({
                                        success: false,
                                        msg: "error occured in item insert",
                                        error
                                    });
                                }

                                await db.query(adminQueries.getSettings, async function (error, settingData) {
                                    if (error) {

                                        return res.status(400).send({
                                            success: false,
                                            msg: "error occured in item insert",
                                            error
                                        });
                                    }
                                    var contract = `${config.contractAddress}`; //LIVE CONTRACT


                                    console.log(settingData[0].private_key);

                                    var apiData = await openNFT(settingData[0].private_key);
                                    var apiData1 = await openNFT(settingData[0].public_key);

                                    console.log(apiData);
                                    const response1 = await fetch(`${config.blockchainApiUrl}mint`, {
                                        method: 'POST', headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            "from_address": `${apiData1}`,
                                            "from_private_key": `${apiData}`,
                                            "contract_address": `${contract}`,
                                            "to_address": user_address,
                                            "MetaDataHash": `${filedata.IpfsHash}`,
                                            "TokenName": `${name}`,
                                            "TokenId": `${data.insertId}`,
                                            "totalSupply": `${quantity}`
                                        })
                                    });
                                    console.log({
                                        "from_address": `${apiData1}`,
                                        "from_private_key": `${apiData}`,
                                        "contract_address": `${contract}`,
                                        "to_address": user_address,
                                        "MetaDataHash": `${filedata.IpfsHash}`,
                                        "TokenName": `${name}`,
                                        "TokenId": `${data.insertId}`,
                                        "totalSupply": `${quantity}`
                                    });
                                    const data1 = await response1.json();
                                    console.log(data1);
                                    if (!data1.hash) {
                                        return res.status(400).send({
                                            success: false,
                                            msg: "error occured in mint NFT",
                                            error
                                        });
                                    }

                                    var updateData = {
                                        "token_hash": data1.hash,
                                        "token_id": data.insertId
                                    }
                                    await db.query(marketplaceQueries.updateItem, [updateData, data.insertId], async function (error, data) {
                                        if (error) {
                                            return res.status(400).send({
                                                success: false,
                                                msg: "error occured in update item table",
                                                error
                                            });

                                        }
                                    })
                                    /// SEND MAIL STARTS
                                    qry = `select * from users where id =${user_id}`;

                                    await db.query(qry, async function (error, mailData) {
                                        emailActivity.Activity(mailData[0].email, 'NFT Created', `You have created NFT (${name}) for $${price}.`, `featurescreator/${user_id}`, `https://ipfs.io/ipfs/${image}`);

                                    });
                                    /// SEND MAIL ENDS    
                                    res.status(200).send({
                                        success: true,
                                        msg: "Item Inserted Successfully",
                                        item_edition_id: iedata[0].id,
                                        item_id: data.insertId
                                    });

                                });
                            });

                        } else {
                            res.status(400).send({
                                success: false,
                                msg: "Something Wrong due to internal Error"
                            });
                        }
                    });
                });
            } catch (e) {
                return res.status(400).send({
                    success: false,
                    e
                });
            }


        });
    });

}


exports.getQR = async (db, req, res) => {
    console.log("in getQR");

    var user_id = req.body.user_id;

    await db.query(marketplaceQueries.getUserAuth, [user_id], async function (error, data) {
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
                msg: "QR Code",
                response: data[0]
            });

        } else {
            res.status(400).send({
                success: false,
                msg: "No Data Found"
            });
        }

    });
}

exports.twoAuthenticationVerify = async (db, req, res) => {
    console.log("in twoAuthenticationVerify");
    var user_id = req.body.user_id;
    var userToken = req.body.SecretKey;
    var enableTwoFactor = req.body.enableTwoFactor;
    await db.query(marketplaceQueries.getUserAuth, [user_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        var abc = data[0].googleAuthCode;
        var tokenValidates = speakeasy.totp.verify({
            secret: abc,
            encoding: 'base32',
            token: userToken,
            window: 0
        });

        if (tokenValidates) {
            await db.query(marketplaceQueries.updateUsersAuth, [enableTwoFactor, user_id]);

            res.status(200).send({
                success: true,
                msg: "Result",
                response: tokenValidates
            });

        } else {
            res.status(400).send({
                success: false,
                msg: "Token misMatch"
            });
        }

    });
}

exports.getUserRealEstate = async (db, req, res) => {
    console.log("in getUserRealEstate");
    var user_id = req.body.user_id;
    await db.query(marketplaceQueries.getUserRealEstate, [user_id], function (error, data) {
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
                msg: "Real estate users detail!!",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.getUserTalentById = async (db, req, res) => {
    console.log("in getUserTalentById");
    var user_id = req.body.user_id;
    await db.query(marketplaceQueries.getUserTalentById, [user_id], function (error, data) {
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
                msg: "User talent detail!!",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Data not found!!"
            });
        }
    });
}


exports.getRealEstate = async (db, req, res) => {
    console.log("in getRealEstate");
    await db.query(marketplaceQueries.getRealEstate, function (error, data) {
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
                msg: "Real estate users detail!!",
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
exports.updateRealEstateUser = async (db, req, res) => {
    console.log("in updateRealEstateUser");
    var id = req.body.id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var country_id = req.body.country_id;
    var city = req.body.city;
    var description = req.body.description;
    var website = req.body.website;
    var insta = req.body.insta;


    await db.query(marketplaceQueries.updateRealEstateUser, [first_name, last_name, email, country_id, city, description, website, insta, id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Real estate user Updated!!"
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Updation Error"
            });
        }
    });
}

exports.updateTalentUser = async (db, req, res) => {
    console.log("in updateTalentUser");
    var id = req.body.id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var talent_email = req.body.talent_email;
    var description = req.body.description;
    var facebook = req.body.facebook;
    var youtube = req.body.youtube;
    var twitter = req.body.twitter;
    var insta = req.body.insta;
    var country_id = req.body.country_id;
    var city = req.body.city;
    var follower = req.body.follower;


    await db.query(marketplaceQueries.updateTalentUser, [first_name, last_name, talent_email, description, facebook, youtube, twitter, insta, country_id, city, follower, id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data) {
            res.status(200).send({
                success: true,
                msg: "Talent user Updated!!"
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Updation Error"
            });
        }
    });
}


exports.getCategoryById = async (db, req, res) => {
    console.log("in getCategoryById");
    var item_category_id = req.body.item_category_id;
    var limit = req.body.limit;


    var qry = "Select i.id as item_id,ie.id as item_edition_id,i.image,i.file_type,case when length(i.name)>=30 then concat(left(i.name,30),'...')  else i.name end as name,i.name as item_fullname,i.price,i.description from item_edition as ie left join item as i on i.id=ie.item_id where ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 and (expiry_date >= now() or expiry_date is null) group by item_id) ";

    if (item_category_id > 0) {
        qry = qry + ` and i.item_category_id=${item_category_id}`
    }
    qry = qry + " order by rand() ";
    if (limit > 0) {
        qry = qry + ` limit ${limit}`
    }


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
                msg: "Category Item Detail",
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


/* -------------------End Item -------------------------*/

/* Bid process methods */


exports.insertBid = async (db, req, res) => {
    console.log("in insretBid");
    var user_id = req.body.user_id;
    var item_edition_id = req.body.item_edition_id;
    var bid_price = req.body.bid_price;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required!!"
        });
    }

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required!!"
        });
    }
    if (!item_edition_id) {
        return res.status(400).send({
            success: false,
            msg: "item_edition_id required!!"
        });
    }

    if (!bid_price) {
        return res.status(400).send({
            success: false,
            msg: "bid_price required!!"
        });
    }
    var insertdata = {
        user_id: user_id,
        item_edition_id: item_edition_id,
        bid_price: bid_price
    }
    console.log("insertData ", insertdata)

    // get last bid
    await db.query(marketplaceQueries.getLastBid, item_edition_id, async function (error, bidData) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        console.log("bidData ", bidData);
        // reject last bid
        await db.query(marketplaceQueries.rejectBid, bidData[0].id, async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            /// refund amount
            var qry = `insert into transaction (user_id,item_edition_id,transaction_type_id,amount,currency,item_edition_bid_id,status) select user_id,item_edition_id,12 as transaction_type_id,bid_price,'ETH' AS currency,id,1 as status from item_edition_bid where id=${bidData[0].id} `;
            console.log(qry)
            await db.query(qry, async function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
                await db.query(marketplaceQueries.insertBid, [insertdata], async function (error, data) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "Error occured!!",
                            error
                        });
                    }
                    if (data) {
                        /// SEND MAIL STARTS
                        qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ie.id=${item_edition_id}`;

                        await db.query(qry, async function (error, mailData) {
                            emailActivity.Activity(mailData[0].ownerEmail, 'Bid Placed', `Bid Placed on  ${mailData[0].name} for $${bid_price}.`, `salehistory`, `https://ipfs.io/ipfs/${mailData[0].image}`);

                            emailActivity.Activity(mailData[0].bidderEmail, 'Bid Placed', `You have placed bid on  ${mailData[0].name} for $${bid_price}.`, `yourpurchase`, `https://ipfs.io/ipfs/${mailData[0].image}`);
                        });
                        /// SEND MAIL ENDS    

                        /// SEND MAIL FOR PURCHASING NFT ENDS
                        return res.status(200).send({
                            success: true,
                            msg: "User Bid Inserted Successfully",
                        });
                    } else {
                        res.status(400).send({
                            success: false,
                            msg: "Something Wrong due to internal Error"
                        });
                    }
                });
            });
        });
    });
}


exports.getBidDetail = async (db, req, res) => {
    console.log("in getBidDetail");
    var item_edition_id = req.body.item_edition_id

    await db.query(marketplaceQueries.getBidDetail, [item_edition_id], function (error, data) {
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
                msg: "Item Bid Details",
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


exports.getWalletDetail = async (db, req, res) => {
    console.log("in getWalletDetail");
    var user_id = req.body.user_id
    await db.query(marketplaceQueries.getWalletDetail, [user_id], function (error, data) {
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
                msg: "User's wallet detail!!",
                user_id: data[0].user_id,
                balance: data[0].balance.toFixed(6),
                inr_balance: data[0].inr_balance.toFixed(2),
                public: data[0].public,
                private: '',
                token_balance: data[0].balance.toFixed(6),
                eth_usd_value: data[0].balance.toFixed(6)
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error!!"
            });
        }
    });
}

exports.bidAccept = async (db, req, res) => {
    console.log("in bidAccept");
    var user_id = req.body.user_id;
    var item_id = req.body.item_id;
    var payment_id = req.body.payment_id;
    var item_edition_id = req.body.item_edition_id;
    var bid_id = req.body.bid_id;
    var is_sold = 1;
    var token_owner_address = req.body.token_owner_address

    await db.query(marketplaceQueries.getBidRecord, [bid_id], async function (error, biddata) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured in getWalletDetail",
                error
            });
        }



        await db.query(marketplaceQueries.getWalletDetail, [biddata[0].user_id], async function (error, walletDetail) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured in getWalletDetail",
                    error
                });
            }
            var publickey = walletDetail[0].public;

            await db.query(marketplaceQueries.ownerDetail, [item_edition_id, item_edition_id], async function (error, ownerData) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured in udpateSold",
                        error
                    });
                }
                await db.query(marketplaceQueries.getSettingData, async function (error, settingData) {
                    var apiData = await openNFT(settingData[0].public_key);
                    var apiData2 = await openNFT(settingData[0].private_key);

                    console.log({
                        "from_address": `${apiData}`,
                        "from_private_key": `${apiData2}`,
                        "contract_address": `${config.contractAddress}`,
                        "to_address": `${biddata[0].address}`,
                        "token_owner_address": ownerData[0].address,
                        "tokenId": `${item_id}`,
                        "amount": 1
                    })
                    /* run ownership changes api */
                    const response1 = await fetch(`${config.blockchainApiUrl}transfer`, {
                        method: 'POST', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "from_address": `${apiData}`,
                            "from_private_key": `${apiData2}`,
                            "contract_address": `${config.contractAddress}`,
                            "to_address": `${biddata[0].address}`,
                            "token_owner_address": ownerData[0].address,
                            "tokenId": `${item_id}`,
                            "amount": 1
                        })
                    });

                    const data1 = await response1.json();

                    if (!data1.hash) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in ownership transfer",
                            apidata: data1
                        });
                    }

                    /* end ownership change api */
                    await db.query(marketplaceQueries.insertSellTransactionByBidId, [bid_id], async function (error, data3) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured in insertSellTransactionByBidId!!",
                                error
                            });
                        }
                    });

                    await db.query(marketplaceQueries.updateSold2, [is_sold, biddata[0].user_id, data1.hash, publickey, item_edition_id], async function (error, data) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured!!",
                                error
                            });
                        }

                        await db.query(marketplaceQueries.updateItemBid, [item_edition_id, bid_id], async function (error, data) {
                            if (error) {
                                return res.status(400).send({
                                    success: false,
                                    msg: "Error occured updateItemBid!!",
                                    error
                                });
                            }

                            await db.query(marketplaceQueries.updateItemBid2, [bid_id], async function (error, data) {
                                if (error) {
                                    return res.status(400).send({
                                        success: false,
                                        msg: "Error occured in updateItemBid2!!",
                                        error
                                    });
                                }

                                await db.query(marketplaceQueries.insertBuyTransactionByBidId, [biddata[0].user_id, bid_id], async function (error, data3) {
                                    if (error) {
                                        return res.status(400).send({
                                            success: false,
                                            msg: "Error occured in insertBuyTransactionByBidId!!",
                                            error
                                        });
                                    }
                                    var qry2 = `insert into transaction_edition_purchase(transaction_id,item_edition_id)values(${data3.insertId},${item_edition_id})`;
                                    db.query(qry2);

                                    await db.query(marketplaceQueries.getItemDetails, [item_edition_id], async function (error, data1) {
                                        if (error) {
                                            return res.status(400).send({
                                                success: false,
                                                msg: "Error occured!!",
                                                error
                                            });
                                        }
                                        var itemHistroy = {
                                            "user_id": data1[0].created_by,
                                            "item_edition_id": data1[0].item_edition_id,
                                            "owner": data1[0].user_name
                                        }


                                        await db.query(marketplaceQueries.insertOwnerHistory, [itemHistroy], async function (error, data2) {
                                            if (error) {
                                                return res.status(400).send({
                                                    success: false,
                                                    msg: "Error occured!!",
                                                    error
                                                });
                                            }

                                            /// SEND MAIL STARTS
                                            qry = `select i.name,i.description,i.image,getUserFullName(ieb.user_id) as bidderName,getUserEmail(${user_id}) as ownerEmail,getUserEmail(ieb.user_id) as bidderEmail,ieb.bid_price from item_edition_bid as ieb left join item_edition as ie on ie.id=ieb.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ieb.id=${bid_id}`;

                                            await db.query(qry, async function (error, mailData) {
                                                emailActivity.Activity(mailData[0].ownerEmail, `Bid Accepted`, `You have accepted bid of $${mailData[0].bid_price} for ${mailData[0].name}.`, `nftdetail/${data1[0].item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);

                                                emailActivity.Activity(mailData[0].bidderEmail, 'Bid Accepted', `Your bid has been accepted for $${mailData[0].bid_price} for ${mailData[0].name}.`, `nftdetail/${data1[0].item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);
                                            });
                                            /// SEND MAIL ENDS    


                                            if (data) {
                                                return res.status(200).send({
                                                    success: true,
                                                    msg: "Item Sold ",
                                                });
                                            } else {
                                                return res.status(400).send({
                                                    success: false,
                                                    msg: "Something Wrong due to internal Error"
                                                });
                                            }

                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

exports.getRealEstateStatus = async (db, req, res) => {
    console.log("in getRealEstateStatus");
    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getRealEstateStatus, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Users Telent Status",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.getTelentStatus = async (db, req, res) => {
    console.log("in getTelentStatus");
    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getTelentStatus, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }

        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Users Telent Status",
                response: data
            });
        } else {
            return res.status(204).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}


exports.resaleTrxStart = async (db, req, res) => {
    console.log("in resaleTrxStart");

    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var trx_type = 'resale';
    var user_address = req.body.user_address;
    var item_id = req.body.item_id;
    var item_edition_id = req.body.item_edition_id;
    var resale_quantity = req.body.resale_quantity;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }

    if (!user_address) {
        return res.status(400).send({
            success: false,
            msg: "user_address required"
        });
    }

    if (!amount) {
        return res.status(400).send({
            success: false,
            msg: "amount required"
        });
    }
    var transaction = {
        "user_id": user_id,
        "transaction_type_id": 9,
        "amount": amount * -1,
        "purchased_quantity": resale_quantity,
        "currency": "INR",
        "status": 0,
        "user_address": user_address,
        "item_id": item_id,
        "item_edition_id": item_edition_id
    }

    await db.query(marketplaceQueries.insertTransaction, [transaction], async function (error, trxdata) {

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured in insertTransaction!!",
                error
            });
        }

        var insertData = {
            "bid_price": amount,
            "transaction_status": 'begin',
            "trx_type": trx_type,
            "transaction_id": trxdata.insertId,
            "user_address": user_address,
            "item_id": item_id,
            "item_edition_id": item_edition_id,
            "purchased_quantity": resale_quantity
        }

        await db.query(marketplaceQueries.onlinetrx_start, [insertData], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data) {

                /* run token api */
                // console.log(JSON.stringify({
                //     "external_id": `${trxdata.insertId}`,
                //     "hosted_payment_id": `${config.netCentshostedPaymentId}`,
                //     "amount": `${amount}`,
                //     "email": "",
                //     "first_name": "",
                //     "last_name": ""
                // }));
                //console.log(config.netCentshostedPaymentId);
                //console.log(config.netCentsAuthorization);
                const response1 = await fetch('https://api.net-cents.com/merchant/v2/widget_payments', {
                    method: 'POST', headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `${config.netCentsAuthorization}`
                    },
                    body: JSON.stringify({
                        "external_id": `${trxdata.insertId}`,
                        "hosted_payment_id": `${config.netCentshostedPaymentId}`,
                        "amount": `${amount}`,
                        "email": "",
                        "first_name": "",
                        "last_name": ""
                    })
                });
                const data1 = await response1.json();

                if (!data1.token) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }

                /* end token api */
                return res.status(200).send({
                    success: true,
                    msg: "Your request submitted successfully!! ",
                    external_id: trxdata.insertId,
                    token: data1.token,
                    id: data1.id,
                    status: data1.status

                });
            } else {
                return res.status(400).send({
                    success: false,
                    msg: "No Data"
                });
            }
        });
    });
}


exports.nftTrx_start = async (db, req, res) => {
    console.log("in nftTrx_start");

    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var trx_type = 'create';
    var user_address = req.body.user_address;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }

    if (!user_address) {
        return res.status(400).send({
            success: false,
            msg: "user_address required"
        });
    }

    if (!amount) {
        return res.status(400).send({
            success: false,
            msg: "amount required"
        });
    }
    var transaction = {
        "user_id": user_id,
        "transaction_type_id": 7,
        "amount": amount * -1,
        "currency": "INR",
        "status": 0,
        "user_address": user_address
    }
    await db.query(marketplaceQueries.insertTransaction, [transaction], async function (error, trxdata) {

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured in insertTransaction!!",
                error
            });
        }

        var insertData = {
            "bid_price": amount,
            "transaction_status": 'begin',
            "trx_type": trx_type,
            "transaction_id": trxdata.insertId,
            "user_address": user_address
        }

        await db.query(marketplaceQueries.onlinetrx_start, [insertData], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data) {

                /* run token api */


                const response1 = await fetch('https://api.net-cents.com/merchant/v2/widget_payments', {
                    method: 'POST', headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `${config.netCentsAuthorization}`
                    },
                    body: JSON.stringify({
                        "external_id": `${trxdata.insertId}`,
                        "hosted_payment_id": `${config.netCentshostedPaymentId}`,
                        "amount": `${amount}`,
                        "email": "",
                        "first_name": "",
                        "last_name": ""
                    })
                });
                const data1 = await response1.json();

                if (!data1.token) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }

                /* end token api */
                return res.status(200).send({
                    success: true,
                    msg: "Your request submitted successfully!! ",
                    external_id: trxdata.insertId,
                    token: data1.token,
                    id: data1.id,
                    status: data1.status

                });
            } else {
                return res.status(400).send({
                    success: false,
                    msg: "No Data"
                });
            }
        });
    });
}


exports.onlinetrx_start = async (db, req, res) => {
    console.log("in onlinetrx_start");
    var user_id = req.body.user_id;
    var item_id = req.body.item_id;
    var item_edition_id = req.body.item_edition_id;
    var bid_id = req.body.bid_id;
    var amount = req.body.amount;
    var sell_type = req.body.sell_type;
    var user_address = req.body.user_address;
    var purchased_quantity = req.body.purchased_quantity;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "User ID required"
        });
    }

    if (!item_id) {
        return res.status(400).send({
            success: false,
            msg: "Item ID required"
        });
    }

    if (!amount) {
        return res.status(400).send({
            success: false,
            msg: "amount required"
        });
    }
    if (!sell_type) {
        return res.status(400).send({
            success: false,
            msg: "sell_type required"
        });
    }
    if (!item_edition_id) {
        return res.status(400).send({
            success: false,
            msg: "item_edition_id required"
        });
    }
    if (!user_address) {
        return res.status(400).send({
            success: false,
            msg: "user_address required"
        });
    }

    if (!purchased_quantity) {
        return res.status(400).send({
            success: false,
            msg: "purchased_quantity required"
        });
    }

    var transactiontypeid = 4;
    if (sell_type === 'Price') {
        transactiontypeid = 6;
    }

    var transaction = {
        "user_id": user_id,
        "transaction_type_id": transactiontypeid,
        "amount": amount * -1,
        "purchased_quantity": purchased_quantity,
        "item_id": item_id,
        "item_edition_id": item_edition_id,
        "item_edition_bid_id": bid_id,
        "user_address": user_address,
        "currency": "INR",
        "status": 0
    }
    await db.query(marketplaceQueries.insertTransaction, [transaction], async function (error, trxdata) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured in insertTransaction!!",
                error
            });
        }

        var qry2 = `update transaction set edition_text=concat(getEditionNo(${item_edition_id}),'-',${purchased_quantity}+getEditionNo(${item_edition_id})-1,' of ',getEditionCount(${item_id})) where id =${trxdata.insertId}`;

        await db.query(qry2);


        var insertData = {
            "user_id": user_id,
            "item_id": item_id,
            "item_edition_id": item_edition_id,
            "item_edition_bid_id": bid_id,
            "bid_price": amount,
            "purchased_quantity": purchased_quantity,
            "transaction_status": 'begin',
            "transaction_id": trxdata.insertId,
            "user_address": user_address
        }
        await db.query(marketplaceQueries.onlinetrx_start, [insertData], async function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data) {

                /* run token api */
                const response1 = await fetch('https://api.net-cents.com/merchant/v2/widget_payments', {
                    method: 'POST', headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `${config.netCentsAuthorization}`
                    },
                    body: JSON.stringify({
                        "external_id": `${trxdata.insertId}`,
                        "hosted_payment_id": `${config.netCentshostedPaymentId}`,
                        "amount": `${amount}`,
                        "email": "",
                        "first_name": "",
                        "last_name": ""
                    })
                });
                const data1 = await response1.json();

                if (!data1.token) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }

                /* end token api */
                return res.status(200).send({
                    success: true,
                    msg: "Your request submitted successfully!! ",
                    external_id: trxdata.insertId,
                    token: data1.token,
                    id: data1.id,
                    status: data1.status

                });
            } else {
                return res.status(400).send({
                    success: false,
                    msg: "No Data"
                });
            }
        });
    });
}

exports.cryptoTrxCanceled = async (db, req, res) => {
    console.log("in cryptoTrxCanceled");
    var external_id = req.body.external_id;

    var udpateData = {
        "status": 3
    }

    await db.query(marketplaceQueries.updateTransaction, [udpateData, external_id], function (error, data) {
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
                msg: "Transaction updated successfully"
            });
        }
    });
}


exports.getUserBids = async (db, req, res) => {
    console.log("in getUserBids");
    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getUserBids, [user_id, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "User bids detail",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.getfaq = async (db, req, res) => {
    console.log("in getfaq");
    await db.query(marketplaceQueries.getfaq, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Item Details",
                response: data
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No Data"
            });
        }
    });
}




exports.blockchainupdatetransaction = async (db, req, res) => {
   
    let user_id = req.body.user_id;
    let token_owner_address = req.body.token_owner_address;
    let item_id = req.body.item_id;
    let user_address = req.body.user_address;
    let purchased_quantity =req.body.purchased_quantity;
    
    await db.query(adminQueries.getSettings, async function (error, settingData) {
        var apiData = await openNFT(settingData[0].private_key);
        var apiData2 = await openNFT(settingData[0].public_key);

        var from = apiData2;
        var fromprivate = apiData;
        let data1hash = '';
        if (!user_address || user_address == null || user_address == 'null' || user_address == "") {

        } else {
            console.log({
                "from_address": `${from}`,
                "from_private_key": `${fromprivate}`,
                "contract_address": `${config.contractAddress}`,
                "to_address": user_address,
                "token_owner_address": token_owner_address,
                "tokenId": `${item_id}`,
                "amount": purchased_quantity
            })

            const response1 = await fetch(`${config.blockchainApiUrl}transfer`, {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "from_address": `${from}`,
                    "from_private_key": `${fromprivate}`,
                    "contract_address": `${config.contractAddress}`,
                    "to_address": user_address,
                    "token_owner_address": token_owner_address,
                    "tokenId": `${item_id}`,
                    "amount": purchased_quantity
                })
            });
            const data1 = await response1.json();

            console.log('hello',data1,response1.json(),data1.hash)

            if (!data1.hash) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured in ownership transfer",
                    apidata: data1
                });
            }

            data1hash = data1.hash

            let data = {
                from_address : from,
                to_address : user_address,
                hash : data1.hash,
                blockchain_status :1
            }

            await db.query(adminQueries.updateblockchainstatus,[data,user_id,item_id],async function (error, trx){

                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured in transfer NFT",
                        error
                    });
                }

                if(trx){
            return res.status(200).send({
                success: true,
                msg: "Ownership changed successfully",
                // transaction_id: buydata.insertId
            });
                }
            })
   
        }
    })
}


exports.itemPurchase = async (db, req, res) => {
    console.log("in itemPurchase");
    var amount = req.body.amount;
    var id = req.body.id;
    var user_id = req.body.user_id
    var item_id = req.body.item_id
    var item_edition_id = req.body.item_edition_id
    var sell_type = req.body.sell_type
    var user_address = req.body.user_address;
    var purchased_quantity = req.body.purchased_quantity;
    var royalty_percent = req.body.royalty_percent;
    var token_owner_address = req.body.token_owner_address
    let token = req.body.coin_percentage
    try {



        if (sell_type === 'Price') {
            /// transactoin for sell product start
            console.log('ddddd', user_address);
            
            await db.query(adminQueries.getSettings, async function (error, settingData) {
                var apiData = await openNFT(settingData[0].private_key);
                var apiData2 = await openNFT(settingData[0].public_key);

                var from = apiData2;
                var fromprivate = apiData;
                let data1hash = '';
                console.log({
                    "from_address": `${from}`,
                    "from_private_key": `${fromprivate}`,
                    "contract_address": `${config.contractAddress}`,
                    "to_address": user_address,
                    "token_owner_address": token_owner_address,
                    "tokenId": `${item_id}`,
                    "amount": purchased_quantity
                })
                if (!user_address || user_address == null || user_address == 'null' || user_address == "") {

                } else {
                    console.log({
                        "from_address": `${from}`,
                        "from_private_key": `${fromprivate}`,
                        "contract_address": `${config.contractAddress}`,
                        "to_address": user_address,
                        "token_owner_address": token_owner_address,
                        "tokenId": `${item_id}`,
                        "amount": purchased_quantity
                    })

                    const response1 = await fetch(`${config.blockchainApiUrl}transfer`, {
                        method: 'POST', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "from_address": `${from}`,
                            "from_private_key": `${fromprivate}`,
                            "contract_address": `${config.contractAddress}`,
                            "to_address": user_address,
                            "token_owner_address": token_owner_address,
                            "tokenId": `${item_id}`,
                            "amount": purchased_quantity
                        })
                    });
                    const data1 = await response1.json();

                    if (!data1.hash) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in ownership transfer",
                            apidata: data1
                        });
                    }

                    data1hash = data1.hash

                }

                await db.query(marketplaceQueries.itemdetail, [item_edition_id, 0, item_edition_id, item_edition_id], async function (error, trx) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in insertSellTransactionByItemId111",
                            error
                        });
                    }

                    if (trx[0].is_resale === 0) {
                        var sellerPercent = 100;
                    }
                    else {
                        var sellerPercent = 100 - trx[0].royalty_percent;
                        ///////// INSERT ROYALTY TRX
                        console.log("insert royalty trx", trx[0].price, purchased_quantity, sellerPercent);
                        await db.query(marketplaceQueries.insertRoyaltyTransactionByItemId, [trx[0].price * purchased_quantity * trx[0].royalty_percent / 100, trx[0].item_edition_id], async function (error, selldata) {
                            if (error) {
                                return res.status(400).send({
                                    success: false,
                                    msg: "error occured in insertRoyaltyTransactionByItemId",
                                    error
                                });
                            }
                        });
                    }
                    var saleAmount = (trx[0].price * purchased_quantity * sellerPercent / 100) - (trx[0].price * settingData[0].commission_percent / 100) - (token * settingData[0].coin_value);

                    await db.query(marketplaceQueries.insertSellTransactionByItemId, [saleAmount, user_address, settingData[0].commission_percent, trx[0].price * settingData[0].commission_percent / 100, item_edition_id], async function (error, selldata) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured in insertSellTransactionByItemId123",
                                error
                            });
                        }
                    });


                    if (token > 0) {
                        var trx2 = {
                            "user_id": trx[0].user_id,
                            "transaction_type_id": '13',
                            "amount": 0,
                            "from_address": user_address,
                            "to_address": token_owner_address,
                            "hash": data1hash,
                            "token": token,
                            "payment_currency": 0,
                            "payment_currency_amount": 0,
                            "currency": 'DigiPhyNFT',
                            "status": 1
                        }

                        await db.query(marketplaceQueries.insertTransaction, [trx2])
                    }


                    // var trx3 = {
                    //     "user_id": user_id,
                    //     "transaction_type_id": '6',
                    //     "amount": 0,
                    //     "from_address": user_address,
                    //     "to_address": token_owner_address,
                    //     "hash": data1.hash,
                    //     "token": token * -1,
                    //     "payment_currency": 0,
                    //     "payment_currency_amount": 0,
                    //     "currency": 'DigiPhyNFT',
                    //     "status": 1
                    // }

                    // await db.query(marketplaceQueries.insertTransaction, [trx3])

                    //// transactoin for sell product ends

                    await db.query(marketplaceQueries.insertBuyTransactionByItemId, [user_id, parseFloat(token) * -1, parseFloat(amount) * -1, user_address, item_edition_id], async function (error, buydata) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured in insertBuyTransactionByItemId",
                                error
                            });
                        }
                        await db.query(marketplaceQueries.getWalletDetail, [user_id], async function (error, walletDetail) {
                            if (error) {
                                return res.status(400).send({
                                    success: false,
                                    msg: "error occured in getWalletDetail",
                                    error
                                });
                            }


                            console.log("udpate itemedition to sold");

                            var qry = `select id from item_edition where item_id=${item_id} and owner_id=getOwnerId(${item_edition_id}) order by id limit ${purchased_quantity}`;
                            await db.query(qry, async function (error, loop1) {

                                for (var i = 0; i < loop1.length; i++) {
                                    await db.query(marketplaceQueries.updateSold2, [1, user_id, data1hash, user_address, loop1[i].id]);

                                    var qry2 = `insert into transaction_edition_purchase(transaction_id,item_edition_id)values(${buydata.insertId},${loop1[i].id})`;
                                    db.query(qry2);

                                }
                            });
                            var qry2 = `update transaction set purchased_quantity=${purchased_quantity},edition_text=concat(getEditionNo(${item_edition_id}),'-',${purchased_quantity}+getEditionNo(${item_edition_id})-1,' of ',getEditionCount(${item_id})) where id =${buydata.insertId}`;

                            await db.query(qry2);

                            //console.log('updating updateSold-edition_id' + item_edition_id);
                            console.log("updtesoldpaypal");
                            await db.query(marketplaceQueries.updateSoldPaypal, [1, user_id, item_edition_id], async function (error, data) {
                                if (error) {
                                    return res.status(400).send({
                                        success: false,
                                        msg: "error occured in udpateSold",
                                        error
                                    });
                                }



                                console.log("updateTransferHash");
                                await db.query(marketplaceQueries.updateTransferHash, [data1hash, item_edition_id], async function (error, data) {
                                    if (error) {
                                        return res.status(400).send({
                                            success: false,
                                            msg: "Error occured in updateTransferHash!!",
                                            error
                                        });
                                    }
                                    else {
                                        //console.log('without error 2273');
                                    }


                                    /* end ownership change api */
                                    /// SEND MAIL STARTS
                                    qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ie.id=${item_edition_id}`;
                                    console.log(qry);
                                    await db.query(qry, async function (error, mailData) {
                                        await emailActivity.Activity(mailData[0].ownerEmail, `NFT purchased by ${mailData[0].name}`, `Your NFT  ${mailData[0].name} has been purchased by ${mailData[0].name} in $ ${amount}.`, `nftdetail/${item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);

                                        await emailActivity.Activity(mailData[0].bidderEmail, 'NFT Purchased', `You have purchased NFT  ${mailData[0].name} in $ ${amount}.`, `nftdetail/${item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);

                                        /// SEND MAIL ENDS    
                                        return res.status(200).send({
                                            success: true,
                                            msg: "Ownership changed successfully",
                                            transaction_id: buydata.insertId
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            })


        }
        else {

            //console.log('after mail 2322');

            // get last bid
            await db.query(marketplaceQueries.getLastBid, item_edition_id, async function (error, bidData) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
                console.log("bidData ", bidData);
                // reject last bid
                if (bidData.length > 0) {
                    await db.query(marketplaceQueries.rejectBid, bidData[0].id, async function (error, data) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured!!",
                                error
                            });
                        }
                    });
                    /// refund amount
                    var qry = `insert into transaction (user_id,item_edition_id,transaction_type_id,amount,currency,item_edition_bid_id,status) select user_id,item_edition_id,12 as transaction_type_id,bid_price,'ETH' AS currency,id,1 as status from item_edition_bid where id=${bidData[0].id} `;
                    console.log(qry)
                    await db.query(qry, async function (error, data) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured!!",
                                error
                            });
                        }

                    });
                }
                var insertData = {
                    "user_id": user_id,
                    "item_edition_id": item_edition_id,
                    "bid_price": amount
                }
                await db.query(marketplaceQueries.insertBid, [insertData], async function (error, trxdata) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in place bid",
                            error
                        });
                    }
                    else {

                        await db.query(marketplaceQueries.insertBidTransactionByItemId, [trxdata.insertId], async function (error, dataId) {
                            if (error) {
                                return res.status(400).send({
                                    success: false,
                                    msg: "Error occured5!!",
                                    error
                                });
                            }


                            // /*------------------------------- Email Sent */

                            await db.query(marketplaceQueries.getUsersByEmail, [user_id], async function (error, result) {

                                await db.query(marketplaceQueries.getitems, [item_id], async function (error, data) {


                                    if (error) {
                                        return res.status(400).send({
                                            success: false,
                                            msg: "error occured in UserDetail",
                                            error
                                        });
                                    }
                                    /// SEND MAIL STARTS
                                    qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ie.id=${item_edition_id}`;
                                    console.log(qry);
                                    await db.query(qry, async function (error, mailData) {
                                        emailActivity.Activity(mailData[0].ownerEmail, 'Bid Placed', `Bid Placed on  ${mailData[0].name} for $${amount}.`, `nftdetail/${item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);

                                        emailActivity.Activity(mailData[0].bidderEmail, 'Bid Placed', `You have placed bid on  ${mailData[0].name} for $${amount}.`, `nftdetail/${item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);
                                    });
                                    /// SEND MAIL ENDS
                                });

                            });
                            // ------------------------------------------------------


                            await db.query(marketplaceQueries.updateTrxidInBid, [dataId.insertId, trxdata.insertId]);
                            return res.status(200).send({
                                success: true,
                                msg: "Placed bid successfully",
                                transaction_id: dataId.insertId
                            });
                        }
                        )
                    }
                })
            });
        }

    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "Unexpected internal error!!",
            err
        });
    }
}

/* ---------------------------  STRIPE PAYMENT GATEWAY IMPLEMENTATION ---------------*/

exports.charge2 = async (db, req, res) => {
    console.log("in charge2");
    //exports.getfaq= async (db,req,res)=>{
    //app.post("/stripe/charge", cors(), async (req, res) => {
    //console.log("stripe-routes.js 9 | route reached", req.body);
    //let { amount, id } = req.body;

    var amount = req.body.amount
    var id = req.body.id
    //console.log("stripe-routes.js 10 | amount and id", amount, id);
    try {
        var customer = await stripe.customers.create({
            name: 'Jenny Rosen',
            address: {
                line1: '510 Townsend St',
                postal_code: '98140',
                city: 'San Francisco',
                state: 'CA',
                country: 'US',
            }
        });
        //console.log('customer.id', customer.id)
        const payment = await stripe.paymentIntents.create({
            customer: customer.id,
            amount: amount,
            currency: "INR",
            description: "Your Company Description",
            payment_method: id,
            confirm: true,
        });
        //console.log("stripe-routes.js 19 | payment", payment);
        res.json({
            message: "Payment Successful",
            success: true,
        });
    } catch (error) {
        //console.log("stripe-routes.js 17 | error", error);
        res.json({
            message: "Payment Failed",
            success: false,
            error: error,
        });
    }
};
/* ----------------------------------------------------------------------------------*/

exports.stripe_success = async (db, req, res) => {
    console.log("in stripe_success");
    var user_id = req.body.user_id;
    var item_edition_id = req.body.item_edition_id;
    var item_id = req.body.item_id;
    var bid_price = req.body.bid_price;
    var sell_type = req.body.sell_type;

    //     if(!user_id){
    //         res.status(400).send({
    //             success : false,
    //             msg : "user_id required!!"
    //         });
    //     }
    //     if(!item_edition_id){
    //         res.status(400).send({
    //             success : false,
    //             msg : "item_edition_id required!!"
    //         });
    //     }
    //     if(!item_id){
    //         res.status(400).send({
    //             success : false,
    //             msg : "item_id required!!"
    //         });
    //     } if(!bid_price){
    //         res.status(400).send({
    //             success : false,
    //             msg : "bid_price required!!"
    //         });
    //     } if(!sell_type){
    //         res.status(400).send({
    //             success : false,
    //             msg : "sell_type required!!"
    //         });
    //     }
    //     if(sell_type==='Price'){
    //         await db.query(marketplaceQueries.getWalletDetail,[user_id],async function(error,walletDetail){
    //             if(error){
    //             return res.status(400).send({
    //             success: false,
    //         msg: "error occured in getWalletDetail",
    //             error
    //         });
    //             }
    //             await db.query(marketplaceQueries.updateSold,[1,user_id,item_edition_id], async function(error,data){
    //                 if(error){
    //      return res.status(400).send({
    //                 success: false,
    //             msg: "error occured in udpateSold",
    //                       error
    //                    });
    //              }
    //             })

    //             await db.query(marketplaceQueries.insertBuyTransactionByItemId,[item_edition_id], async function(error,data){
    //                 if(error){
    //      return res.status(400).send({
    //                 success: false,
    //             msg: "error occured in udpateSold",
    //                       error
    //                    });
    //              }
    //             })

    //         var publickey=walletDetail[0].public;
    //         //console.log("public Key");
    //       //  console.log(publickey);
    //                 /* run ownership changes api */
    //                 const response1 = await fetch(`${config.blockchainApiUrl}transfer`,{ method:'POST', headers: {
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify( {
    //                     "from_address": `${config.contractOwnerAddress}`,
    //                     "from_private_key": `${apiKey}`,
    //                     "contract_address": `${config.contractAddress}`,
    //                     "to_address": `${publickey}`,
    //                     "tokenId": item_id,
    //                     "amount": 1
    //                 })
    //                 });
    //                 const data1 = await response1.json();
    //             //    console.log(data1);
    //                 if(!data1.hash){
    //                     return res.status(400).send({
    //                         success: false,
    //                         msg: "error occured in ownership transfer",
    //                         apidata : data1
    //                     });
    //                 }
    //             //    console.log(data1.hash);
    //                 await db.query(marketplaceQueries.updateTransferHash,[data1.hash,item_edition_id], async function(error,data){
    //                     if(error){
    //          return res.status(400).send({
    //                     success: false,
    //                 msg: "Error occured in updateTransferHash!!",
    //                           error
    //                        });
    //                  }
    //                 })

    //                 /* end ownership change api */
    //             })
    //             res.status(200).send({
    //                 success:true,
    //         msg : "Ownership changed successfully",

    //         });
    //         }
    //         else{



    // /*------------------------------- Email Sent */


    //  db.query(marketplaceQueries.getitemBy,[item_id],async function(error,result){

    //  var data = await  db.query(marketplaceQueries.getUsersByEmail,[user_id])

    //     if(error){
    //     return res.status(400).send({
    //     success: false,
    // msg: "error occured in UserDetail",
    //     error
    // });
    //     }


    // var transporter = nodemailer.createTransport({
    //     host: 'espsofttechnologies.com',
    //     port:465,
    //     secure: true,
    //     auth: {
    //       user: 'developer@espsofttechnologies.com',
    //       pass:  'Espsoft123#'
    //     },
    //     tls: {
    //         rejectUnauthorized: false
    //     }
    //   });


    // var mailOptions = {
    // from: 'developer@espsofttech.com',
    // to: data[0].email,
    // subject: 'Bid On this item',
    // html : `  <div style="FONT-FAMILY:Helvetica-Neue,Helvetica,Arial,sans-serif">
    // <table cellspacing="0" cellpadding="6" width="100%" style="background:#ffffff">
    //    <tbody>
    //       <tr>
    //          <td style="border:#ffffff 1px solid">
    //             <table cellspacing="0" cellpadding="0" width="640px" style="margin:0 auto" bgcolor="white">
    //                <tbody>
    //                   <tr>
    //                      <td>
    //                         <table cellspacing="0" cellpadding="0" width="100%">
    //                            <tbody>
    //                               <tr valign="middle">
    //                                  <td colspan="2" align="center" style="text-align:center;width:100%;padding:12px 0px;border-bottom:1px solid #eaeaea">
    //                                     <div><a href="#" target="_blank" ><img align="left" alt="MakersPlace Logo" src="https://ci6.googleusercontent.com/proxy/YkfORi10H1b77f9VCRO8EjkzzrpXzQxzFiH__voSSA64eyQyBGnMfhfwX_XHjTL2q-HdU-PzZy2M4ZiPa-LCRjjCNg=s0-d-e1-ft#https://makersplace.com/static/img/logo-main.png" width="180" style="max-width:400px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:none;text-decoration:none" class="CToWUd"></a></div>
    //                                  </td>
    //                               </tr>
    //                               <tr>
    //                                  <td colspan="2">
    //                                     <table style="text-align:left;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif;padding-top:20px;color:#37393a" width="100%" cellspacing="0" cellpadding="10" border="0" align="left">
    //                                        <tbody>
    //                                           <tr>
    //                                              <td align="center">
    //                                                 <span style="font-size:26px;display:block;font-weight:normal;padding:16px 0 8px 0">
    //                                                 Your bid of <strong>$${bid_price}</strong>
    //                                                 was placed.
    //                                                 </span>
    //                                              </td>
    //                                           </tr>
    //                                           <tr>
    //                                              <td align="center">
    //                                                 <span style="font-size:16px;display:block;font-weight:normal;padding:0">
    //                                                 Your offer is only valid for ${result[0].expiry_date} days, and you'll only be charged if your offer is accepted.
    //                                                 </span>
    //                                              </td>
    //                                           </tr>
    //                                           <tr>
    //                                              <td align="center" style="padding:16px">
    //                                                 <div><a href="#" style="background-color:#0d58c8;color:#ffffff;display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif;font-size:16px;font-weight:normal;line-height:40px;text-align:center;text-decoration:none;width:200px" target="_blank" >View your Bids</a></div>
    //                                              </td>
    //                                           </tr>
    //                                           <tr>
    //                                              <td>
    //                                                 <table width="100%" cellspacing="0" cellpadding="10" style="background:#f8f8f8;margin-top:10px">
    //                                                    <tbody>
    //                                                       <tr>
    //                                                          <td align="center" style="padding:0 0 20px 0">
    //                                                             <table cellspacing="0" cellpadding="0">
    //                                                                <tbody>
    //                                                                   <tr>
    //                                                                      <td align="center" width="580">
    //                                                                         <div style="text-align:left;font-size:26px;font-weight:400;padding-top:30px">
    //                                                                           ${result[0].name}
    //                                                                         </div>
    //                                                                         <div style="text-align:left;font-size:18px;padding-bottom:30px">
    //                                                                            by <a style="color:#808080;text-decoration:none" href="#" target="_blank">${result[0].owner}</a>
    //                                                                         </div>
    //                                                                         <a href="#" target="_blank" ><img width="580" src="${config.imageUrl}${result[0].image}" class="CToWUd"></a>
    //                                                                      </td>
    //                                                                   </tr>
    //                                                                   <tr>
    //                                                                      <td align="center" width="580">
    //                                                                         <table cellpadding="0" cellspacing="0">
    //                                                                            <tbody>
    //                                                                               <tr>
    //                                                                                  <td width="580" style="padding-top:10px">
    //                                                                                     <span style="text-align:left;font-size:26px;font-weight:400">
    //                                                                                     Details
    //                                                                                     </span>
    //                                                                                  </td>
    //                                                                               </tr>
    //                                                                               <tr>
    //                                                                                  <td width="580" style="padding-top:6px">
    //                                                                                     <span style="text-align:left;font-size:16px;font-weight:300">
    //                                                                                     Edition 21 of 35
    //                                                                                     </span>
    //                                                                                  </td>
    //                                                                               </tr>
    //                                                                               <tr>
    //                                                                                  <td width="580" style="padding-top:6px">
    //                                                                                     <span style="text-align:left;font-size:16px;font-weight:300">
    //                                                                                     ${result[0].description}
    //                                                                                     A gateway to the unknown. Will our 3 little explorers dare to enter?
    //                                                                                     </span>
    //                                                                                  </td>
    //                                                                               </tr>
    //                                                                               <tr>
    //                                                                                  <td align="center" style="padding:16px">
    //                                                                                     <div><a href="#" style="background-color:#0d58c8;color:#ffffff;display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif;font-size:16px;font-weight:normal;line-height:40px;text-align:center;text-decoration:none;width:200px" target="_blank" >View your Bids</a></div>
    //                                                                                  </td>
    //                                                                               </tr>
    //                                                                            </tbody>
    //                                                                         </table>
    //                                                                      </td>
    //                                                                   </tr>
    //                                                                </tbody>
    //                                                             </table>
    //                                                          </td>
    //                                                       </tr>
    //                                                    </tbody>
    //                                                 </table>
    //                                              </td>
    //                                           </tr>
    //                                           <tr>
    //                                              <td style="text-align:left">
    //                                                 <span style="color:#37393a;font-size:1em;display:block;font-weight:normal;font-family:'Helvetica Neue',Helvetica,Arial,Geneva,sans-serif">— MakersPlace Team</span>
    //                                              </td>
    //                                           </tr>
    //                                           <tr>
    //                                              <td style="text-align:left;padding-top:0">
    //                                                
    //                                              </td>
    //                                           </tr>
    //                                        </tbody>
    //                                     </table>
    //                                  </td>
    //                               </tr>
    //                               <tr>
    //                                  <td colspan="2" style="padding:60px 10px;text-align:left;font-size:12px;color:#808080">
    //                                     Onchain Labs, Inc.<br>
    //                                     1150 Folsom St, San Francisco, CA 94103<br>
    //                                     <a style="color:#808080" href="#" target="_blank" >Unsubscribe from emails like this.</a>
    //                                  </td>
    //                               </tr>
    //                            </tbody>
    //                         </table>
    //                      </td>
    //                   </tr>
    //                </tbody>
    //             </table>
    //          </td>
    //       </tr>
    //    </tbody>
    // </table>
    // <img src="https://ci4.googleusercontent.com/proxy/0euvWLzznUAdrrGW6axQu9EsfXL7_6GxTkwJXcHMuspzeRNp8FcjggNNSiY-JGDJ8z4DbOXNQp4KIPTZGVU1rxrMwTDYTuQi_8byNugrg1teFLBDeSl-qzOQlrLf_5J09vckt8nuI2XdYRyBtc51W8-MtkRh6exxSbukw1tjdhyhvMvjDg4Km59N4U3mO6S4-d8_qLLADYjFCESLB7XgLben3uVL4vcgREVoCHPLX6k3tMUx_FICjsmAUoTqIEH2GMf5wgZievaPA2FQOsBv4s_5yQ8C8XOv0k5NOqjY2urKBqyOq4G918U_MsrE-E3O0QXlCZiNFMR4DS4XsZfIO7jkNZNjY1fmhbbJ5FmqHSpFOVjPj-L0nDeH1Aa9yyLBjJ8RUt5mreprdNhk7hv3wgqbGqA6IEDjln3sjelbl0HCClCvviJF3ImLBwtYrS_qya6aceNru1Yu8h5K36tjqdlYk05fH1VZgaFH2SnzfmoMSRZh6_24w61qjJmllDy5lyanOd0W7ata=s0-d-e1-ft#http://url7878.makersplace.com/wf/open?upn=-2BPV2hBq-2FD7DUfRz313ixDR4OP7mK3ScXbRYQPgG4McsDWBvGxOavCkt0egDMf4b2MzJOqSn6f8bSm0zGobt5IGcNocHC4GA5YoQaHHfw1RO7GmjU08o22B1HLW-2Fq-2FN3jJKNDg1SS-2BSCtQWUppObUIwIZAn1dnxWCpXLKq7tqll-2B8rhp45PZ-2FNrigL7mTnNsMQJBbqpQ-2F1l39X0wIMXhjb-2B-2BPdbUuwbBmXLgH4uU4sqgvdtK88KY3UvGN12jSTb-2FB-2BSps-2FmbaghPBh0Pipfp5DQL4Qmdp-2BJ9AzYB2PBiDsEc-3D" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"><font color="#888888">
    // </font>
    // </div>`
    // };

    // transporter.sendMail(mailOptions, function(error, info){
    // if (error) {
    // //   console.log(error);
    // } else {
    // console.log('Email sent: ' + info.response);
    // }
    // });

    // });
    // /*-------------------------------  */

    //             var insertData={
    //                 "user_id":user_id,
    //                 "item_edition_id": item_edition_id,
    //                 "bid_price": bid_price
    //             }
    //         await db.query(marketplaceQueries.insertBid,[insertData],async function(error,trxdata){
    //                     if(error){
    //         return res.status(400).send({
    //                     success: false,
    //                 msg: "error occured in place bid",
    //                     error
    //                 });
    //                     }
    //                     else{
    //                         await db.query(marketplaceQueries.insertBidTransactionByItemId,[trxdata.insertId])
    //                         return res.status(200).send({
    //                             success: true,
    //                         msg: "Placed bid successfully",
    //                             error
    //                         });
    //                     }
    //                 })
    //             }
}

exports.getUserPurchase = async (db, req, res) => {
    console.log("in getUserPurchase");
    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getWalletDetail, [user_id], async function (error, walletData) {
        await db.query(marketplaceQueries.getSettingData, async function (error, settingData) {
            await db.query(marketplaceQueries.getUserPurchase, [user_id], async function (error, data) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
                if (data.length > 0) {
                    const response2 = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/buy', {
                        method: 'GET', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    const usdPrice = await response2.json();
                    console.log(settingData[0]);
                    return res.status(200).send({
                        success: true,
                        msg: "User purchase detail",
                        // resale_charges: (settingData[0]?.resale_charges).toFixed(6),
                        resale_charges_eth: (settingData[0].resale_charges / usdPrice['data']['amount']).toFixed(6),
                        wallet_balance_usd: walletData[0].balance,
                        wallet_balance_eth: walletData[0].balance / usdPrice['data']['amount'],
                        response: data
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        msg: "No data found!!"
                    });
                }
            });
        });
    });
}

exports.getUserSale = async (db, req, res) => {
    console.log("in getUserSale");
    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getUserSale, [user_id, user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "User Sale detail",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}

exports.myBidItem = async (db, req, res) => {
    console.log("in myBidItem");
    var user_id = req.body.user_id
    await db.query(marketplaceQueries.myBidItem, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Item bid detail!!",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "No data found!!"
            });
        }
    });
}

exports.allCategoryItem = async (db, req, res) => {
    console.log("in allCategoryItem");

    try {
        let i = 0;
        const [result, fields] = await promisePool.query(marketplaceQueries.getDigitalCategory);
        let MainArr1 = [];
        for (const item of result) {
            let MainArr = {
                category: '',
                data: ''
            };
            const [result1, fields1] = await promisePool.query(marketplaceQueries.allCategoryItem, [item.id, 5]);

            MainArr.category = item.name;
            MainArr.data = result1;
            await MainArr1.push(MainArr);
            i++;
        }
        await db.query(marketplaceQueries.getUpcomingNft, 5, function (error, data3) {

            let MainArr2 = {
                category: '',
                data: ''
            };
            MainArr2.category = 'Upcoming';
            MainArr2.data = data3;
            MainArr1.push(MainArr2);

            if (result.length == i) {
                if (MainArr1.length > 0) {
                    return res.status(200).send({
                        success: true,
                        msg: "Item bid detail!!",
                        response: MainArr1
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        msg: "No data found!!"
                    });
                }

            }
        });
    } catch (ee) {
        return res.status(400).send({
            success: false,
            msg: "No data found!!",
            error: ee
        });
    }
}

exports.getRecentWorks = async (db, req, res) => {
    console.log("in getRecentWorks");
    await db.query(marketplaceQueries.getRecentWorks, function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Recent works details",
                response: data
            });
        } else {
            return res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}

exports.allTalentList = async (db, req, res) => {
    console.log("in allTalentList");
    var is_feature = req.body.is_feature;

    await db.query(marketplaceQueries.allTalentList1, [is_feature], async function (error, circle) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        await db.query(marketplaceQueries.allTalentList2, [is_feature], function (error, square) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (circle.length > 0) {
                return res.status(200).send({
                    success: true,
                    circle: circle,
                    square: square

                });

            }
            else {
                return res.status(400).send({
                    success: false,
                    msg: "No Data"
                });
            }
        });
    });
}

exports.rejectBid = async (db, req, res) => {
    console.log("in rejectBid");
    var bid_id = req.body.bid_id;
    //await db.query(marketplaceQueries.updateTransactionStatus, [bid_id]);
    await db.query(marketplaceQueries.rejectBid, [bid_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data) {
            /// SEND MAIL STARTS
            qry = `select i.name,i.description,ieb.bid_price,i.image,getUserFullName(ieb.user_id) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(ieb.user_id) as bidderEmail from item_edition_bid as ieb left join item_edition  as ie on ie.id=ieb.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ieb.id=${bid_id}`;
            console.log(qry);
            await db.query(qry, async function (error, mailData) {
                emailActivity.Activity(mailData[0].ownerEmail, 'Bid Cancelled', `Bid Cancelled on  ${mailData[0].name} for $${mailData[0].bid_price}.`, `salehistory`, `https://ipfs.io/ipfs/${mailData[0].image}`);
                emailActivity.Activity(mailData[0].bidderEmail, 'You have cancelled a bid', `You have cancelled bid ${mailData[0].name} for $${mailData[0].bid_price}.`, `yourpurchase`, `https://ipfs.io/ipfs/${mailData[0].image}`);
            });
            /// SEND MAIL ENDS    
            return res.status(200).send({
                success: true,
                msg: "Your bid has been rejected!! "
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "Deletion Failed"
            });
        }
    });
}


exports.itemView = async (db, req, res) => {
    console.log("in itemView");
    var user_id = req.body.user_id;
    var item_edition_id = req.body.item_edition_id;

    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required!!"
        });
    }
    if (!item_edition_id) {
        return res.status(400).send({
            success: false,
            msg: "item_edition_id required!!"
        });
    }
    var views = {
        "user_id": user_id,
        'item_edition_id': item_edition_id
    }

    await db.query(marketplaceQueries.itemView, [views], function (error, data) {
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
                msg: "Insert item view successfully!!",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Error in insertion!!"
            });
        }
    });
}

exports.likeItem = async (db, req, res) => {
    console.log("in likeItem");
    //required fields
    var user_id = req.body.user_id;
    var item_edition_id = req.body.item_edition_id;
    if (!user_id) {
        return res.status(400).send({
            success: false,
            msg: "user_id required!!"
        });
    }

    if (!item_edition_id) {
        return res.status(400).send({
            success: false,
            msg: "item_edition_id required!!"
        });
    }

    var itemlike = {
        "item_edition_id": item_edition_id,
        "user_id": user_id
    }
    await db.query(marketplaceQueries.getItemLike, [item_edition_id, user_id], async function (err, result1) {

        if (err) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                err
            });
        }
        if (result1.length > 0) {
            await db.query(marketplaceQueries.deleteItemLike, [item_edition_id, user_id], async function (err, result) {

                if (err) {
                    return res.status(400).send({
                        success: false,
                        msg: err
                    });
                }
            });
            return res.status(200).send({
                success: true,
                msg: "Like removed!!",
                err
            });
        }
        else {
            await db.query(marketplaceQueries.insertItemLike, itemlike, async function (err, result2) {

                if (err) {
                    return res.status(400).send({
                        success: false,
                        msg: err
                    });

                }
                return res.status(200).send({
                    success: true,
                    msg: "Item liked successfully!!",
                    err
                });
            })
        }
    });

}

exports.getItemLikeCount = async (db, req, res) => {
    console.log("in getItemLikeCount");
    var item_edition_id = req.body.item_edition_id
    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getItemLikeCount, [user_id, item_edition_id], function (error, data) {
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
                msg: "Item like count",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.userWithdraw = async (db, req, res) => {
    console.log("in userWithdraw");
    var user_id = req.body.user_id;
    var amount = req.body.amount;
    var amount_usd = req.body.amount_usd;
    var address = req.body.address;
    var datetime = new Date();

    if (!user_id) {
        res.status(400).send({
            success: false,
            msg: "user_id required!!"
        });
    }
    if (!amount) {
        res.status(400).send({
            success: false,
            msg: "amount required!!"
        });
    }
    if (!amount_usd) {
        res.status(400).send({
            success: false,
            msg: "amount_usd required!!"
        });
    }
    if (!address) {
        res.status(400).send({
            success: false,
            msg: "address required!!"
        });
    }

    await db.query(adminQueries.getSettings, async function (error, settingData) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        await db.query(marketplaceQueries.getWalletDetail, [user_id], async function (error, walletData) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }

            if (walletData[0].balance <= amount_usd) {
                return res.status(400).send({
                    success: false,
                    msg: "You don't have sufficient balance to withdraw!!",
                    error
                });
            }
            var apiData = await openNFT(settingData[0].public_key);
            var apiData2 = await openNFT(settingData[0].private_key);
            console.log({
                "from_address": apiData, //Admin Public Address
                "from_private_key": apiData2,  //Admin Private Address
                "to_address": address, //User To Address        
                "value": amount
            });
            const response1 = await fetch(`${config.ethTransferApiUrl}`, {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "from_address": apiData, //Admin Public Address
                    "from_private_key": apiData2,  //Admin Private Address
                    "to_address": address, //User To Address        
                    "value": amount
                })

            });
            const data2 = await response1.json();

            console.log("data2 ", data2);
            if (!data2.hash) {

                return res.status(400).send({
                    success: false,
                    msg: "Error in withdraw!!",
                    apidata: data2
                });
            }
            var transaction = {
                user_id: user_id,
                transaction_type_id: "3",
                from_address: apiData,//Admin From Address
                to_address: address, // User To Address
                hash: data2.hash,
                amount: amount_usd * -1,
                status: 1,
                datetime: datetime,
                currency: "ETH"
            }

            await db.query(marketplaceQueries.insertTransaction, transaction)

            if (data2) {
                res.status(200).send({
                    success: true,
                    msg: "User Withdraw Succesfull",

                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "User withdrawal Error"
                });
            }
        });
    });
}

exports.insertContact = async (db, req, res) => {
    console.log("in insertContact");
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var comments = req.body.comments;
    var ip = req.body.ip;
    var datetime = new Date();

    var contact_us = {
        "name": name,
        "email": email,
        "subject": subject,
        "comments": comments,
        "ip": ip,
        "datetime": datetime
    }
    await db.query(marketplaceQueries.insertContacts, [contact_us], function (error, data) {
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
                msg: "Your request has been updated Successfully, admin will contact you soon!!",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.getContact = async (db, req, res) => {
    console.log("in getContact");
    await db.query(marketplaceQueries.getContact, function (error, data) {
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
                msg: "Contacts Records",
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



exports.transactionDetail = async (db, req, res) => {
    console.log("in transactionDetail");
    var transaction_id = req.body.transaction_id

    await db.query(marketplaceQueries.getTransactionDetail, [transaction_id], async function (error, data) {
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
                msg: "Transactions Detail",
                response: data[0]
            });
        } else {
            await db.query(marketplaceQueries.getTransactionDetail1, [transaction_id], function (error, data1) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }

                res.status(200).send({
                    success: true,
                    msg: "Transactions Detail",
                    response: data1[0]
                });
            });

        }
    });
}





exports.updatePayoutAddress = async (db, req, res) => {
    console.log("in updatePayoutAddress");
    var user_id = req.body.user_id;
    var payout_address = req.body.payout_address;

    var updateData = {
        "payout_address": payout_address
    }

    await db.query(marketplaceQueries.updatePayoutAddress, [updateData, user_id], function (error, data) {
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
                msg: "Payout address updated!!",

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.getPayoutAddress = async (db, req, res) => {

    var user_id = req.body.user_id

    await db.query(marketplaceQueries.getPayoutAddress, [user_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        //console.log(data);
        if (data.length > 0) {
            res.status(200).send({
                success: true,
                msg: "Payout Address!!",
                response: data[0]
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error"
            });
        }
    });
}


exports.getRoyaltyList = async (db, req, res) => {
    console.log("in getRoyaltyList");
    await db.query(marketplaceQueries.getRoyaltyList, async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        //console.log(data);
        if (data.length > 0) {
            const response2 = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/buy', {
                method: 'GET', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const usdPrice = await response2.json();

            res.status(200).send({
                success: true,
                msg: "Royalty List!!",
                ETH_price: usdPrice['data']['amount'],
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

exports.getRoyaltyTransaction = async (db, req, res) => {
    console.log("in getRoyaltyTransaction");
    var user_id = req.body.user_id;
    await db.query(marketplaceQueries.getRoyaltyTransaction, [user_id], function (error, data) {
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
                msg: "Royalty transaction details!!",
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

exports.getAllRoyaltyTransaction = async (db, req, res) => {
    console.log("in getAllRoyaltyTransaction");
    await db.query(marketplaceQueries.getAllRoyaltyTransaction, function (error, data) {
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
                msg: "Royalty transaction details!!",
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


exports.getWalletTransaction = async (db, req, res) => {
    console.log("in getWalletTransaction");
    var user_id = req.body.user_id;
    await db.query(marketplaceQueries.getWalletTransaction, [user_id], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        if (data.length > 0) {
            const response2 = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/buy', {
                method: 'GET', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const usdPrice = await response2.json();

            res.status(200).send({
                success: true,
                msg: "Wallet transaction details!!",
                eth_usd_price: usdPrice['data']['amount'],
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


exports.resaleNFT = async (db, req, res) => {
    console.log("in resaleNFT");
    var user_id = req.body.user_id;
    var item_edition_id = req.body.item_edition_id;
    var price = req.body.price;
    var price_eth = req.body.price_eth;
    var expiry_date = req.body.expiry_date;
    var hash = req.body.hash;
    var transaction_id = req.body.transaction_id;
    var user_address = req.body.user_address;
    if (req.body.resale_quantity) {
        var resale_quantity = req.body.resale_quantity;
    }
    else {
        var resale_quantity = 1;
    }
    if (!transaction_id) {
        return res.status(400).send({
            success: false,
            msg: "transaction_id required!!"
        });
    }
    console.log("transaction_id=", transaction_id);
    var qry = `select id from item_edition where id in (select item_edition_id from transaction_edition_purchase where transaction_id=${transaction_id}) and owner_id=${user_id} and is_sold=1 order by id limit ${resale_quantity}`;
    await db.query(qry, async function (error, loop1) {
        console.log(loop1.length);
        for (var i = 0; i < loop1.length; i++) {

            var updateData = {
                "price": price,
                "expiry_date": expiry_date,
                "end_date": expiry_date,
                "is_sold": 0,
                "resale_hash": hash,
                "user_address": user_address,
                "start_date": new Date(),
                "datetime": new Date()
            }

            await db.query(marketplaceQueries.resaleNFT, [updateData, loop1[i].id]);
            var qry2 = `insert into transaction_edition_resale(transaction_id,item_edition_id)values(${transaction_id},${loop1[i].id})`;
            db.query(qry2);
            console.log("Resale ie_id ", loop1[i].id);

        }


        if (loop1) {


            /// SEND MAIL STARTS
            qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ie.id=${item_edition_id}`;
            console.log(qry);
            await db.query(qry, async function (error, mailData) {
                emailActivity.Activity(mailData[0].ownerEmail, 'NFT published for resell.', `Your NFT ${mailData[0].name} if published for resell in $${price}.`, `nftdetail/${item_edition_id}`, `https://ipfs.io/ipfs/${mailData[0].image}`);
            });
            /// SEND MAIL ENDS    


            res.status(200).send({
                success: true,
                msg: "NFT has been published for resell!",
                item_edition_id: item_edition_id

            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Something Wrong due to internal Error!"
            });
        }
    });
}


exports.getContractDeatils = async (db, req, res) => {
    console.log("in getContractDeatils");
    res.status(200).send({
        success: true,
        msg: "Contract details!!",
        adminAddress: config.contractOwnerAddress,
        contractAddress: config.contractAddress,
        blockchainNetwork: config.blockchainNetwork
    });

}


exports.getMarketActivity = async (db, req, res) => {
    console.log("in getMarketActivity");
    var item_id = req.body.item_id;
    await db.query(marketplaceQueries.getMarketActivity, [item_id, item_id], function (error, data) {
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
                msg: "Activity details!!",
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


exports.transferList = async (db, req, res) => {
    console.log("in transferList");
    var productId = req.body.productId;
    var collectionName = req.body.collectionName;
    var email = req.body.email;
    var token = req.body.token;
    await db.query(marketplaceQueries.checkUser, [email], async function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        console.log(data);
        if (data.length == 0) {
            res.status(400).send({
                success: false,
                msg: "email not found!!"
            });
        }
        console.log("111", data[0].address);
        if (!data[0].address) {
            res.status(400).send({
                success: false,
                msg: "Address not found!!"
            });

        } else {
            await db.query(marketplaceQueries.checkItem, [productId, productId, collectionName], async function (error, itemData) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "Error occured!!",
                        error
                    });
                }
                if (itemData.length == 0) {
                    res.status(400).send({
                        success: false,
                        msg: "productId not found!!"
                    });
                }

                await db.query(adminQueries.getSettings, async function (error, settingData) {
                    var apiData = await openNFT(settingData[0].private_key);
                    var apiData2 = await openNFT(settingData[0].public_key);

                    var from = apiData2;
                    var fromprivate = apiData;

                    console.log({
                        "from_address": `${from}`,
                        "from_private_key": `${fromprivate}`,
                        "contract_address": `${config.contractAddress}`,
                        "to_address": data[0].address,
                        "token_owner_address": itemData[0].owner_address,
                        "tokenId": itemData[0].item_id,
                        "amount": 1
                    })
                    const response1 = await fetch(`${config.blockchainApiUrl}transfer`, {
                        method: 'POST', headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "from_address": `${from}`,
                            "from_private_key": `${fromprivate}`,
                            "contract_address": `${config.contractAddress}`,
                            "to_address": data[0].address,
                            "token_owner_address": itemData[0].owner_address,
                            "tokenId": itemData[0].item_id,
                            "amount": 1
                        })
                    });
                    const data1 = await response1.json();

                    if (!data1.hash) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in ownership transfer",
                            apidata: data1
                        });
                    }

                    var insertData = {
                        "productId": productId,
                        "collectionName": collectionName,
                        "coin": token,
                        "email": email,
                        "item_edition_id": itemData[0].item_edition_id,
                        "status": "1"
                    }
                    await db.query(marketplaceQueries.insertList, [insertData], async function (error, listData2) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "Error occured!!",
                                error
                            });
                        }

                        var transaction = {
                            "user_id": data[0].id,
                            "transaction_type_id": '14',
                            "item_id": itemData[0].item_id,
                            "item_edition_id": itemData[0].item_edition_id,
                            "amount": 0,
                            "from_address": itemData[0].owner_address,
                            "to_address": data[0].address,
                            "token": token,
                            "payment_currency": 'DigiPhyNFT',
                            "payment_currency_amount": token,
                            "currency": 'DigiPhyNFT',
                            "status": 1
                        }

                        await db.query(marketplaceQueries.insertTransaction, [transaction], async function (error, trxdata) {
                            if (error) {
                                return res.status(400).send({
                                    success: false,
                                    msg: "Error occured in insertTransaction!!",
                                    error
                                });
                            }

                            await db.query(marketplaceQueries.updateSold2, [1, data[0].id, data1.hash, data[0].address, itemData[0].item_edition_id], async function (error, sold2Data) {
                                if (error) {
                                    return res.status(400).send({
                                        success: false,
                                        msg: "Error occured in updateSold2!!",
                                        error
                                    });
                                }

                                res.status(200).send({
                                    success: true,
                                    msg: "List data inserted successfully!!"
                                });
                            });
                        });
                    });
                });
            });
        }

    });
}


exports.createMetadata = async (db, req, res) => {
    console.log(" in createMetadata");
    var additem = req.body;
    let dir = './metadata/';
    fs.readdir(dir, (err, files) => {
        if (files.length == 0) {
            var count = 1;
        } else {
            var count = parseInt(files.length) + parseInt(1);
        }

        var userfile = count + ''.concat('.json');
        fs.writeFile(`./metadata/${userfile}`, JSON.stringify(additem), async (err, fd) => {
            if (err) throw err;

            return res.status(200).send({
                success: true,
                msg: "Metadata created!!",
                status: 1,
                tokenId: count
            });

        });
    });
}


exports.getCollectionById = async (db, req, res) => {
    console.log("in getCollectionById");
    var collection_id = req.body.collection_id;
    var login_user_id = req.body.login_user_id;
    if (!login_user_id) {
        login_user_id = 0;
    }


    var qry = `Select uc.id as collection_id,uc.profile_pic as collection_profile_pic,u.id as user_id,u.full_name as user_name,concat('${config.mailUrl}','backend/uploads/', u.profile_pic)  as user_profile_pic,concat('${config.mailUrl}','backend/uploads/', uc.profile_pic) as profile_pic, uc.banner,u.email,uc.name as collection_name,uc.description,date_format(uc.datetime,'%d-%M-%y')as create_date,count(i.id) as nft_count,uc.facebook,uc.insta,uc.telegram,uc.twitter,uc.discord,coalesce(getCollectionItems(uc.id),0)as item_count,coalesce(getCollectionOwners(uc.id),0) as owner_count from user_collection as uc left join users as u on u.id=uc.user_id left join item as i on i.user_collection_id=uc.id where uc.name = '${collection_id}' group by uc.id,u.id,u.full_name,user_profile_pic,profile_pic,uc.banner,u.email,uc.name,uc.description,create_date order by uc.id desc`;

    await db.query(qry, async function (error, collectionData) {
        console.log(collectionData[0]);
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }
        var qry = `Select i.id,ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,i.datetime,i.description,itemLikeCount(i.id) as like_count,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.user_collection_id as collection_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,concat('${config.mailUrl}backend/infinity8_backend/uploads/',i.local_image) as local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where i.user_collection_id=${collectionData[0].collection_id} and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  and i.is_on_sale=1 order by id desc`;
        console.log('qry111111111111', qry)
        await db.query(qry, async function (error, collectionItem) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }

            if (collectionData.length > 0) {
                res.status(200).send({
                    success: true,
                    msg: "All user Collection Detail!!",
                    collectionData: collectionData[0],
                    itemDetail: collectionItem
                });
            } else {
                res.status(400).send({
                    success: false,
                    msg: "Something Wrong due to internal Error"
                });
            }
        });
    });
}


exports.insertBankDetail = async (db, req, res) => {
    let user_id = req.body.user_id;
    let account_name = req.body.account_name;
    let account_email = req.body.account_email;
    let bank_name = req.body.bank_name;
    let account_number = req.body.account_number;
    let holder_name = req.body.holder_name;
    let beneficiary_name = req.body.beneficiary_name;
    let datetime = new Date();
    try {

        if (!user_id) {
            return res.status(400).send({
                success: false,
                msg: "user_id required!!"
            });
        }
        if(!account_name){
            return res.status(400).send({
                success: false,
                msg: "Account Name required!!"
            });
        }
        if(!account_email){
            return res.status(400).send({
                success: false,
                msg: "Account Email required!!"
            });
        }
        if(!bank_name){
            return res.status(400).send({
                success: false,
                msg: "bank Name required!!"
            });
        }
        if(!account_number){
            return res.status(400).send({
                success: false,
                msg: "account number required!!"
            });
        }
        if(!account_number){
            return res.status(400).send({
                success: false,
                msg: "account number required!!"
            });
        }
        if(!holder_name){
            return res.status(400).send({
                success: false,
                msg: "holder  name required!!"
            });
        }
        if(!beneficiary_name){
            return res.status(400).send({
                success: false,
                msg: "beneficiary  name required!!"
            });
        }

        db.query(marketplaceQueries.getbankdetail, [user_id], function (error, result) {
 
            if(result.length > 0){

                var dataArr = {
                    'account_name': account_name,
                    'account_email' : account_email,
                    'bank_name' : bank_name,
                    'account_number' : account_number,
                    'holder_name' :holder_name,
                    'beneficiary_name' :beneficiary_name,
                    'datetime' : datetime
                }
                db.query(marketplaceQueries.updatebankdetail, [dataArr,user_id], function (error, data) {
               
                    if (data) {
                        res.status(200).send({
                            success: true,
                            msg: "Bank Detail Update Successfully !!",
                             });
                    }
                })
               
            }else{

                var dataArr = {
                    'user_id' : user_id,
                    'account_name': account_name,
                    'account_email' : account_email,
                    'bank_name' : bank_name,
                    'account_number' : account_number,
                    'holder_name' :holder_name,
                    'beneficiary_name' :beneficiary_name,
                    'datetime' : datetime
                }
           
                db.query(marketplaceQueries.addbankdetail, [dataArr], function (error, result) {
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }
                    return res.status(200).send({
                        success: true,
                        msg: "Bank Detail Submit Successfully !!!",
                    })
        
                })
        
            }
        });
    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}


exports.getBankDetail = async (db, req, res) => {
    let user_id = req.body.user_id;

    try {



     
        db.query(marketplaceQueries.getbankdetail, [user_id], function (error, result) {
 
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });
            }
            if(result.length > 0){

                
                        res.status(200).send({
                            data : result[0],
                            success: true,
                            msg: "Bank Detail Update Successfully !!",
                             });
                
                }else {
                    res.status(400).send({
                        success: false,
                        msg: "No Data Found !!",
                         });
                
                }              
            
        });
    } catch (err) {
        // console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }

}
