const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const config = require('../config');
const authQueries = require("../services/authQueries");
const marketplaceQueries = require("../services/marketplaceQueries");
var validator = require("email-validator");
var fetch = require('node-fetch');
var QRCode = require('qrcode');
var speakeasy = require("speakeasy");
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
var emailActivity = require('./emailActivity');

// Login User




exports.login = async (db, req, res) => {
    console.log("in login");
    var email = req.body.email;
    var password = req.body.password;


    try {
        if (email == '') {
            return res.status(400).send({
                success: false,
                msg: "Email required "
            });
        }
        if (password == '') {
            return res.status(400).send({
                success: false,
                msg: "password required"
            });
        }
        if (!validator.validate(email)) {
            return res.status(400).send({
                success: false,
                msg: "Email is not validate"
            });
        }


        db.query(authQueries.getUsersEmail, email, async function (error, user) {
            console.log(user);
            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "unexpected error occured",
                    error
                });
            } else if (user.length == 0 || user[0].is_admin == 1) {
                return res.status(400).send({
                    success: false,
                    msg: "No User found"
                });
            }
            else if (user[0].is_email_verify === 0) {
                emailActivity.RegisterActivity(user[0].email,'Please verify your DigiPhyNFT account',user[0].user_name)

                return res.status(400).send({
                    success: false,
                    msg: "Email has been sent,Please verify your Account"
                });
               
            }
            else if (user[0].deactivate_account == 1) {
                return res.status(400).send({
                    success: false,
                    msg: "You are Account is Deactivated,Please contact to Admin"
                });
            }
            else {

                var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
                if (user[0].password === hash) {


                    // const jwtToken = jwt.sign({
                    //     email: req.body.email,
                    //     id: user[0].id,
                    // }, config.JWT_SECRET_KEY, {
                    //     expiresIn: config.SESSION_EXPIRES_IN
                    // })

                    const jwtToken = jwt.sign({
                        email: req.body.email,
                        id: user[0].id,
                    }, config.JWT_SECRET_KEY)

                    /* ---------- check and generate wallet of user */
                    // if(user[0].wallet_id===0){
                    //     const response1 = await fetch(config.walletApiUrl,{ method:'GET', headers: {
                    //         'Accept': 'application/json',
                    //         'Content-Type': 'application/json'
                    //       }
                    //     });
                    //     const data1 = await response1.json();
                    //     console.log(data1);
                    //     if(!data1.wallet.privateKey){
                    //         return res.status(400).send({
                    //             success: false,
                    //             msg: "error occured in wallet creation",
                    //             error
                    //         });
                    //     }

                    //     var insertData = {
                    //         "user_id":user[0].id,
                    //         "coin_id":1,
                    //         "public":data1.wallet.address,
                    //         "private":data1.wallet.privateKey
                    //     }
                    //     console.log(insertData);
                    //     await db.query(authQueries.createUserWallet,[insertData],async function(error,data){
                    //         if(error){
                    //         return res.status(400).send({
                    //             success: false,
                    //             msg: "error occured",
                    //             error
                    //         });
                    //     }
                    // })
                    // }
                    /* ----------------------------------------------- */
                    await db.query(authQueries.getUsersEmail, [email], async function (error, data) {
                        if (error) {
                            return res.status(400).send({
                                success: false,
                                msg: "error occured",
                                error
                            });
                        }
                        //////////////// NFT AIRDROP START
                        if (data[0].airdrop_claimed == 0) {
                            const [itemData,] = await promisePool.query(marketplaceQueries.checkItem, ['Itsuki0001', 'Itsuki0001', 'KDCRAFT_v2']);
                            console.log("itemData-> ", itemData);
                            if (itemData.length == 0) {
                                console.log("itemData lenght 0")

                            } else {

                                var transaction = {
                                    "user_id": data[0].id,
                                    "transaction_type_id": '16',
                                    "item_id": itemData[0].item_id,
                                    "item_edition_id": itemData[0].item_edition_id,
                                    "blockchain_status": '0',
                                    "amount": itemData[0].price,
                                    "from_address": itemData[0].owner_address,
                                    "token": 0,
                                    "edition_text": itemData[0].edition_text,
                                    "purchased_quantity": 1,
                                    "payment_currency": 'DigiPhyNFT',
                                    "payment_currency_amount": '0',
                                    "currency": 'DigiPhyNFT',
                                    "status": 1,
                                }
                                console.log("transaction data", transaction);
                                const [insertTrx,] = await promisePool.query(marketplaceQueries.insertTransaction, [transaction]);
                                await promisePool.query(marketplaceQueries.updateAirdropNFT, [1, data[0].id, '', '', itemData[0].item_edition_id]);
                                qry = `INSERT INTO transaction_edition_purchase(transaction_id,item_edition_id)VALUES(${insertTrx.insertId},${itemData[0].item_edition_id})`
                                await promisePool.query(qry);
                                const [updateAirdropClaimed, fields] = await promisePool.query(`UPDATE users SET airdrop_claimed=1 WHERE id=${data[0].id}`);
                            }
                        }
                        /////////////////////////
                        emailActivity.Activity(email, 'Hola! Your login is successful.', `Greetings from DigiPhyNFT.<br><br>
                        Thank you for using DigiPhyNFT. You have successfully logged in to your account.`);
                        return res.status(200).send({
                            success: true,
                            msg: "Login Successfully",
                            Token: jwtToken,
                            data: {
                                id: user[0].id,
                                user_email: user[0].email,
                                user_name: user[0].user_name,
                                full_name: user[0].full_name,
                                user_address: data[0].public,
                                telent_status: user[0].telent_status,
                                enableTwoFactor: user[0].enableTwoFactor
                            }
                        });
                    })
                } else {
                    return res.status(400).send({
                        success: false,
                        msg: "Password does not match"
                    });
                }

            }
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            success: false,
            msg: "unexpected internal error",
            err
        });
    }
}



