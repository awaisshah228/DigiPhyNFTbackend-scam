var db = require('../utils/connection');

module.exports = {
    getUsersEmail: "select u.*,coalesce(uw.id,0) as wallet_id,uw.public from users as u left join user_wallet as uw on uw.user_id=u.id where u.email = ?",
    getUsersUser: "select u.*,coalesce(uw.id,0) as wallet_id,uw.public from users as u left join user_wallet as uw on uw.user_id=u.id where u.user_name = ?",

    insertUserData: "insert into users SET ?",
    updateStatus: "update users SET is_email_verify=1 where email=?",
    updatepassword: "update users SET password=? where email=?",
    updateUser: "Update users SET ? where email=?",
    getCountry: "Select id,name,code from country order by name",
    getUserDetailData: "Select u.id as user_id,u.full_name,u.user_name,u.full_name,u.profile_pic,u.banner,u.email,follower_count(u.id) as follower_count,following_count(u.id) as folling_count,view_count(u.id) as view_count, date_format(u.dob,'%Y-%m-%d') as dob,u.phone,u.country_id,c.name as country_name,u.description,u.facebook,u.insta,u.twitter,u.pinterest,u.website,u.youtube,u.artstation,u.behance,u.steemit from users as u left join country as c on c.id=u.country_id where u.id=?",
    getPassword: "Select password from users where email =?",
    
    updateProfile: "update users SET full_name=?,email=?,profile_pic=?,banner=?  where email=?",
    getProfile: "Select full_name,address,profile_pic,banner,email,user_name from users where email=?",
    list: "Select title,author,price,item_image,price from marketplace ",
    aboutDetail: "Select description,facebook,insta,twitter,pinterest,website,youtube,artstation,behance,steemit from users where email = ?",
    updateaboutDetail: "Update users SET  description=?,facebook=?,insta=?,twitter=?,pinterest=?,website=?,youtube=?,artstation=?,behance=?,steemit=?  where email = ?",
    addFollow: "Insert into follow SET ?",
    removeFollow: "Delete from follow where  follower_id =? AND following_id=?",
    getFollow: "Select * from follow where  follower_id =? AND following_id=?",
    insertView: "insert into collection_view SET ? ",
    getUserDetail: "select follower_count(u.id) as follower_count,following_count(u.id) as folling_count,view_count(u.id) as view_count, u.id,u.profile_pic,u.full_name,u.user_name,u.telent_status,case when fl.id is null then 0 else 1 end as is_follow,t.facebook,t.youtube,t.twitter,t.insta  from users as u left JOIN follow as fl ON fl.following_id=u.id and follower_id=? left join telent as t on t.user_id=u.id where u.id=?",
    getSubscriber: "Select * from subscriber where email=?",
    addSubscriber: "insert into subscriber SET ?",
    createUserWallet: "insert into user_wallet SET ?",
    getSubscribe: "SELECT * FROM `subscriber` ORDER BY id desc",
    getUsersloginEmail : "select u.*,coalesce(uw.id,0) as wallet_id,uw.public from users as u left join user_wallet as uw on uw.user_id=u.id where u.email = ?",
    updateShippingAddress :"update users SET ? where id=?",
    getShippingAddress :"select city,state,pin_code,mobile_number,locality,shipping_address,landmark from users where id=?"
}