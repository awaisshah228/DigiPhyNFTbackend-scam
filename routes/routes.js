const jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var config = require('../config');
var db = require('../utils/connection');
/* stripe includes*/
//const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(`${config.stripe_key}`);
//const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
/*-------------------*/

router.use(bodyParser.json());
router.use(
    bodyParser.urlencoded({
        extended: true,
    })
);     


var multer  = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req, file, cb) => {
      console.log(file.originalname);
      var filetype = '';
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      if(file.mimetype === 'image/jpg') {
        filetype = 'jpg';
      }
      if(file.mimetype === 'video/mp4') {
        filetype = 'mp4';profile
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({storage: storage});
var pageUpload = upload.fields([{ name: 'avatar', maxCount: 1 }])
var userupload = upload.fields([{ name: 'profile_pic', maxCount: 1 }, { name: 'banner', maxCount: 8 }])
var useruploadAdmin = upload.fields([{ name: 'profile_pic', maxCount: 1 }])

var sliderUpload = upload.fields([{ name: 'slider1', maxCount: 1 }, { name: 'slider2', maxCount: 8 }, { name: 'slider3', maxCount: 8 }, { name: 'logo', maxCount: 8 }, { name: 'favicon', maxCount: 8 }, { name: 'realEstateImage', maxCount: 8 }])
var realEstateImage = upload.fields([{ name: 'slider1', maxCount: 1 }, { name: 'slider2', maxCount: 8 }, { name: 'slider3', maxCount: 8 }])
var collectionImages = upload.fields([{ name: 'profile_pic', maxCount: 1 }, { name: 'banner', maxCount: 1 }]);

var addnftImage = upload.fields([{ name: 'image', maxCount: 1 }])

// ---------------Controllers--------
const signup = require('../controllers/signup');
const login = require('../controllers/login');
const admin = require('../controllers/admin/admin');
const getFile = require('../controllers/getFile');
const marketplace = require('../controllers/marketplace');
const explorer = require('../controllers/infinity_explorer');
const { pgpEncrypt } = require('../controllers/pgpEncription/pgpEncryption');


//================================================  Aman routes User  =====================================================
    

router.post('/addNftByUser',addnftImage, marketplace.addNftByUser.bind(this,db));


//================================================  Aman routes Admin  =====================================================

router.get('/faqlist',admin.getfaqlist.bind(this,db))
router.post('/faqadd',admin.faqadd.bind(this,db))
router.post('/faqdelete',admin.faqdelete.bind(this,db))
router.get('/getPrivacypolicy', admin.getPrivacypolicy.bind(this, db));
router.post('/updateprivacyAndPolicy', admin.updateprivacyAndPolicy.bind(this, db));
router.get('/getTermsConditions', admin.getTermsConditions.bind(this, db));
router.post('/updateTermsConditions', admin.updateTermsConditions.bind(this, db));
router.get('/getAbout', admin.getAbout.bind(this, db));
router.post('/updateAbout', admin.updateAbout.bind(this, db));
router.post('/receiveWalletUpdate', admin.receiveWalletUpdate.bind(this, db));
router.post('/getSettings', admin.getSettings.bind(this, db));
router.post('/adminWalletUpdate', admin.adminWalletUpdate.bind(this, db));
router.post('/updateFee', admin.updateFee.bind(this, db));
router.post('/updateItemMarket', admin.updateItemMarket.bind(this, db));
router.post('/updateItemAdmin', admin.updateItemAdmin.bind(this, db));

router.post('/deleteuser',admin.deleteUser.bind(this, db));
router.get('/getadmincollection',admin.getAdminCollection.bind(this,db));
router.post('/insertadminCollection', collectionImages, admin.insertadminCollection.bind(this, db));

router.post('/deleteuser',admin.deleteUser.bind(this, db));
router.post('/activateuser',admin.activateUser.bind(this, db));
router.post('/loginType', login.loginType.bind(this, db));
router.post('/getProfilePic', signup.getProfilePic.bind(this, db));
router.post('/insertUserCollection', collectionImages, marketplace.insertUserCollection.bind(this, db));
router.post('/getUserCollection',marketplace.getUserCollection.bind(this,db));
router.get('/getAllUserCollection',marketplace.getAllUserCollection.bind(this,db));
router.post('/TrendingNfts', marketplace.TrendingNfts.bind(this, db));
router.post('/recentNfts', marketplace.recentNfts.bind(this, db));

router.post('/addUserCollectionFeatured', admin.addUserCollectionFeatured.bind(this, db));
router.post('/swapDigiphyCoin',marketplace.swapDigiphyCoin.bind(this,db))
router.post('/getCollectionById', marketplace.getCollectionById.bind(this, db));
router.post('/getuserDetailData', signup.getUserDetailData.bind(this, db));

router.post('/user_delete',admin.user_delete.bind(this,db));
router.get('/getadmincollection',admin.getAdminCollection.bind(this,db));
router.post('/insertadminCollection', collectionImages, admin.insertadminCollection.bind(this, db));
router.get('/adminconnectionid/:collection_id',admin.admin_connection_id.bind(this, db));
router.post('/updateadminCollection',collectionImages,admin.updateadminCollection.bind(this,db))
// router.post('/addNftByadmin',addnftImage, admin.addNftByadmin.bind(this,db));
router.post('/getBulkNFT', admin.getBulkNFT.bind(this, db));
router.post('/getLocalImageHash', admin.getLocalImageHash.bind(this, db));









//====================================================================================================





















//==============Post Status API ===================================
router.post('/adminlogin', admin.login.bind(this, db));
router.get('/getfooter', admin.getFooter.bind(this, db));

router.get('/getwebcontent', admin.getWebContent.bind(this, db));
router.get('/getmarketplace', admin.getMarketPlace.bind(this, db));

router.post('/insertmarketplace',ensureWebToken,admin.insertMarketPlace.bind(this,db));

router.post('/updatefooter', ensureWebToken,admin.updateFooter.bind(this, db));
router.post('/updatewebcontent', ensureWebToken,admin.updateWebContent.bind(this, db));


/*--------- Item Category ---------*/
router.post('/insertcategory', admin.insertCategory.bind(this, db));
router.get('/getcategory', admin.getCategory.bind(this, db));
router.get('/getDigitalCategory', admin.getDigitalCategory.bind(this, db));
router.get('/getUserDigitalCategory', admin.getUserDigitalCategory.bind(this, db));
router.get('/getRealEstateCategory', admin.getRealEstateCategory.bind(this, db));
router.get('/getUserRealEstateCategory', admin.getUserRealEstateCategory.bind(this, db));
router.post('/singlecategory', admin.singleCategory.bind(this, db));
router.post('/singlecategory', admin.singleCategory.bind(this, db));
router.get('/getNftType', admin.getNftType.bind(this, db));
router.post('/updatecategory', admin.updateCategory.bind(this, db));
router.post('/deletecategory', admin.deleteCategory.bind(this, db));
router.get('/getuser',admin.getUsers.bind(this, db));
router.get('/dashboarditem',admin.dashboardItem.bind(this, db));
router.get('/getUserTelent',admin.getTelentUsers.bind(this, db));
router.get('/getRealEstateUsers',admin.getRealEstateUsers.bind(this,db));


/*--------- End Category ---------*/

/*--------- Item  ---------*/
router.post('/insertitem',addnftImage,admin.insertItem.bind(this, db));
router.post('/deleteitem', ensureWebToken,admin.deleteItem.bind(this, db));
router.post('/updateitem',ensureWebToken,admin.updateItem.bind(this, db));

router.get('/getitem',admin.getItem.bind(this, db));
router.get('/getAdminItem',admin.getAdminItem.bind(this, db));
router.post('/removeFeatured',ensureWebToken,admin.removeFeatured.bind(this, db));
router.post('/addFeatured',ensureWebToken,admin.addFeatured.bind(this, db));
router.post('/addUserNftFeatured', admin.addUserNftFeatured.bind(this, db));

router.post('/showNFT',admin.showNFT.bind(this, db));
router.post('/hideNFT',admin.hideNFT.bind(this, db));

router.post('/listitem',admin.listItem.bind(this, db));
router.post('/listAdminItem',admin.listAdminItem.bind(this, db));
router.post('/listSingleItem',admin.listSingleItem.bind(this, db));
router.get('/getWebImage',admin.getWebImage.bind(this, db));
router.get('/getRealEstateImage',admin.getRealEstateImage.bind(this, db));
//router.post('/updateWebImage',admin.updateWebImage.bind(this, db));
router.post('/updateWebImage', sliderUpload, admin.updateWebImage.bind(this, db));
router.post('/updateRealEstateImage', realEstateImage, ensureWebToken,admin.updateRealEstateImage.bind(this, db));


/*--------- End Item ---------*/

/*--------- Marketplace ---------*/
router.post('/testmail',marketplace.testmail.bind(this, db));
router.post('/test',marketplace.test.bind(this, db));


router.post('/getjwttoken',marketplace.getJWTToken.bind(this, db));


router.post('/addTelent',marketplace.addTelent.bind(this, db));
router.post('/addRealEstateUser',ensureWebToken,marketplace.EstateUser.bind(this, db));

router.post('/addWishlist',ensureWebToken,marketplace.addWishlist.bind(this, db));
router.post('/listWishlist',marketplace.listWishlist.bind(this,db));
router.post('/removeWishlist',ensureWebToken,marketplace.removeWishlist.bind(this,db));

router.post('/addCart',ensureWebToken,marketplace.addCart.bind(this, db));
router.post('/listCart',marketplace.listCart.bind(this,db));
router.post('/removeCart',ensureWebToken,marketplace.removeCart.bind(this,db));
router.post('/itemdetail',marketplace.itemDetails.bind(this,db));
router.post('/ItemDetailForEdit',marketplace.ItemDetailForEdit.bind(this,db));
router.post('/getUserTelent',marketplace.getUserTelent.bind(this,db));
router.post('/getSingleUserCollection',marketplace.getSingleUserCollection.bind(this,db));
router.post('/updateUserCollection',marketplace.updateUserCollection.bind(this,db));
router.post('/deleteUserCollection',marketplace.deleteUserCollection.bind(this,db));
router.post('/createMetadata', marketplace.createMetadata.bind(this, db));

router.post('/getUserItem',marketplace.getUserItem.bind(this,db));
router.post('/getUserownerItem',marketplace.getUserOwnerItem.bind(this,db));
router.post('/updateblockchainstatus',marketplace.blockchainupdatetransaction.bind(this,db));



router.post('/updateTelentForApproved',marketplace.updateTelentForApproved.bind(this,db));
router.post('/updateTelentForReject',marketplace.updateTelentForReject.bind(this,db));
router.post('/realEstateUserReject',marketplace.realEstateUserReject.bind(this,db));
router.post('/realEstateUserApprove',marketplace.realEstateUserApprove.bind(this,db));
router.post('/getRealEstateStatus',marketplace.getRealEstateStatus.bind(this,db));

router.post('/insertRealEstateCollection',ensureWebToken,marketplace.insertRealEstateCollection.bind(this,db));
router.post('/getRealEstateCollection',marketplace.getRealEstateCollection.bind(this,db));
router.post('/getPayoutAddress',marketplace.getPayoutAddress.bind(this,db));
router.post('/getRoyaltyTransaction',marketplace.getRoyaltyTransaction.bind(this,db));
router.get('/getAllRoyaltyTransaction',marketplace.getAllRoyaltyTransaction.bind(this,db));
router.post('/resaleNFT',marketplace.resaleNFT.bind(this,db));



router.post('/getQR',marketplace.getQR.bind(this,db));
router.post('/twoAuthenticationVerify',marketplace.twoAuthenticationVerify.bind(this,db));
router.post('/getCategoryById',marketplace.getCategoryById.bind(this,db));

router.post('/allSearch',marketplace.allSearch.bind(this,db));
router.post('/itemPurchase',marketplace.itemPurchase.bind(this,db));

router.post('/insertBid',marketplace.insertBid.bind(this,db));
router.post('/getBidDetail',marketplace.getBidDetail.bind(this,db));
router.post('/bidAccept',marketplace.bidAccept.bind(this,db));
router.post('/getTelentStatus',marketplace.getTelentStatus.bind(this,db));
router.post('/cryptoTrxCanceled',ensureWebToken,marketplace.cryptoTrxCanceled.bind(this,db));
router.post('/onlinetrx_start',ensureWebToken,marketplace.onlinetrx_start.bind(this,db));
router.post('/nftTrx_start',ensureWebToken,marketplace.nftTrx_start.bind(this,db));
router.post('/getUserBids',marketplace.getUserBids.bind(this,db));
router.get('/getfaq',marketplace.getfaq.bind(this,db));
//router.post('/stripe_success',marketplace.stripe_success.bind(this,db));
router.post('/stripePayment',ensureWebToken,marketplace.stripePayment.bind(this,db));
// router.post('/paypalMintPayment',marketplace.paypalMintPayment.bind(this,db));
router.post('/circleMintPayment',marketplace.circleMintPayment.bind(this,db));
// router.post('/paypalResalePayment',marketplace.paypalResalePayment.bind(this,db));
router.post('/circleResalePayment',marketplace.circleResalePayment.bind(this,db));
router.post('/walletPayment',ensureWebToken,marketplace.walletPayment.bind(this,db)); 
router.post('/walletResalePayment',ensureWebToken,marketplace.walletResalePayment.bind(this,db)); 
router.post('/getUserPurchase',marketplace.getUserPurchase.bind(this,db));
router.post('/getUserSale',marketplace.getUserSale.bind(this,db));
router.post('/myBidItem',marketplace.myBidItem.bind(this,db));
router.get('/getRecentWorks',marketplace.getRecentWorks.bind(this,db));
router.post('/allTalentList',marketplace.allTalentList.bind(this,db));
router.post('/rejectBid',marketplace.rejectBid.bind(this,db));
router.post('/itemView',marketplace.itemView.bind(this,db));
router.post('/likeItem',marketplace.likeItem.bind(this,db));
router.post('/getItemLikeCount',marketplace.getItemLikeCount.bind(this,db));
router.post('/getWalletDetail',marketplace.getWalletDetail.bind(this,db));
router.post('/userWithdraw',marketplace.userWithdraw.bind(this,db));
router.post('/insertContact',marketplace.insertContact.bind(this,db));
router.get('/getContact',marketplace.getContact.bind(this,db));
router.post('/transactionDetail',marketplace.transactionDetail.bind(this,db));
router.get('/allCategoryItem',marketplace.allCategoryItem.bind(this,db));
// router.post('/addRealEstate',marketplace.addRealEstate.bind(this,db));
router.post('/getRealEstateItem',marketplace.getRealEstateItem.bind(this,db));
router.get('/getAllRealEstateCollection',marketplace.getAllRealEstateCollection.bind(this,db));
router.post('/updateRealEstateUser',ensureWebToken,marketplace.updateRealEstateUser.bind(this,db));
router.post('/updateTalentUser',ensureWebToken,marketplace.updateTalentUser.bind(this,db));
router.get('/getRealEstate',marketplace.getRealEstate.bind(this,db));
router.post('/getUserRealEstate',marketplace.getUserRealEstate.bind(this,db));
router.post('/getUserTalentById',marketplace.getUserTalentById.bind(this,db));
router.post('/updatePayoutAddress',ensureWebToken,marketplace.updatePayoutAddress.bind(this, db));
router.get('/getContractDeatils',marketplace.getContractDeatils.bind(this,db));
router.get('/getRoyaltyList',marketplace.getRoyaltyList.bind(this,db));
router.post('/getWalletTransaction',marketplace.getWalletTransaction.bind(this,db));
router.post('/resaleTrxStart',ensureWebToken,marketplace.resaleTrxStart.bind(this,db));
router.post('/getMarketActivity',marketplace.getMarketActivity.bind(this,db));
//router.post('/imageSave',marketplace.imageSave.bind(this,db));
router.post('/transferList', marketplace.transferList.bind(this, db));

router.post('/insertbankdetaill', marketplace.insertBankDetail.bind(this, db));
router.post('/getbankdetail', marketplace.getBankDetail.bind(this, db));


/*--------- End Marketplace ---------*/


/*--------- explorer start ---------*/
router.post('/listItemexplorer',explorer.listItemexplorer.bind(this,db));
router.post('/itemdetails',explorer.itemdetails.bind(this,db));
router.post('/userwallet',explorer.userwallet.bind(this,db));
router.post('/useritem',explorer.useritem.bind(this,db));
router.post('/getCreatorItem',explorer.getCreatorItem.bind(this,db));
router.post('/userholder',explorer.userHolder.bind(this,db));
router.post('/useritemdetail',explorer.userItems.bind(this,db));
router.post('/getWalletTrx',explorer.getWalletTrx.bind(this,db));
router.post('/hashdetail',explorer.hashDetail.bind(this,db));
router.post('/explorerSearch',explorer.explorerSearch.bind(this,db));
/*--------- End explorer ---------*/


router.get("/uploads/:image", getFile.getImage);

router.post('/updateProfilePic', userupload, signup.updateProfilePic.bind(this, db));
router.post('/getAboutDetail',signup.getAboutDetail.bind(this,db));
router.post('/updateAboutDetail',signup.updateAboutDetail.bind(this,db));
router.post('/follow',signup.follow.bind(this, db))
router.post('/insertView',signup.insertView.bind(this, db))
router.post('/getUserDetail',signup.getUserDetail.bind(this, db))
router.post('/addSubscriber',signup.addSubscriber.bind(this, db));
router.get('/getSubscriber',signup.getSubscriber.bind(this, db));

router.post('/getshippingaddress',signup.getShippingAddress.bind(this, db));
router.post('/updateshippingaddress',signup.updateShippingAddress.bind(this, db));





router.post('/updateprofilepicAdmin',useruploadAdmin, admin.insertProfilePic.bind(this, db));
router.post('/adminprofilepic', admin.getProfilePic.bind(this, db));
router.post('/adminpassword',ensureWebToken,admin.changePassword.bind(this, db));
router.post('/updateWallet',ensureWebToken,admin.updateWallet.bind(this, db));
router.post('/addBulkNftByAdmin' ,admin.addBulkNftByAdmin.bind(this, db));
router.get('/getBankDetailinAdmin' ,admin.getBankDetailinAdmin.bind(this, db));
router.post('/updateBankAccountinadmin' ,admin.updateBankAccountinadmin.bind(this, db));




router.post('/register', signup.register.bind(this, db));
router.post('/verifyAccount/:token', signup.activateAccount.bind(this, db));
router.post('/login', login.login.bind(this, db));
router.post('/forgot', signup.forgot.bind(this, db));
router.post('/resetpassword/:token', signup.Resetpassword.bind(this, db));
router.post('/getuserprofile', signup.getUserProfile.bind(this, db));
router.post('/updateuserprofile', signup.userProfile.bind(this, db));
router.post('/deactivate', ensureWebToken,signup.deActivateAccount.bind(this, db));
router.post('/changepassword', ensureWebToken,signup.changePassword.bind(this, db));
router.get('/getcountries', signup.getCountry.bind(this, db));
































router.get("/", function (request, response) {
    response.contentType("routerlication/json");
    response.end(JSON.stringify("Node is running"));    
});

router.get("*", function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: "Invalid Request {URL Not Found}", 
    });
});

