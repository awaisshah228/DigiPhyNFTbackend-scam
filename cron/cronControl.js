const config = require('../config');
const web3 = require('../controllers/web3/transactionReceipt.js');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

exports.collectionTrack = async () => {
    try {
        const [result, Row] = await promisePool.query(`SELECT id,hash FROM user_collection WHERE hash is not null AND blockchainConfirmation = 0`);
        if (result.length > 0) {
            result.map(async (item) => {
                const getTrxReceipt = await web3.getCollectionTransactionReceipt(item.hash);
                
                if (getTrxReceipt.status != "Pending") {
                    await promisePool.query(`UPDATE user_collection SET  ? WHERE id = ?`, [{
                        contractAddress: getTrxReceipt.contractAddress,
                        blockchainConfirmation: getTrxReceipt.blockchainConfirmation
                    },
                    item.id
                    ]);
                }
            });
        }
    } catch (error) {
        console.log("error (collectionTrack) : ", error);
    }
}