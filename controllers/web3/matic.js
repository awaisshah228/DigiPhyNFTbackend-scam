const Web3 = require('web3');
const { Network } = require('../../config');

const providerOrUrlTestnet = 'https://rpc-mumbai.maticvigil.com'; // Mumbai Testnet
const providerOrUrlMainnet = 'https://polygon-rpc.com'; // Polygon Mainnet
const ABI = require('./erc1155Abi.json');
const web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider((Network == 'TESTNET') ? providerOrUrlTestnet : providerOrUrlMainnet)
);


exports.getBalance = async (reqData) => {

    let address = reqData.address;
   try {

    const balance =  await web3.eth.getBalance(address);

      return {
        success : true,
        balance:(parseInt(balance) / 10**18).toFixed(6),
        currency:'MATIC' 
      }
  } catch (e) {
    return {
      success : true,
      error:e.toString(),
    }
  }
}

exports.transfer = async (reqData) => {
    const fromAddress = reqData.account;
    const privateKey = reqData.privateKey;
    const to_address = reqData.to_address;
    const amount = reqData.amount;

    const getFee = reqData.getFee; // bool


    try {
        web3.eth.defaultAccount = fromAddress;
        const currentBalance = await web3.eth.getBalance(fromAddress);

        if (currentBalance == 0) {
            return {
                success: false,
                error: "Insufficient transaction fee in fee provider wallet, Please contact support for transfer amount."
            }
        }

        let count = await web3.eth.getTransactionCount(fromAddress, 'pending');       

        let gasPrice = await web3.eth.getGasPrice();
         
        let gasLimit = await web3.eth.estimateGas({
            from: fromAddress,
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            to: to_address,
            value : web3.utils.toHex(amount),
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
            to: to_address,
            value : web3.utils.toHex(amount),
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
                                error: `Bad Request ${err}, Please contact support for transfer amount.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve({
                        success: false,
                        error: `Your contract parameters are not correct:  ${err}, Please contact support for transfer amount.`
                    })
                });
        });
        return trxPromise;
    } catch (e) {
        return {
            success: false,
            error: ee.toString() + ', Please contact support for transfer amount.'
        }
    }
}