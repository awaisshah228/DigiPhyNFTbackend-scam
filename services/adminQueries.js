
var db = require('../utils/connection');


module.exports = {
  updateWallet: "update settings set ? where id=1",
  updateItemMarket: "update user_collection set ? where id=?",
  putOnSale: "update item_edition set is_on_sale=1,is_sold=0,price=? where id=?",
  checkEditionQty: "SELECT id FROM item_edition where item_id=? and owner_id=? and is_on_sale=0 ORDER BY id limit ?",
  getSettings: "select resale_charges,minting_fee,royalty_percent,commission_percent,receive_address,public_key,private_key, coin_value,maxcoinpercentage,contractAddress, platform_fee from settings where id=1",
  getCollectionRoyaltyPercent:"SELECT royalty_percent from user_collection WHERE id=?",
  addUserCollectionFeatured: "update user_collection SET ? where id =?",
  user_delete:"update users SET is_deleted=1 where id=?",
  getbankdetailinadmin :"SELECT ub.*,u.full_name FROM `user_bank_detail` as ub LEFT JOIN users as u on u.id=ub.user_id",
  
  // updateWallet: "update settings set ? where id=1",

  getWithdrawInr: "SELECT t.id as transaction_id,date_format(t.datetime,'%d-%b-%Y') as date,t.token,u.user_name,u.email FROM transaction as t left join users as u on u.id=t.user_id where t.transaction_type_id=17 and t.user_id =?",
  getCoinTransferToUser: "SELECT t.id as transaction_id,date_format(t.datetime,'%d-%b-%Y') as date,t.token,u.user_name,u.email FROM transaction as t left join users as u on u.id=t.user_id where t.transaction_type_id=15 and t.user_id =?",
  getWithdrawl: "SELECT t.*,u.email,u.full_name,ub.account_name,ub.account_number,ub.ifsc_code,ub.bank_name FROM `transaction` as t LEFT JOIN users as u on u.id=t.user_id LEFT JOIN user_bank_detail as ub on ub.user_id=t.user_id WHERE t.transaction_type_id=3 AND t.user_id=?",



  getadmincollection:"Select uc.id as collection_id,u.id as user_id,u.full_name as user_name,u.email,uc.name as collection_name,uc.description,uc.is_featured,uc.profile_pic,uc.banner,uc.website,uc.facebook,uc.twitter,uc.insta,uc.telegram,uc.discord,date_format(uc.datetime,'%d-%M-%y')as create_date,CollectionNFTCount(uc.id) as nftCount from user_collection as uc left join users as u on u.id=uc.user_id WHERE uc.user_id=1 order by uc.id desc",
  insertadminCollection : "insert into user_collection SET ?",
  updateBankAccountinadmin :"update user_bank_detail SET ? where user_id=?",
  updateadminCollection: "update user_collection SET ?  where id=?",
  getSingleadminCollection : "Select id as collection_id,user_id,name,description,nft_type_id from user_collection where id=? and user_id =?",
  adminconnectionid : "SELECT * FROM  user_collection where id=?",
  updateblockchainstatus :"update transaction SET ? where user_id =? and item_id=?",
  updateipfshash :"update item SET ?  where id=?",
  getBulkNFT :  "Select users.user_name as owner_name,i.id,ie.id as item_edition_id,ie.edition_text,cu.user_name as creator_name,i.name,i.local_image,i.bulkNFT, ie.is_on_sale,i.description,i.royalty_percent,i.sell_type,i.approve_by_admin,bnm.folder_name,i.address,i.image,i.is_featured,i.owner_id,i.created_by,i.file_type,i.owner,i.item_category_id,i.quantity,ic.name as item_category,i.token_id,ie.price,i.is_active,ie.is_sold,ie.expiry_date from item_edition as ie left join item as i on i.id=ie.item_id left join bulk_nft_master as bnm on i.bulk_nft_master_id=bnm.id left join item_category as ic on ic.id=i.item_category_id left join users as cu on cu.id=i.created_by left JOIN users ON i.owner_id=users.id where ie.id  and bulk_nft_master_id > 0 and i.owner_id=? and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id)  ORDER BY i.id DESC",
  
  getUsersEmail: "SELECT * FROM users WHERE email = ? and is_admin=1",
  

  updateWebContent: "update web_content SET ?",
  getUsers: "SELECT us.id,us.user_name,us.is_deleted,us.email,us.is_email_verify,us.login_type,us.address,us.country_id,us.user_name,us.deactivate_account, ct.id as country_id,ct.name as country_name,us.is_featured,case when us.telent_status=0 then 'Pending' when us.telent_status=1 then 'Approved' when us.telent_status=2 then 'Rejected' else 'Not Applied' end as telent_status_name, us.telent_status from users as us LEFT JOIN country as ct ON ct.id = us.country_id where us.id<>1 ORDER BY us.id desc",
  
  
  
  insertCategory: "insert into item_category SET ?",
  deleteCategory: "DELETE FROM item_category WHERE id =?",
  updateCategory: "update item_category SET ? where id =?",
  updateUser: "update users SET ? where id =?",
  Category: "Select ic.id,ic.name,nt.name as nft_type,nt.id as nft_type_id,categoryNFTCount(ic.id) as nftCount from item_category as ic left join nft_type as nt on nt.id=ic.nft_type_id ORDER BY ic.id DESC",
  getDigitalCategory: "Select ic.id,ic.name,nt.name as nft_type,nt.id as nft_type_id from item_category as ic left join nft_type as nt on nt.id=ic.nft_type_id where ic.nft_type_id=1 and ic.id in (1,2,3)",
  
  singleCategory: "Select ic.id,ic.name,nt.name as nft_type,nt.id as nft_type_id from item_category as ic left join nft_type as nt on nt.id=ic.nft_type_id where ic.id=?",
  getNftType: "select * from nft_type",
  insertItem: "insert into item SET ?",
  deleteItem: "Delete from item_edition where id =?",
  updateItem: "update item SET ? where id =?",
  getItem: "Select i.id,ie.id as item_edition_id,ie.edition_text,i.name,i.description,i.image,i.file_type,i.owner,i.item_category_id,i.quantity,ic.name as item_category,i.token_id,ie.price,i.is_active,ie.is_sold,ie.expiry_date from item_edition as ie left join item as i on i.id=ie.item_id left join item_category as ic on ic.id=i.item_category_id where ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id) and i.is_active=1 and (ie.expiry_date >= now() or ie.expiry_date is null) and i.nft_type_id=1 and coalesce(ie.start_date,now())<=now() ORDER BY i.id DESC",
  getAdminItem: "Select case when length(coalesce(ou.user_name,''))=0 then ou.full_name else ou.user_name end  as owner_name, case when length(coalesce(ou.full_name,''))=0 then ou.user_name else ou.full_name end  as owner_name,i.id,ie.id as item_edition_id,ie.edition_text,case when length(coalesce(cu.user_name,''))=0 then cu.full_name else cu.user_name end as creator_name,i.name,ie.is_on_sale,i.description,i.royalty_percent,i.sell_type,i.user_collection_id,i.approve_by_admin,i.address,i.image,i.is_featured,i.owner_id,i.created_by,i.bulk_nft_master_id,i.file_type,case when length(coalesce(ou.user_name,''))=0 then ou.full_name else ou.user_name end as owner,i.item_category_id,i.quantity,ic.name as item_category,uc.name as collection_name,i.token_id,ie.price,i.is_active,ie.is_sold,ie.expiry_date from item_edition as ie left join item as i on i.id=ie.item_id left join item_category as ic on ic.id=i.item_category_id left join user_collection as uc on uc.id = i.user_collection_id left join users as cu on cu.id=i.created_by left JOIN users  as ou ON ie.owner_id=ou.id where ie.id in (select min(id) from item_edition where is_sold=0 group by item_id,owner_id)  ORDER BY i.id DESC",
  
  listSingleItem: "Select ie.id as item_edition_id,i.id as item_id,i.name,i.description,i.image,i.file_type,i.owner,i.item_category_id,ic.name as category_name,i.token_id,i.price from item_edition as ie left join item as i on i.id=ie.item_id left join item_category as ic on ic.id=i.item_category_id where ie.id = ? and (ie.expiry_date >= now() or i.expiry_date is null)",
  dashItem: "select sum(category_count) as category_count,sum(user_count) as user_count,sum(item_count) as item_count,sum(sold_item) as sold_item,sum(trending_item) as trending_item,sum(sold_volume) as sold_volume from ( select count(id)as category_count,0 as user_count,0 as item_count, 0 as sold_item, 0 as trending_item,0 as sold_volume from item_category UNION ALL select 0 as category_count,count(id)as user_count,0 as item_count, 0 as sold_item, 0 as trending_item,0 as sold_volume from users where is_deleted=0 UNION ALL select 0 as category_count,0 as user_count,count(id)as item_count, sum(is_sold) as sold_item, 0 as trending_item,0 as sold_volume from item_edition union all select 0 as category_count,0 as user_count,0 as item_count,0 as sold_item, 0 as trending_item,sum(amount)as sold_volume from transaction where transaction_type_id=1 ) as dashboard_data",
  deleteUser: "Update users set deactivate_account=1 WHERE id =?",
  activateUser: "Update users set deactivate_account=0 WHERE id =?",
  getProfile: "Select profile_pic from users where email=? and  is_admin=1",
  updateProfile: "update users SET profile_pic=? where email=? and is_admin=1",
  getPassword: "Select password from users where email =? and is_admin=1",
  updatepassword: "update users SET password=? where email=? and is_admin=1",
  
  
  getWebImage: "Select * from web_images",
  
  updateWebImage: "update web_images SET ? where id =?",
  
  createUserWallet: "insert into user_wallet SET ?",
  insertEdition: "insert into item_edition SET ?",
  additemimages: "insert into item_images SET ?",
  addUserNftFeatured: "update item SET ? where id =?",
  getfaqlist: "SELECT * from faq order by id desc ",
  faqadd: "insert into faq SET ?",
  faqdelete: "DELETE from faq where id =?",
  getPrivacypolicy: "SELECT * From privacy_policy",
  updateprivacyAndPolicy: "UPDATE privacy_policy SET ? WHERE id = ?",
  getTermsConditions: "SELECT * from terms_conditions",
  updateTermsConditions: "UPDATE terms_conditions SET ? WHERE id = ?",
  getAbout: "SELECT * from about",
  updateAbout: "UPDATE about SET ? WHERE id = ?",
  getproduct_pricing: "SELECT * from product_pricing",
  updateproduct_pricing: "UPDATE product_pricing SET ? WHERE id = ?",
  getrefund_pricing: "SELECT * from refund_pricing",
  updaterefund_pricing: "UPDATE refund_pricing SET ? WHERE id = ?",
  transactionDetailAll:"SELECT t.id as transaction_id,t.edition_text,tt.name as transaction_type,t.transaction_type_id,u.full_name,u.email,i.id as item_id,t.item_edition_id,i.name as item_name,i.description,i.image,t.amount,t.currency,date_format(t.datetime,'%d-%M-%y') as transaction_date  FROM transaction as t left join users as u on u.id=t.user_id left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id=ie.item_id left join transaction_type as tt on tt.id=t.transaction_type_id where t.transaction_type_id=1 or t.transaction_type_id=4 order by t.id desc",
  transactionDetailAllWithdraw:"SELECT t.id as transaction_id,t.edition_text,tt.name as transaction_type,t.transaction_type_id,u.full_name,u.user_name,u.email,i.id as item_id,t.item_edition_id,i.name as item_name,i.description,i.image,t.amount,t.currency,bk.account_number,bk.ifsc_code,bk.account_name,bk.bank_name,date_format(t.datetime,'%d-%M-%y') as transaction_date  FROM transaction as t left join users as u on u.id=t.user_id left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id=ie.item_id left join transaction_type as tt on tt.id=t.transaction_type_id left join user_bank_detail as bk on bk.user_id = t.user_id where t.transaction_type_id=3 order by t.id desc",
  transactionTotalSum : "select sum(amount) as amount from transaction WHERE transaction_type_id = 1",
  transactionTotalBid : "select sum(amount*-1) as amount from transaction WHERE transaction_type_id = 4",
  checkTransaction : "Select id from transaction where item_id=?",
  checkItemEditionView : "delete from item_edition_view where item_edition_id in (select id from item_edition where item_id=?)",
  checkItemEditionLike :  "delete from item_edition_like where item_edition_id in (select id from item_edition where item_id=?)",  
  checkItemEditionDeletion :"delete from item_edition where item_id =?",
  checkItemDeletion  :"delete from item where id=?",
  checkItemProperties:"delete from item_properties where item_id =?"
}