var db = require('../utils/connection');

module.exports = {

    getItemDetails : "Select i.id as item_id, u.full_name as owner,uw.public as creator, i.end_date,i.datetime,i.quantity,coalesce(getSoldEdition(i.id),0) as editionCount,getEditionCount(i.id) as TotalEdition,i.file_type, i.item_category_id, i.name,i.description, i.image, i.price, i.created_by,i.edition_type,ie.id as item_edition_id,i.expiry_date,ie.id as id,u.user_name,i.token_hash from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN users as u ON i.created_by=u.id left join user_wallet as uw on uw.user_id =i.created_by where ie.id =?  and (date(i.expiry_date) >= CURRENT_DATE or i.expiry_date is null)",
    getSetting : "select * from settings where id=1",
  
    getWalletDetail : `select uw.user_id,uw.public,0 as balance from user_wallet as uw where uw.user_id=getUserIdByAddress(?) `,
    getUserItem : " Select i.id,ie.id as item_edition_id, case when length(i.name)>=30 then concat(left(i.name,30),'...')  else i.name end as name,i.name as item_fullname,i.description,i.image,i.file_type,i.owner,ie.owner_id,i.created_by,i.item_category_id,i.token_id,ie.price,coalesce(i.start_date,i.datetime) as start_date,i.end_date,ie.edition_text,ie.edition_no from item_edition as ie left join item as i on i.id=ie.item_id where ie.id in (select min(id) from item_edition where is_sold=0 group by item_id)  and (date(i.expiry_date) >= CURRENT_DATE or i.expiry_date is null) and ie.owner_id=getUserIdByAddress(?)",
   
   
    
}