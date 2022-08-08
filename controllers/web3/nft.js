const Web3 = require('web3');
const { Network } = require('../../config');

const providerOrUrlTestnet = 'https://rpc-mumbai.maticvigil.com'; // Mumbai Testnet
const providerOrUrlMainnet = 'https://polygon-rpc.com'; // Polygon Mainnet
const ABI = require('./erc1155Abi.json');
const web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider((Network == 'TESTNET') ? providerOrUrlTestnet : providerOrUrlMainnet)
);

exports.mint = async (reqData) => {
    const fromAddress = reqData.account;
    const privateKey = reqData.privateKey;
    const contractAddress = reqData.contractAddress;
    const to_address = reqData.to_address;
    const tokenId = reqData.tokenId;
    const qty = reqData.qty;
    const getFee = reqData.getFee; // bool
    

    try {
        web3.eth.defaultAccount = fromAddress;
        const currentBalance = await web3.eth.getBalance(fromAddress);

        if (currentBalance == 0) {
            return {
                success: false,
                error: "Insufficient transaction fee in fee provider wallet, Please contact support for creating a new item."
            }
        }

        const contract = await new web3.eth.Contract(ABI, contractAddress);
        let count = await web3.eth.getTransactionCount(fromAddress, 'pending');       

        const tx_builder = await contract.methods.mint(to_address, tokenId, qty);
        let encoded_tx = tx_builder.encodeABI();

        let gasPrice = await web3.eth.getGasPrice();
         
        let gasLimit = await web3.eth.estimateGas({
            from: fromAddress,
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            to: contractAddress,
            data: encoded_tx,
        });

        if(getFee){
            return {
                success : true,
                fee : (parseInt(gasPrice) * parseInt(gasLimit) / 10**18).toFixed(6)
            }
        }

        let transactionObject = {
            nonce: web3.utils.toHex(count),
            from: fromAddress,
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: contractAddress,
            data: encoded_tx,
        };

    
        
        const trxPromise = await new Promise((resolve, reject) => {
            web3.eth.accounts
                .signTransaction(transactionObject, privateKey)
                .then(async (signedTx) => {
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (
                        err,
                        hash
                    ) {

                        if (!err) {
                            resolve({
                                success: true,
                                hash: hash
                            })
                        } else {
                            resolve({
                                success: false,
                                error: `Bad Request ${err}, Please contact support for creating a new item.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve({
                        success: false,
                        error: `Your contract parameters are not correct:  ${err}, Please contact support for creating a new item.`
                    })
                });
        });
        return trxPromise;
    } catch (e) {
        return {
            success: false,
            error: ee.toString() + ', Please contact support for creating a new item.'
        }
    }
}


exports.transfer = async (reqData) => {
    const fromAddress = reqData.account;
    const privateKey = reqData.privateKey;
    const contractAddress = reqData.contractAddress;
    const to_address = reqData.to_address;
    const tokenId = reqData.tokenId;
    const qty = reqData.qty;
    const item_owner_address = reqData.item_owner_address;

    const getFee = reqData.getFee; // bool


    try {
        web3.eth.defaultAccount = fromAddress;
        const currentBalance = await web3.eth.getBalance(fromAddress);

        if (currentBalance == 0) {
            return {
                success: false,
                error: "Insufficient transaction fee in fee provider wallet, Please contact support for transfer item."
            }
        }

        const contract = await new web3.eth.Contract(ABI, contractAddress);
        let count = await web3.eth.getTransactionCount(fromAddress, 'pending');       

        const tx_builder = await contract.methods.safeTransferFrom(item_owner_address,to_address, tokenId, qty,'0x');
        let encoded_tx = tx_builder.encodeABI();

        let gasPrice = await web3.eth.getGasPrice();
         
        let gasLimit = await web3.eth.estimateGas({
            from: fromAddress,
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            to: contractAddress,
            data: encoded_tx,
        });

        if(getFee){
            return {
                success : true,
                fee : (parseInt(gasPrice) * parseInt(gasLimit) / 10**18).toFixed(6)
            }
        }

        let transactionObject = {
            nonce: web3.utils.toHex(count),
            from: fromAddress,
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: contractAddress,
            data: encoded_tx,
        };

    
        
        const trxPromise = await new Promise((resolve, reject) => {
            web3.eth.accounts
                .signTransaction(transactionObject, privateKey)
                .then(async (signedTx) => {
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (
                        err,
                        hash
                    ) {

                        if (!err) {
                            resolve({
                                success: true,
                                hash: hash
                            })
                        } else {
                            resolve({
                                success: false,
                                error: `Bad Request ${err}, Please contact support for transfer item.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve({
                        success: false,
                        error: `Your contract parameters are not correct:  ${err}, Please contact support for transfer item.`
                    })
                });
        });
        return trxPromise;
    } catch (e) {
        return {
            success: false,
            error: ee.toString() + ', Please contact support for transfer item.'
        }
    }
}