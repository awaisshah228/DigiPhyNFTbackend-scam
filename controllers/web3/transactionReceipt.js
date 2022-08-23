const Web3 = require('web3');
const {Network} = require('../../config');
const providerOrUrlTestnet = 'https://rpc-mumbai.maticvigil.com'; // Mumbai Testnet
const providerOrUrlMainnet = 'https://polygon-rpc.com'; // Polygon Mainnet

const web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider((Network == 'TESTNET')? providerOrUrlTestnet : providerOrUrlMainnet)
);

exports.getCollectionTransactionReceipt = async(hash) =>{
    const trx = await web3.eth.getTransactionReceipt(hash);
    if(!trx){
        return {
            status : "Pending",
        };
    }
    if(trx.status == undefined){
        return {
            status : "Pending",
        };
    }else if(trx.contractAddress && trx.status == true){
        return {
            status : "Confirmed",
            contractAddress : trx.contractAddress,
            blockchainConfirmation: 1
        }
    }else {
        return {
            status : "Failed",
            contractAddress : trx.contractAddress,
            blockchainConfirmation: 2
        }
    }
}