exports.loginType = async (db, req, res) => {
    console.log('hello');
    var full_name = req.body.full_name;
    var email = req.body.email;
    var is_subscribed = req.body.is_subscribed;
    var login_type = req.body.login_type
    var type = req.body.type
    try {

        await db.query(authQueries.getUsersloginEmail, [email], async function (error, results) {

            if (error) {
                return res.status(400).send({
                    success: false,
                    msg: "error occured",
                    error
                });

            } else if (results.length > 0) {
                console.log(results)
                if (email === results[0].email) {
                    if (type == 'signup') {
                        return res.status(200).send({
                            success: false,
                            msg: "User Already Register",
                        });
                    } else {
                        // if(results[0].wallet_id===0){
                        //     const response1 = await fetch(config.walletApiUrl,{ method:'GET', headers: {
                        //         'Accept': 'application/json',
                        //         'Content-Type': 'application/json'
                        //       }
                        //     });
                        //     const data1 = await response1.json();
                        //     console.log(data1);
                        //     if(!data1.wallet.privateKey){
                        //         return res.status(400).send({
                        //             success: false,
                        //             msg: "error occured in wallet creation",
                        //             error
                        //         });
                        //     }

                        //     var insertData = {
                        //         "user_id":results[0].id,
                        //         "coin_id":1,
                        //         "public":data1.wallet.address,
                        //         "private":data1.wallet.privateKey
                        //     }
                        //     console.log(insertData);
                        //     await db.query(authQueries.createUserWallet,[insertData],async function(error,data){
                        //         if(error){
                        //         return res.status(400).send({
                        //             success: false,
                        //             msg: "error occured",
                        //             error
                        //         });
                        //     }
                        // })
                        // }

                        const jwtToken = jwt.sign({
                            email: req.body.email
                        }, config.JWT_SECRET_KEY)

                        return res.status(200).send({
                            success: true,
                            msg: "Login Successfull.",
                            Token: jwtToken,
                            data: {
                                id: results[0].id,
                                user_email: results[0].email,
                                full_name: results[0].full_name,
                                verification_id: results[0].verification_id,
                                veriff_status: results[0].veriff_status,
                                enableTwoFactor: results[0].enableTwoFactor
                            }
                        });
                    }
                }
            }



            var secret = speakeasy.generateSecret({ length: 20 });
            QRCode.toDataURL(secret.otpauth_url, function (err, data_url) {

                var users = {
                    "full_name": full_name,
                    "email": email,
                    "password": null,
                    "is_email_verify": 1,
                    "googleAuthCode": secret.base32,
                    "QR_code": data_url,
                    "deactivate_account": 0,
                    "is_subscribed": is_subscribed,
                    "login_type": login_type
                }
                console.log('users',users)
                db.query(authQueries.insertUserData, users, async function (error, data) {
                    console.log('data[0]',data[0],data)
                    //////////////// NFT AIRDROP START
                    if (data[0]?.airdrop_claimed == 0) {
                        const [itemData,] = await promisePool.query(marketplaceQueries.checkItem, ['Itsuki0001', 'Itsuki0001', 'KDCRAFT_v2']);
                        console.log("itemData-> ", itemData);
                        if (itemData.length == 0) {
                            console.log("itemData lenght 0")

                        } else {

                            var transaction = {
                                "user_id": data[0].id,
                                "transaction_type_id": '16',
                                "item_id": itemData[0].item_id,
                                "item_edition_id": itemData[0].item_edition_id,
                                "blockchain_status": '0',
                                "amount": itemData[0].price,
                                "from_address": itemData[0].owner_address,
                                "token": 0,
                                "edition_text": itemData[0].edition_text,
                                "purchased_quantity": 1,
                                "payment_currency": 'DigiPhyNFT',
                                "payment_currency_amount": '0',
                                "currency": 'DigiPhyNFT',
                                "status": 1,
                            }
                            console.log("transaction data", transaction);
                            const [insertTrx,] = await promisePool.query(marketplaceQueries.insertTransaction, [transaction]);
                            await promisePool.query(marketplaceQueries.updateAirdropNFT, [1, data[0].id, '', '', itemData[0].item_edition_id]);
                            qry = `INSERT INTO transaction_edition_purchase(transaction_id,item_edition_id)VALUES(${insertTrx.insertId},${itemData[0].item_edition_id})`
                            await promisePool.query(qry);
                            const [updateAirdropClaimed, fields] = await promisePool.query(`UPDATE users SET airdrop_claimed=1 WHERE id=${data[0].id}`);
                        }
                    }

                    if (error) {
                        return res.status(400).send({
                            success: false,
                            msg: "error occured",
                            error
                        });
                    }

                    db.query(authQueries.getUsersloginEmail, [email], async function (error, newResult) {
                        if (newResult.length > 0) {
                            // if(newResult[0].wallet_id===0){
                            //     const response1 = await fetch(config.walletApiUrl,{ method:'GET', headers: {
                            //         'Accept': 'application/json',
                            //         'Content-Type': 'application/json'
                            //       }
                            //     });
                            //     const data1 = await response1.json();
                            //     console.log(data1);
                            //     if(!data1.wallet.privateKey){
                            //         return res.status(400).send({
                            //             success: false,
                            //             msg: "error occured in wallet creation",
                            //             error
                            //         });
                            //     }

                            //     var insertData = {
                            //         "user_id":newResult[0].id,
                            //         "coin_id":1,
                            //         "public":data1.wallet.address,
                            //         "private":data1.wallet.privateKey
                            //     }
                            //     console.log(insertData);
                            //     await db.query(authQueries.createUserWallet,[insertData],async function(error,data){
                            //         if(error){
                            //         return res.status(400).send({
                            //             success: false,
                            //             msg: "error occured",
                            //             error
                            //         });
                            //     }
                            // })
                            // }

                            const jwtToken = jwt.sign({
                                email: req.body.email
                            }, config.JWT_SECRET_KEY)

                            return res.json({
                                success: true,
                                msg: "Register Successfully",
                                data: newResult[0],
                                Token: jwtToken
                            })
                        } else {
                            return res.json({
                                success: false,
                                msg: "Registration Failed",
                            })
                        }
                    });
                });
            });
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            msg: "user not registered due to internal error"
        });
    }
}