router.post("*", function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: "Invalid Request {URL Not Found}",
    });
});

function ensureWebToken(req, res, next) {

    const x_access_token = req.headers['authorization'];
    if (typeof x_access_token !== undefined) {
        req.token = x_access_token;
        verifyJWT(req, res, next);
    } else {
        res.sendStatus(403);
    }
}

function ensureWebTokenAdmin(req, res, next) {

    const x_access_token = req.headers['authorization'];
    if (typeof x_access_token !== undefined) {
        req.token = x_access_token;
        verifyJWTAdmin(req, res, next);
    } else {
        res.sendStatus(403);
    }
}

// async function verifyJWT(req, res, next) {

//     jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
//         if (err) {
//             res.sendStatus(401);
//         } else {
//             const _data = await jwt.decode(req.token, {
//                 complete: true,
//                 json: true
//             });
//             req.user = _data['payload'];
//             next();
//         }
//     })
// }

async function verifyJWT(req, res, next) {
    jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            const _data = await jwt.decode(req.token, {
                complete: true,
                json: true
            });
            req.user = _data['payload'];
            if(req.user.address != req.body.address){
                return res.sendStatus(403);
            }
            next();
        }
    })
}


async function verifyJWTAdmin(req, res, next) {
    jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            const _data = await jwt.decode(req.token, {
                complete: true,
                json: true
            });
            req.user = _data['payload'];
            if(req.user.email != req.body.email){
                return res.sendStatus(403);
            }
            next();
        }
    })
}



module.exports.routes = router;
