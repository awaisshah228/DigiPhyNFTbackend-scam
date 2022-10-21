const Web3 = require('web3');
const { maticApiKey, verifyAPIurl } = require('../../config');

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const data = new FormData();

exports.contractVerify = async (hash) => {

    data.append('profile_pic', fs.createReadStream('/home/kamlesh/Downloads/62ced3cf51f61.jpeg'));
    data.append('banner', fs.createReadStream('/home/kamlesh/Downloads/62ced3cf51f61.jpeg'));
    data.append('name', 'a12');
    data.append('description', 'a');
    data.append('website', 'https://');
    data.append('user_id', '384');
    data.append('contractName', 'a');


    var config = {
        method: 'post',
        url: verifyAPIurl,
        headers: {
            ...data.getHeaders()
        },
        data: data
    };

    const trx = await axios(config);
    if (trx.data.message == "OK") {
        return {
            result: trx.data.result,
        };
    } else {
        return trx.data;
    }

}




