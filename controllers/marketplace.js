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
const BLOCKCHAIN = require('./web3/deploy');
const marketplaceQueries = require("../services/marketplaceQueries");
const adminQueries = require("../services/adminQueries");
const { json } = require("body-parser");
const { compileFunction } = require("vm");

const erc20 = require('./web3/erc20.js');

const NFT = require('./web3/nft.js');



const { JWT_SECRET_KEY } = require("../config");
const { end } = require("../utils/connection");
// create the pool
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
// query database using promises
var emailActivity = require('./emailActivity');
const { log } = require("console");
const { default: Web3 } = require("web3");

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



exports.getMetadataJson = async (db, req, res) => {
    let id = req.params.id;
    if (!id) {
        return res.json({
            name: "#" + id,
            image: "NO IMAGE",
            description: "NO DESCRIPTION",
        });
    }

    const [item,] = await promisePool.query("SELECT id, image, name, description,file_type, external_link FROM `item` WHERE token_id = ?", [id]);
    if (item.length == 0) {
        return res.json({
            name: "#" + id,
            image: "NO IMAGE",
            description: "NO DESCRIPTION",
        });
    }
    const attributes = [];
    const [itemAttr,] = await promisePool.query("SELECT * FROM `item_properties` WHERE item_id = ?", [item[0].id]);
    if (itemAttr.length > 0) {
        for (let i = 0; i < itemAttr.length; i++) {
            let newAttr = {
                "trait_type": itemAttr[i].type,
                "value": itemAttr[i].value,
            }
            attributes.push(newAttr);
        }
    }
    return res.json({
        "name": item[0].name,
        "description": item[0].description,
        "external_url": item[0].external_link,
        "image": "https://digiphy.mypinata.cloud/ipfs/" + item[0].image,
        "attributes": attributes,
        "file_type": item[0].file_type
    })
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
            // https://digiphy.mypinata.cloud/ipfs/QmWBB2sY9CYKehoKRmjhZgJ7UHhrFNfBjDKzcToM1S7yTQ
            return res.status(400).send({
                success: false,
                msg: "Error occured!!",
                error
            });
        }


        for (var i = 0; i < data.length; i++) {


            var img = data[i].image;
            const resData = await ipfsCompress.compressImages1('https://digiphy.mypinata.cloud/ipfs/' + img);

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




exports.TrendingNfts = async (db, req, res) => {
    console.log("in getUserItem");
    let user_id = req.body.user_id;
    let login_user_id = req.body.login_user_id;
    let is_featured = req.body.is_featured;
    let user_collection_id = req.body.user_collection_id;
    let recent = req.body.recent;
    let limit = req.body.limit;
    try {
        var qry = `Select i.id,i.nft_type as nft_type, ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,itemLikeCount(ie.id) as like_count,isLiked(ie.id,${login_user_id}) as is_liked,i.description,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,i.local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  and i.is_featured=1`

        await db.query(qry, function (error, data) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            if (data.length > 0) {
                //console.log('qry', qry, data)
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
        var qry = `Select i.id,i.nft_type as nft_type, ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,itemLikeCount(ie.id) as like_count,isLiked(ie.id,${login_user_id}) as is_liked,i.description,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,i.local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  and ie.is_on_sale=1 order by id desc`

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

        if (data[0]?.owner_id == 1) {
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


exports.insertUserCollection = async (db, req, res) => {
    var profile_pic = (!req.files['profile_pic']) ? null : req.files['profile_pic'][0].filename;
    var banner = (!req.files['banner']) ? null : req.files['banner'][0].filename;
    var name = req.body.name;
    var description = req.body.description;
    var user_id = req.body.user_id;
    var website = req.body.website;
    var games_category = req.body.games_category;
    var royalty_percent = req.body.royalty_percent;

    let ownerAddress = req.body.ownerAddress; // optional
    let contractName = req.body.contractName; // required  || olny string

    await db.query(adminQueries.getSettings, async function (error, settingData) {
        if (error) {

            return res.status(400).send({
                success: false,
                msg: "error occured in item insert",
                error
            });
        }
        var contract = `${config.contractAddress}`; //LIVE CONTRACT


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


            var apiData = await openNFT(settingData[0].public_key);
            var apiData1 = await openNFT(settingData[0].private_key);

            let adminWallet = apiData;
            let adminPrivateKey = apiData1;

            ownerAddress = (!ownerAddress) ? adminWallet : ownerAddress;
            const deployResposne = await BLOCKCHAIN.deploy({
                account: adminWallet,
                privateKey: adminPrivateKey,
                nftName: contractName,
                nftSymbol: contractName,
                ownerAddress: ownerAddress,
                baseUri: config.nftMetadataUrl
            });
            //console.log('deployResposne', deployResposne)
            if (!deployResposne.success) {
                return res.status(400).send({
                    success: false,
                    msg: deployResposne.error
                });

            }
            let deployhash = deployResposne.hash;
            let is_approved = 0;
            if (user_id == 1) {
                is_approved = 1
            }


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
                "hash": deployhash,
                "contractOwner": ownerAddress,
                "contractAddress": "",
                "blockchainConfirmation": 0,
                "contractName": contractName,
                "royalty_percent": royalty_percent,
                "is_approved": is_approved
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
                        msg: "Something want wrong, Please try again11!"
                    });
                }
            });
        })
    })
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
    await db.query(marketplaceQueries.getUserOwnerItem, [user_id, user_id, user_id, user_id, user_id, user_id,user_id], function (error, data) {
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

exports.getAdminAllUserCollection = async (db, req, res) => {
    console.log("in getAdminAllUserCollection");
    await db.query(marketplaceQueries.getAdminAllUserCollection, function (error, data) {
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
        //var qry = `Select  cl.contractAddress, ie.isClaimed, it.id as item_id,concat('${config.mailUrl}backend/uploads/',it.local_image) as local_image, ie.id as item_edition_id,ie.user_address,ie.owner_id,t.blockchain_status,it.created_by,getUserUnsoldNFT(${user_id},it.id) as totalStock,getUnclaimedNFTCount(it.id,${user_id}) as unclaimedNFT, it.name,ie.is_on_sale,getRemainingForSale(it.id,${user_id}) as remainingForSale,it.sell_type,it.approve_by_admin,it.description,it.bulkNFT,cl.name as collection_name,cl.is_approved, it.image,it.file_type,it.owner,it.item_category_id,it.token_id,ie.price,cl.id as collection_id,cl.user_id,cl.name as collection_name,ie.is_sold,ie.expiry_date,ic.name as category_name,case when it.edition_type=2 then 'Open'  else ie.edition_text end as edition_text from item_edition as ie left join item as it on it.id=ie.item_id LEFT JOIN user_collection as cl ON cl.id = it.user_collection_id left join (select id,user_id,blockchain_status from transaction where user_id=${user_id} and transaction_type_id=6 order by id desc limit 1) as t on t.user_id=ie.owner_id LEFT JOIN item_category as ic ON it.item_category_id=ic.id where ie.owner_id=${user_id} and ie.item_id in (select min(id) from item where created_by=${user_id} group by id,owner_id)`;

        var qry = `select a.*,getUserUnsoldNFT(${user_id},a.item_id) as totalStock,getCancelListingCount(${user_id},a.item_id) as cancelListingCount, getUnclaimedNFTCount(a.item_id,${user_id}) as unclaimedNFT,getRemainingForSale(a.item_id,${user_id}) as remainingForSale from (Select  cl.contractAddress, ie.isClaimed, it.id as item_id,ie.datetime,it.local_image, ie.id as item_edition_id,ie.user_address,ie.owner_id,t.blockchain_status,it.created_by, it.name,ie.is_on_sale,it.sell_type,it.approve_by_admin,it.description,it.bulkNFT,cl.name as collection_name,cl.is_approved, it.image,it.file_type,it.owner,it.item_category_id,it.token_id,ie.price,cl.id as collection_id,cl.user_id,ie.is_sold,ie.expiry_date,ic.name as category_name,case when it.edition_type=2 then 'Open'  else ie.edition_text end as edition_text from  item as it  left join item_edition as ie on it.id=ie.item_id LEFT JOIN user_collection as cl ON cl.id = it.user_collection_id left join (select id,user_id,blockchain_status from transaction where user_id=${user_id} and transaction_type_id=6 order by id desc limit 1) as t on t.user_id=ie.owner_id LEFT JOIN item_category as ic ON it.item_category_id=ic.id where it.created_by=${user_id}  and ie.item_id in (select min(id) from item where created_by=${user_id} group by id,owner_id) and ie.owner_id=${user_id} GROUP BY it.id) as a where 1 `;

        if (user_id > 0) {
            qry = qry + ` and a.created_by=${user_id}`;
        }

        if (user_collection_id > 0) {
            qry = qry + ` and a.collection_id=${user_collection_id}`;
        }
        if (limit > 0) {
            qry = qry + `  GROUP BY a.item_id order by a.datetime desc limit ${limit}`;
        }
        else {
            qry = qry + ` GROUP BY a.item_id order by a.datetime desc `;
        }

        //console.log('qry', qry);
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


/* ---------------------------  STRIPE PAYMENT GATEWAY IMPLEMENTATION ---------------*/

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
                    "name": "DigiPhyNFT_Backend",
                    "city": "DigiPhyNFT_Backend",
                    "country": "US",
                    "postalCode": "4569",
                    "line1": "DigiPhyNFT_Backend",
                    "line2": "",
                    "district": "NA"
                },
                "metadata": {
                    "email": "info@DigiPhyNFT_Backend.io",
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
                    "email": "info@DigiPhyNFT.io",
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
    var local_image = (!req.files['local_image']) ? null : req.files['local_image'][0].filename;
    let tokenId = req.body.tokenId;
    let productId = req.body.productId;
    let attributes = JSON.parse(req.body.attributes);
    let metadata = req.body.metadata;
    let external_link = req.body.external_link;
    let coin_percentage = req.body.coin_percentage;
    let unlockable_content = req.body.unlockable_content
    let nft_type = req.body.nft_type
    let approve_by_admin = req.body.approve_by_admin;
    let is_on_sale = req.body.is_on_sale
    // if(file_type==='image'){
    // let recCompress = await ipfsCompress.compressImages(["https://digiphy.mypinata.cloud/ipfs/" + image], file_type);
    //console.log(recCompress.images[0]);
    // return res.status(400).send({
    //     recCompress
    // })
    // if (recCompress.success == false) {
    //     //console.log("compress false");
    //     // return res.status(400).send({
    //     //     success: false,
    //     //     msg: "Image compress issue "
    //     // });
    //     var image_low = image;
    // } else {
    //     //console.log("compressed")
    //     var image_low = recCompress.imageHash[0];
    // }


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


    await db.query(marketplaceQueries.IsApprovedUserCollection, [user_collection_id], async function (error, checkId) {
        if (error) {

            return res.status(400).send({
                success: false,
                msg: "error occured in item insert",
                error
            });
        }

        if (checkId[0].is_approved == 0) {

            return res.status(400).send({
                success: false,
                msg: "First you need to approve your collection",
                error
            });
        }
        await db.query(adminQueries.getCollectionRoyaltyPercent, [user_collection_id], async function (error, collectionRoyalty) {
            if (error) {

                return res.status(400).send({
                    success: false,
                    msg: "error occured in item insert",
                    error
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
                    "image": image,
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
                    "productId": productId,
                    "local_image": local_image,//recCompress.images[0],
                    "metadata": metadata,
                    "external_link": external_link,
                    "coin_percentage": coin_percentage,
                    "unlockable_content": unlockable_content,
                    "nft_type": nft_type,
                    "address": user_address,
                    "royalty_percent": collectionRoyalty[0].royalty_percent,
                    "commission_percent": commissionPercent[0].commission_percent,
                    "approve_by_admin": approve_by_admin,
                    "is_on_sale": is_on_sale

                }

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
                    await db.query(marketplaceQueries.updateTransaction, [transactionData, transaction_id]);


                    await db.query(marketplaceQueries.updateItem, [{
                        "token_id": data.insertId
                    }, data.insertId]);




                    try {


                        /*-------------------------------------------------------------------------------------*/

                        if (attributes.length > 0) {
                            for (var i = 0; i < attributes.length; i++) {
                                var array = {
                                    'item_id': data.insertId,
                                    'type': attributes[i].type,
                                    'value': attributes[i].value
                                }
                                await db.query(marketplaceQueries.insertItemAttr, [array])
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

                                    /// SEND MAIL STARTS
                                    let qry = `select * from users where id =${user_id}`;
                                    let qry1 = `select name from user_collection where id =${user_collection_id}`;


                                    await db.query(qry, async function (error, mailData) {

                                        await db.query(qry1, async function (error, mailData1) {


                                            emailActivity.Activity(mailData[0].email, 'Hola! You just created an NFT', `Greetings from DigiPhyNFT.<br><br>Thank you for using DigiPhyNFT. You have created the following NFT:<br> 
                                        Name: (${name})<br> 
                                        Collection : (${mailData1[0].name})<br><br>
                                        Hope you had a good experience. Looking forward to your next visit.`, `featurescreator/${user_id}`, `https://digiphy.mypinata.cloud/ipfs/${image}`);

                                        });
                                    });
                                    /// SEND MAIL ENDS    
                                    res.status(200).send({
                                        success: true,
                                        msg: "Item Inserted Successfully",
                                        item_edition_id: iedata[0].id,
                                        item_id: data.insertId
                                    });
                                });

                            } else {
                                res.status(400).send({
                                    success: false,
                                    msg: "Something Wrong due to internal Error"
                                });
                            }
                        });


                    } catch (e) {
                        return res.status(400).send({
                            success: false,
                            e
                        });
                    }


                });
            });
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


                const [settingData,] = await promisePool.query(adminQueries.getSettings);
                var apiData = await openNFT(settingData[0].private_key);
                var apiData2 = await openNFT(settingData[0].public_key);

                var from = apiData2;
                let gas_fee;
                var fromprivate = apiData;
                const [editionResult,] = await promisePool.query(`SELECT isMinted from item_edition WHERE isMinted = 0 AND id = ?`, [item_edition_id]);
                const [editionResultOfItem,] = await promisePool.query(`SELECT count(id) as qty from item_edition WHERE isMinted = 0 AND item_id = ?`, [item_id]);
                if (editionResult.length > 0) {
                    const [collectiosResult,] = await promisePool.query(`SELECT contractAddress, i.token_id  from user_collection as uc INNER JOIN item as i ON uc.id=i.user_collection_id WHERE i.id = ? AND uc.contractAddress is not null`, [item_id]);
                    if (collectiosResult.length > 0) {

                        gas_fee = await NFT.mint({
                            account: from,
                            privateKey: fromprivate,
                            contractAddress: collectiosResult[0].contractAddress,
                            to_address: from,
                            tokenId: collectiosResult[0].token_id,
                            qty: editionResultOfItem[0].qty,
                            getFee: true,
                        });
                        const mintRes = await NFT.mint({
                            account: from,
                            privateKey: fromprivate,
                            contractAddress: collectiosResult[0].contractAddress,
                            to_address: from,
                            tokenId: collectiosResult[0].token_id,
                            qty: editionResultOfItem[0].qty,
                            getFee: false,
                        });
                        if (mintRes.hash) {
                            await promisePool.query(`UPDATE item_edition SET ? WHERE item_id = ?`, [{
                                isMinted: 1,
                                hash: mintRes.hash,
                                current_owner: from,
                            }, item_id]);
                        }
                    }
                }

                if (gas_fee) {
                    console.log('gas_fee3222:', gas_fee)
                    var qry = `INSERT INTO gasFeeDetail(item_id,user_id,amount,sender_wallet,receiver_wallet,transaction_hash,type)VALUES(${item_id},${user_id},${gas_fee.fee},'${token_owner_address}','${from}','${mintRes?.hash}','Bid Accept')`;

                    const [data,] = await promisePool.query(qry);
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

                await db.query(marketplaceQueries.updateSold2, [is_sold, biddata[0].user_id, "", publickey, item_edition_id], async function (error, data) {
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
                                    /// SEND MAIL STARTS
                                    qry = `select i.name,i.description,i.image,getUserFullName(ieb.user_id) as bidderName,getUserEmail(${user_id}) as ownerEmail,getUserEmail(ieb.user_id) as bidderEmail,ieb.bid_price from item_edition_bid as ieb left join item_edition as ie on ie.id=ieb.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ieb.id=${bid_id}`;

                                    console.log('qry', qry)
                                    await db.query(qry, async function (error, mailData) {
                                        emailActivity.Activity(mailData[0].ownerEmail, `Bid Accepted`, `You have accepted bid of INR ${mailData[0].bid_price} for ${mailData[0].name}.`, `nftdetail/${data1[0].item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);

                                        emailActivity.Activity(mailData[0].bidderEmail, 'Bid Accepted', `Your bid has been accepted for INR ${mailData[0].bid_price} for ${mailData[0].name}.`, `nftdetail/${data1[0].item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
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


exports.blockchainupdatetransaction = async (db, req, res) => {
    console.log("in blockchainupdatetransaction");
    let user_id = req.body.user_id;
    let new_owner_address = req.body.new_owner_address;
    let item_id = req.body.item_id;
    let item_edition_id = req.body.item_edition_id;
    let claimQuantity = req.body.claimQuantity;
    console.log("claimQuantity ", claimQuantity);
    if (!new_owner_address) {
        return res.status(400).send({
            success: false,
            msg: "New owner address required"
        });
    }

    const [settingData,] = await promisePool.query(adminQueries.getSettings);
    var apiData = await openNFT(settingData[0].private_key);
    var apiData2 = await openNFT(settingData[0].public_key);

    var from = apiData2;
    var fromprivate = apiData;
    const [editionResult,] = await promisePool.query(`SELECT * from item_edition WHERE item_id = ? and owner_id=? and isClaimed=0 limit ?`, [item_id, user_id, parseInt(claimQuantity)]);

    if (editionResult.length < claimQuantity) {
        return res.status(400).send({
            success: false,
            msg: "Item Edition : You have only " + editionResult.length + " NFTs available for claim!",
        });
    }

    const [collectiosResult,] = await promisePool.query(`SELECT contractAddress, i.token_id  from user_collection as uc INNER JOIN item as i ON uc.id=i.user_collection_id WHERE i.id = ? AND uc.contractAddress is not null`, [item_id]);
    if (collectiosResult.length > 0) {

        let mintRes;
        let gas_fee;
        if (editionResult[0].isMinted == 0) {

            gas_fee = await NFT.mint({
                account: from,
                privateKey: fromprivate,
                contractAddress: collectiosResult[0].contractAddress,
                to_address: new_owner_address,
                tokenId: collectiosResult[0].token_id,
                qty: claimQuantity,
                getFee: true,
            });
            mintRes = await NFT.mint({
                account: from,
                privateKey: fromprivate,
                contractAddress: collectiosResult[0].contractAddress,
                to_address: new_owner_address,
                tokenId: collectiosResult[0].token_id,
                qty: claimQuantity,
                getFee: false,
            });
            console.log("gas_fee1: ", gas_fee)
        } else {

            gas_fee = await NFT.transfer({
                account: from,
                privateKey: fromprivate,
                contractAddress: collectiosResult[0].contractAddress,
                current_owner_address: editionResult[0].current_owner, //current owner
                to_address: new_owner_address, // new owner
                tokenId: collectiosResult[0].token_id,
                qty: claimQuantity,
                getFee: true,
            });
            mintRes = await NFT.transfer({
                account: from,
                privateKey: fromprivate,
                contractAddress: collectiosResult[0].contractAddress,
                current_owner_address: editionResult[0].current_owner, //current owner
                to_address: new_owner_address, // new owner
                tokenId: collectiosResult[0].token_id,
                qty: claimQuantity,
                getFee: false,
            });

            console.log("gas_fee2: ", gas_fee)

        }
        if (!mintRes.success) {
            return res.status(400).send({
                success: false,
                msg: mintRes.error,
            });
        }
        if (mintRes.hash) {
            var i = 0;
            while (i < editionResult.length) {
                console.log("deleted edition id ", editionResult[i].id)
                // await promisePool.query(`UPDATE item_edition SET ? WHERE id = ?`, [{
                //     isMinted: 1,
                //     isClaimed: 1,
                //     hash: mintRes.hash,
                //     current_owner: new_owner_address, // new owner update
                // }, editionResult[i].id]);
                await promisePool.query(`DELETE FROM item_edition WHERE id = ${editionResult[i].id}`);
                i++;
            }

            let data = {
                from_address: from,
                to_address: new_owner_address,
                hash: mintRes.hash,
                gas_fee: gas_fee,
                blockchain_status: 1
            }

            console.log("gas_fee3: ", gas_fee)

            if (gas_fee) {
                console.log('data11111', from, new_owner_address, mintRes.hash)
                console.log('gas_fee3222:', gas_fee)
                var qry = `INSERT INTO gasFeeDetail(item_id,user_id,amount,sender_wallet,receiver_wallet,transaction_hash,type)VALUES(${item_id},${user_id},${gas_fee.fee},'${from}','${new_owner_address}','${mintRes.hash}','Claim Nft')`;

                const [data,] = await promisePool.query(qry);
            }
            console.log('qqqqqqqqqqqq', qry)
            await promisePool.query(adminQueries.updateblockchainstatus, [data, user_id, item_id]);

            return res.status(200).send({
                success: true,
                msg: "Item Claimed successfully"
            });


        } else {
            return res.status(400).send({
                success: false,
                msg: mintRes.error,
            });
        }
    } else {
        return res.status(400).send({
            success: false,
            msg: "Item Collection : Something went wrong, Please contact support for claim item.",
        });

    }
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
    let isClaimed = 0
    let transferNft = req.body.transferNft
    let gas_fee = req.body.gas_fee;
    let email=req.body.email;

    try {

        if (req.body.user_id==0) {
            var qry = `INSERT INTO users(email,password,is_email_verify) values('${email}','1234',0)`;
            const [addUser,] = await promisePool.query(qry);
            user_id = addUser.insertId;
        }

        if (!user_address) {
            user_address = null;
        }
        if (!token_owner_address) {
            token_owner_address = null
        }
        if (!amount) {
            amount = 0;
        }

        let gas_fee = 0;

        if (sell_type === 'Price') {
            /// transactoin for sell product start


            const [settingData,] = await promisePool.query(adminQueries.getSettings);
            var apiData = await openNFT(settingData[0].private_key);
            var apiData2 = await openNFT(settingData[0].public_key);

            var from = apiData2;
            var fromprivate = apiData;
            const [editionResult,] = await promisePool.query(`SELECT isMinted from item_edition WHERE isMinted = 0 AND id = ?`, [item_edition_id]);
            const [editionResultOfItem,] = await promisePool.query(`SELECT count(id) as qty from item_edition WHERE isMinted = 0 AND item_id = ?`, [item_id]);
            if (editionResult.length > 0) {
                const [collectiosResult,] = await promisePool.query(`SELECT contractAddress, i.token_id  from user_collection as uc INNER JOIN item as i ON uc.id=i.user_collection_id WHERE i.id = ? AND uc.contractAddress is not null`, [item_id]);
                if (collectiosResult.length > 0) {

                    gas_fee = await NFT.mint({
                        account: from,
                        privateKey: fromprivate,
                        contractAddress: collectiosResult[0].contractAddress,
                        to_address: from,
                        tokenId: collectiosResult[0].token_id,
                        qty: editionResultOfItem[0].qty,
                        getFee: true,
                    });
                    console.log('gas_feeqqqq:', gas_fee)
                    const mintRes = await NFT.mint({
                        account: from,
                        privateKey: fromprivate,
                        contractAddress: collectiosResult[0].contractAddress,
                        to_address: from,
                        tokenId: collectiosResult[0].token_id,
                        qty: editionResultOfItem[0].qty,
                        getFee: false,
                    });
                    if (mintRes.hash) {
                        await promisePool.query(`UPDATE item_edition SET ? WHERE item_id = ?`, [{
                            isMinted: 1,
                            hash: mintRes.hash,
                            current_owner: from,
                        }, item_id]);
                    }
                    if (gas_fee.success != false) {
                        console.log('gas_fee3222:', mintRes.hash, gas_fee)
                        var qry = `INSERT INTO gasFeeDetail(item_id,user_id,amount,sender_wallet,receiver_wallet,transaction_hash,type)VALUES(${item_id},${user_id},${gas_fee.fee},'${token_owner_address}','${from}','${mintRes?.hash}','Item Purchase')`;

                        const [data,] = await promisePool.query(qry);
                        console.log('22222222', qry)
                    }
                }
            }

            let NFTTransferUser;
            await db.query(marketplaceQueries.itemdetail, [item_edition_id, 0, item_edition_id, item_edition_id], async function (error, trx) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured in insertSellTransactionByItemId111",
                        error
                    });
                }
                const [buyer] = await promisePool.query(`SELECT COALESCE(uo.user_name,uo.full_name,uo.email) as buyer_name,email FROM users as uo where uo.id=${user_id}`);
                let seller_name = trx[0].owner;
                let buyer_name = buyer[0].buyer_name;

                let seller_name_email = trx[0].email;
                let buyer_name_email = buyer[0].email;


                if (trx.length == 0) {
                    return res.status(400).send({
                        success: false,
                        msg: "Item Edition Invalid",
                    });
                }


                if (trx[0].isClaimed == 1) {

                    const [editionList] = await promisePool.query("SELECT * FROM `item_edition` where item_id= ? and owner_id= ? order by id limit ?", [trx[0].item_id, trx[0].owner_id, purchased_quantity]);
                    console.log("editionList", editionList)

                    NFTTransferUser = await NFT.transfer({
                        account: from,
                        privateKey: fromprivate,
                        contractAddress: trx[0].contractAddress,
                        current_owner_address: trx[0].current_owner, //current owner
                        to_address: from, // new owner
                        tokenId: trx[0].token_id,
                        qty: purchased_quantity,
                        getFee: false,
                    });

                    if (!NFTTransferUser.success) {
                        return res.status(400).send({
                            success: false,
                            msg: NFTTransferUser.error,
                        });
                    }
                    console.log("NFTTransferUser", NFTTransferUser)
                    if (NFTTransferUser.hash) {
                        var i = 0;
                        while (i < editionList.length) {
                            await promisePool.query(`UPDATE item_edition SET ? WHERE id = ?`, [{
                                isClaimed: 0,
                                current_owner: from,
                                hash: NFTTransferUser.hash
                            }, editionList[i].id]);
                        }
                    }
                }

                if (trx[0].is_resale === 0) {
                    var sellerPercent = 100 - settingData[0].platform_fee;
                }
                else {
                    var sellerPercent = 100 - trx[0].royalty_percent - settingData[0].platform_fee;
                    ///////// INSERT ROYALTY TRX
                    //console.log("insert royalty trx", trx[0].price, purchased_quantity, sellerPercent);
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
                var platformFee = ((trx[0].price * purchased_quantity) * settingData[0].platform_fee / 100)




                var qry = `INSERT INTO transaction (plateform_fee,gas_fee,user_id,item_id,item_edition_id,transaction_type_id,amount,currency,status,user_address,commission_percent,commission) select ${platformFee},${gas_fee.fee ? gas_fee.fee : '0'}, ie.owner_id,i.id,ie.id as item_edition_id,1 as transaction_type_id, ${saleAmount} as price,'USD' AS currency,1,${user_address},${settingData[0].commission_percent},${trx[0].price * settingData[0].commission_percent / 100}  from item_edition as ie left join item as i on i.id=ie.item_id where ie.id=${item_edition_id}`;

                await db.query(qry, async function (error, selldata) {
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
                        "isClaimed": isClaimed,
                        "token": token,
                        "payment_currency": 0,
                        "payment_currency_amount": 0,
                        "currency": 'DigiPhyNFT',
                        "status": 1
                    }

                    await db.query(marketplaceQueries.insertTransaction, [trx2])
                }
                var ttype = 6;
                if (transferNft == 1) {
                    ttype = 14;
                }
                var token2 = parseFloat(token) * -1;
                var amount2 = parseFloat(amount) * -1;
                var qry = `INSERT INTO transaction (gas_fee,user_id,item_id,item_edition_id,token,transaction_type_id,amount,status,user_address,blockchain_status)select ${gas_fee.fee ? gas_fee.fee : '0'},${user_id},i.id,ie.id,${token2},${ttype},${amount2} as price,1,'${user_address}',0 from item_edition as ie left join item as i on i.id=ie.item_id where ie.id =${item_edition_id}`;
                await db.query(qry, async function (error, buydata) {
                    console.log('error 2494', error)
                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured in insertBuyTransactionByItemId",
                            error
                        });
                    }
                    let data1hash = '';

                    var qry = `select id from item_edition where item_id=${item_id} and owner_id=getOwnerId(${item_edition_id}) order by id limit ${purchased_quantity}`;
                    //console.log(qry)
                    await db.query(qry, async function (error, loop1) {

                        for (var i = 0; i < loop1.length; i++) {
                            //console.log("item edition update ",i)
                            await db.query(marketplaceQueries.updateSold2, [1, user_id, data1hash, user_address, loop1[i].id]);

                            var qry2 = `insert into transaction_edition_purchase(transaction_id,item_edition_id)values(${buydata.insertId},${loop1[i].id})`;
                            db.query(qry2);

                        }
                    });
                    var qry2 = `update transaction set purchased_quantity=${purchased_quantity},edition_text=concat(getEditionNo(${item_edition_id}),'-',${purchased_quantity}+getEditionNo(${item_edition_id})-1,' of ',getEditionCount(${item_id})) where id =${buydata.insertId}`;

                    await db.query(qry2);

                    //console.log('updating updateSold-edition_id' + item_edition_id);
                    //console.log("updtesoldpaypal");
                    await db.query(marketplaceQueries.updateSoldPaypal, [1, user_id, item_edition_id], async function (error, data) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured in udpateSold",
                                error
                            });
                        }


                        console.log('data1hash', data1hash)
                        //console.log("updateTransferHash");
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
                            qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=i.owner_id where ie.id=${item_edition_id}`;

                            let qry1 = `SELECT uc.name,it.user_collection_id from item as it left JOIN user_collection as uc on uc.id=it.user_collection_id where it.id=${item_id}`;

                            console.log(qry);
                            await db.query(qry, async function (error, mailData) {

                                await db.query(qry1, async function (error1, mailData1) {

                                    console.log('mailData', mailData)

                                    if (ttype == 14) {
                                        await emailActivity.Activity1(mailData[0].ownerEmail, `Hola! You just transferred your NFT`,
                                            `<div style="color:#fff">Hello,<br><br>Greetings from DigiPhyNFT.<br><br>Thank you for using DigiPhyNFT. You have just transferred your NFT , details of which are as below<br>Name: ${mailData[0].name}<br>
                                    Collection : ${mailData1[0].name}<br> 
                                    Transferred To : ${buyer_name_email}<br></div>
                                    `, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);

                                        await emailActivity.Activity1(mailData[0].bidderEmail, 'Hola! You just recieved an NFT',
                                            `<div style="color:#fff">Hello,<br><br>Greetings from DigiPhyNFT.<br><br>Thank you for using DigiPhyNFT.  You have just recieved an NFT, details of which are as below<br>Name: ${mailData[0].name}<br>
                                    Collection : ${mailData1[0].name}<br> 
                                    Recieved from : ${seller_name_email}<br></div>
                                   <br>`, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
                                    }
                                    else {
                                        await emailActivity.Activity1(mailData[0].ownerEmail, `Yaya! You have just sold an NFT`,
                                            `<div style="color:#fff">Hello,<br><br>Greetings from DigiPhyNFT.<br><br>Thank you for using DigiPhyNFT. You have just sold the following NFT:<br>Name: ${mailData[0].name}<br>
                                Collection : ${mailData1[0].name}<br> 
                                Sold To : ${buyer_name}<br></div>
                                <div style="color:#fff">Price : (Rs ${amount})</div><br>`, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);

                                        await emailActivity.Activity1(mailData[0].bidderEmail, 'Hola! You just bought a new NFT',
                                            `<div style="color:#fff">Hello,<br><br>Greetings from DigiPhyNFT.<br><br>Thank you for using DigiPhyNFT. You have bought the following NFT:<br>Name: ${mailData[0].name}<br>
                                Collection : ${mailData1[0].name}<br> 
                                Bought it from : ${seller_name}<br></div>
                                <div style="color:#fff">Price : (Rs ${amount})</div><br>`, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
                                    }


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
                //console.log("bidData ", bidData);
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
                    var qry = `Insert into transaction (user_id,item_edition_id,transaction_type_id,amount,currency,item_edition_bid_id,status) select user_id,item_edition_id,12 as transaction_type_id,bid_price,'MATIC' AS currency,id,1 as status from item_edition_bid where id=${bidData[0].id} `;
                    //console.log(qry)
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

                        console.log('trxdata.insertId', gas_fee, trxdata.insertId)
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
                                    qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=i.owner_id where ie.id=${item_edition_id}`;
                                    //console.log(qry);
                                    await db.query(qry, async function (error, mailData) {
                                        emailActivity.Activity(mailData[0].ownerEmail, 'Bid Placed', `Bid Placed on  ${mailData[0].name} for  INR ${amount}.`, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);

                                        emailActivity.Activity(mailData[0].bidderEmail, 'Bid Placed', `You have placed bid on  ${mailData[0].name} for INR ${amount}.`, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
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
            error: err
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
                    //console.log(settingData[0]);
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
            qry = `select i.name,i.description,ieb.bid_price,i.image,getUserFullName(ieb.user_id) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(ieb.user_id) as bidderEmail from item_edition_bid as ieb left join item_edition  as ie on ie.id=ieb.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=i.owner_id where ieb.id=${bid_id}`;
            //console.log(qry);
            await db.query(qry, async function (error, mailData) {
                emailActivity.Activity(mailData[0].ownerEmail, 'Bid Cancelled', `Bid Cancelled on  ${mailData[0].name} for INR ${mailData[0].bid_price}.`, `salehistory`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
                emailActivity.Activity(mailData[0].bidderEmail, 'You have cancelled a bid', `You have cancelled bid ${mailData[0].name} for INR ${mailData[0].bid_price}.`, `yourpurchase`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
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

            await db.query(marketplaceQueries.getbankdetail, [user_id], async function (error, bankData) {
                if (error) {
                    return res.status(400).send({
                        success: false,
                        msg: "error occured",
                        error
                    });
                }

                if (bankData.length == 0) {
                    return res.status(400).send({
                        success: false,
                        msg: "Please Enter your Bank detail !!"
                    });
                }

                var transaction = {
                    "user_id": user_id,
                    "transaction_type_id": '3',
                    "amount": -1 * amount,
                    "from_address": '',
                    "to_address": '',
                    "hash": '',
                    "token": 0,
                    "payment_currency": 'INR',
                    "payment_currency_amount": '',
                    "currency": 'INR',
                    "status": 1
                }

                await db.query(marketplaceQueries.insertTransaction, transaction)

                if (walletData) {
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


exports.getWalletTransaction = async (db, req, res) => {
    console.log("in getWalletTransaction");
    var user_id = req.body.user_id;
    var type_id = req.body.type_id;
    if (type_id > 0) {
        console.log('rtesse', type_id)
        await db.query(marketplaceQueries.getWalletTransactionbyType, [user_id, type_id], async function (error, data) {
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
                console.log('rtesse', data)

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
    } else {
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
    //console.log("transaction_id=", transaction_id);
    var qry = `select id from item_edition where id in (select item_edition_id from transaction_edition_purchase where transaction_id=${transaction_id}) and owner_id=${user_id} and is_sold=1 order by id limit ${resale_quantity}`;
    await db.query(qry, async function (error, loop1) {
        //console.log(loop1.length);
        for (var i = 0; i < loop1.length; i++) {

            var updateData = {
                "price": price,
                "expiry_date": expiry_date,
                "end_date": expiry_date,
                "is_sold": 0,
                "hash": hash,
                "user_address": user_address,
                "start_date": new Date(),
                "datetime": new Date()
            }

            await db.query(marketplaceQueries.resaleNFT, [updateData, loop1[i].id]);
            var qry2 = `insert into transaction_edition_resale(transaction_id,item_edition_id)values(${transaction_id},${loop1[i].id})`;
            db.query(qry2);
            //console.log("Resale ie_id ", loop1[i].id);

        }


        if (loop1) {


            /// SEND MAIL STARTS
            qry = `select i.name,i.description,i.image,getUserFullName(${user_id}) as bidderName,getUserEmail(u.id) as ownerEmail,getUserEmail(${user_id}) as bidderEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ie.id=${item_edition_id}`;
            //console.log(qry);
            await db.query(qry, async function (error, mailData) {
                emailActivity.Activity(mailData[0].ownerEmail, 'NFT published for resell.', `Your NFT ${mailData[0].name} if published for resell in $${price}.`, `nftdetail/${item_edition_id}`, `https://digiphy.mypinata.cloud/ipfs/${mailData[0].image}`);
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



exports.getCollectionById = async (db, req, res) => {
    console.log("in getCollectionById");
    var collection_id = req.body.collection_id;
    var login_user_id = req.body.login_user_id;
    //console.log('collection_id:', collection_id)
    if (!login_user_id) {
        login_user_id = 0;
    }

    var qry1 = `SELECT * FROM user_collection WHERE name='${collection_id}' ORDER BY id  DESC`
    await db.query(qry1, async function (error, collectionData1) {
        // console.log('collectionData1',collectionData1[0].id)

        var qry = `Select uc.id as collection_id,uc.contractName,uc.profile_pic as collection_profile_pic,uc.contractAddress,u.id as user_id,u.full_name as user_name,concat('${config.mailUrl}','backend/uploads/', u.profile_pic)  as user_profile_pic,concat('${config.mailUrl}','backend/uploads/', uc.profile_pic) as profile_pic, uc.banner,u.email,uc.name as collection_name,uc.description,date_format(uc.datetime,'%d-%M-%y')as create_date,count(i.id) as nft_count,uc.facebook,uc.insta,uc.telegram,uc.twitter,uc.discord,coalesce(getCollectionItems(uc.id),0)as item_count,coalesce(getCollectionOwners(uc.id),0) as owner_count from user_collection as uc left join users as u on u.id=uc.user_id left join item as i on i.user_collection_id=uc.id where uc.id = ${collectionData1[0].id} group by uc.id,u.id,u.full_name,user_profile_pic,profile_pic,uc.banner,u.email,uc.name,uc.description,create_date order by uc.id desc`;
        //console.log('qry', qry)
        await db.query(qry, async function (error, collectionData) {
            //console.log('wwww', collectionData);
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error occured!!",
                    error
                });
            }
            var qry = `Select i.id,ie.id as item_edition_id,ie.owner_id,cu.profile_pic,cu.full_name, case when length(i.name)>=30 then concat(left(i.name,30),'...') else i.name end as name,i.name as item_fullname,i.datetime,i.description,itemLikeCount(i.id) as like_count,i.image,i.file_type,i.owner,i.sell_type,i.item_category_id,i.user_collection_id as collection_id,i.token_id,coalesce(ie.price,'') as price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no,ie.is_sold,ie.expiry_date,concat('${config.mailUrl}backend/DigiPhyNFT_Backend/uploads/',i.local_image) as local_image, ic.name as category_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN item_category as ic ON i.item_category_id=ic.id left join users as cu on cu.id=i.created_by where i.user_collection_id=${collectionData1[0].id} and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and (ie.expiry_date > now() or ie.expiry_date is null or ie.expiry_date='0000-00-00 00:00:00') and i.is_active=1  order by id desc`;
            //console.log('qry111111111111', qry)
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
    let ifsc_code = req.body.ifsc_code;
    let datetime = new Date();
    try {

        if (!user_id) {
            return res.status(400).send({
                success: false,
                msg: "user_id required!!"
            });
        }
        if (!account_name) {
            return res.status(400).send({
                success: false,
                msg: "Account Name required!!"
            });
        }
        if (!account_email) {
            return res.status(400).send({
                success: false,
                msg: "Account Email required!!"
            });
        }
        if (!bank_name) {
            return res.status(400).send({
                success: false,
                msg: "bank Name required!!"
            });
        }
        if (!account_number) {
            return res.status(400).send({
                success: false,
                msg: "account number required!!"
            });
        }
        if (!account_number) {
            return res.status(400).send({
                success: false,
                msg: "account number required!!"
            });
        }
        if (!holder_name) {
            return res.status(400).send({
                success: false,
                msg: "holder  name required!!"
            });
        }
        if (!beneficiary_name) {
            return res.status(400).send({
                success: false,
                msg: "beneficiary  name required!!"
            });
        }
        if (!ifsc_code) {
            return res.status(400).send({
                success: false,
                msg: "IFSC Code required!!"
            });
        }

        db.query(marketplaceQueries.getbankdetail, [user_id], function (error, result) {

            if (result.length > 0) {

                var dataArr = {
                    'account_name': account_name,
                    'account_email': account_email,
                    'bank_name': bank_name,
                    'account_number': account_number,
                    'holder_name': holder_name,
                    'beneficiary_name': beneficiary_name,
                    'ifsc_code': ifsc_code,
                    'datetime': datetime
                }
                db.query(marketplaceQueries.updatebankdetail, [dataArr, user_id], function (error, data) {

                    if (data) {
                        res.status(200).send({
                            success: true,
                            msg: "Bank Detail Update Successfully !!",
                        });
                    }
                })

            } else {

                var dataArr = {
                    'user_id': user_id,
                    'account_name': account_name,
                    'account_email': account_email,
                    'bank_name': bank_name,
                    'account_number': account_number,
                    'holder_name': holder_name,
                    'beneficiary_name': beneficiary_name,
                    'ifsc_code': ifsc_code,
                    'datetime': datetime
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
            if (result.length > 0) {


                res.status(200).send({
                    data: result[0],
                    success: true,
                    msg: "Bank Detail Update Successfully !!",
                });

            } else {
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


exports.allSearch = async (
    db, req, res) => {
    console.log("in allSearch");

    var search = (!req.body.search) ? '' : req.body.search;


    if (!search) {
        return res.status(400).send({
            success: false,
            msg: "Search parameter required"
        });
    }
    qry = "select id,email,user_name,full_name,profile_pic,'talent' as type from users where email like '%" + `${search}` + "%' or full_name like '%" + `${search}` + "%'";

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

exports.transferTokenToMetamaskWallet = async (db, req, res) => {
    console.log("in transferTokensss");

    const user_id = req.body.user_id;
    const to_address = req.body.to_address;
    const token = req.body.token;
    let payment_currency = 'DigiCoin'//req.body.payment_currency;
    let payment_currency_amount = 0
    let currency = 'INR'
    try {
        db.query(adminQueries.getSettings, async function (error, settingData) {
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "Error : Server not responding please try again later! ",
                    error
                });
            }
            var apiData = await openNFT(settingData[0].public_key);
            var apiData2 = await openNFT(settingData[0].private_key);

            const fromAddress = apiData;
            const privateKey = apiData2;
            const contractAddress = settingData[0].contractAddress;

            const adminToken = await erc20.transfer({
                'account': fromAddress,
                'privateKey': privateKey,
                'contractAddress': contractAddress,
                'to_address': to_address,
                'token': token,
                'getFee': false
            });

            console.log('adminToken', adminToken)
            if (adminToken.success == true) {

                var transaction = {
                    "user_id": user_id,
                    "transaction_type_id": '17',
                    "amount": 0,
                    "token": token * -1,
                    "from_address": fromAddress,
                    "to_address": to_address,
                    "hash": adminToken.hash,
                    "payment_currency": payment_currency,
                    "payment_currency_amount": payment_currency_amount,
                    "currency": currency,
                    "status": 1
                }

                await db.query(marketplaceQueries.insertTransaction, [transaction])
                return res.json({
                    success: true,
                    msg: "Token Transfered",
                    data: adminToken.hash,
                })
            }
            else if (adminToken.success == false) {
                return res.json({
                    success: false,
                    msg: adminToken.error,
                })
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

exports.insertView = async (db, req, res) => {
    console.log("in insertView");
    var user_id = req.body.user_id;
    var item_edition_id = req.body.item_edition_id;
    var ip = null;
    var datetime = new Date();


    var views = {
        "user_id": user_id,
        'item_edition_id': item_edition_id,
        "ip": ip,
        "datetime": datetime,
    }


    await db.query(marketplaceQueries.insertview, [views], function (error, data) {
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
                msg: "Insert View Successfully",
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "Error in Insertion"
            });
        }
    });
}


exports.checkEdititonPurchase = async (db, req, res) => {
    console.log("in checkEdititonPurchase");

    var item_edition_id = req.body.item_edition_id;




    await db.query(marketplaceQueries.checkEdititonPurchase, [item_edition_id], function (error, data) {
        if (error) {
            return res.status(400).send({
                success: false,
                msg: "error occured",
                error
            });
        }
        if (data.length > 0) {
            res.status(200).send({
                success: true
            });
        } else {
            res.status(400).send({
                success: false,
                msg: "No Data Found"
            });
        }
    });
}


exports.depositToken = async (db, req, res) => {
    console.log("depositToken");

    const user_id = req.body.user_id;
    const to_address = req.body.to_address;
    const from_address = req.body.from_address;
    const token = req.body.token;
    let payment_currency = 'DigiCoin'//req.body.payment_currency;
    let payment_currency_amount = 0
    let currency = 'INR'
    let transactionHash = req.body.transactionHash
    try {
        var transaction = {
            "user_id": user_id,
            "transaction_type_id": '18',
            "amount": 0,
            "token": token,
            "from_address": from_address,
            "to_address": to_address,
            "hash": transactionHash,
            "payment_currency": payment_currency,
            "payment_currency_amount": payment_currency_amount,
            "currency": currency,
            "status": 1
        }

        await db.query(marketplaceQueries.insertTransaction, [transaction])
        return res.json({
            success: true,
            msg: "Token Transfered",
        })
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



exports.getNFTfromblockchain = async (db, req, res) => {
    let address = req.params.address;
    let user_id = req.params.user_id;

    const contractAddress = []
    const [user_collection,] = await promisePool.query("SELECT contractAddress FROM user_collection where contractAddress is not null ORDER BY id DESC");
    user_collection.filter(item => {
        contractAddress.push(item.contractAddress.toLocaleUpperCase())
    })
    const response = await NFT.getAllNFTFromBlockchainByAddress(address, contractAddress);
    // console.log(response)
    if (contractAddress.length == 0) {
        return res.status(400).send({
            success: false,
            msg: "No data found!!"
        });
    }
    else {
        if (response.success) {
            for (let i = 0; i < response.data.length; i++) {
                let qry = `select getClaimedNFTOnSaleCount(${response.data[i].tokenId},${user_id}) as onSaleNft,file_type FROM item WHERE token_id = ${response.data[i].tokenId}`;
                let [item] = await promisePool.query(qry);
                response.data[i].balance = response.data[i].balance - item[0]?.onSaleNft
                response.data[i].file_type = item[0]?.file_type
            }

            return res.status(200).send({
                success: true,
                walletAddress: address,
                data: response.data,
            });
        } else {
            return res.status(200).send({
                success: false,
                walletAddress: address,
                msg: response.error
            });
        }
    }
}