const Web3 = require('web3');
const { Network } = require('../../config');

const providerOrUrlTestnet = 'https://rpc-mumbai.maticvigil.com'; // Mumbai Testnet
const providerOrUrlMainnet = 'https://polygon-rpc.com'; // Polygon Mainnet
const ABI = require('./erc20Abi.json');
const web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider((Network == 'TESTNET') ? providerOrUrlTestnet : providerOrUrlMainnet)
);



exports.getTokenDetails = async (reqData) => {
    const address = reqData.address;
    const contractAddress = reqData.contractAddress;
    

    try {
        web3.eth.defaultAccount = address;
        
        const contract = await new web3.eth.Contract(ABI, contractAddress);

        let totalSupply = await contract.methods.totalSupply().call();
        const symbol = await contract.methods.symbol().call();
        const name = await contract.methods.name().call();
        const owner = await contract.methods.owner().call();
        const decimals = await contract.methods.decimals().call();     
        
        totalSupply = (parseFloat(totalSupply) / 10 ** parseInt(decimals)).toFixed(0);
            return {
                success : true,
                totalSupply : totalSupply,
                symbol : symbol,
                name : name,
                decimals : decimals,
                owner : owner
            }
    
    } catch (e) {
        return {
            success: false,
            error: e.toString() + ', Please contact technical support for creating a new item.'
        }
    }
}

exports.getTokenBalance = async (reqData) => {
    const address = reqData.address;
    const contractAddress = reqData.contractAddress;
    

    try {
        web3.eth.defaultAccount = address;
        
        const contract = await new web3.eth.Contract(ABI, contractAddress);
        
        const decimals = await contract.methods.decimals().call();     
        const balance = await contract.methods.balanceOf(address).call();
        let trxToken = (parseFloat(balance) / 10 ** parseInt(decimals)).toFixed(6);
            return {
                success : true,
                token : trxToken
            }
    
    } catch (e) {
        return {
            success: false,
            error: e.toString() + ', Please contact technical support for creating a new item.'
        }
    }
}

exports.mint = async (reqData) => {
    const fromAddress = reqData.account;
    const privateKey = reqData.privateKey;
    const contractAddress = reqData.contractAddress;
    const to_address = reqData.to_address;
    const token = reqData.token; // How much token mint
    const getFee = reqData.getFee; // bool
    

    try {
        web3.eth.defaultAccount = fromAddress;
        const currentBalance = await web3.eth.getBalance(fromAddress);

        if (currentBalance == 0) {
            return {
                success: false,
                error: "Insufficient transaction fee in fee provider wallet, Please contact technical support for creating a new item."
            }
        }

        const contract = await new web3.eth.Contract(ABI, contractAddress);
        let count = await web3.eth.getTransactionCount(fromAddress, 'pending');  
        const decimals = await contract.methods.decimals().call();     
        let trxToken = parseInt(parseFloat(token) * 10 ** parseInt(decimals)).toString();
        const tx_builder = await contract.methods.mint(to_address, trxToken);
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
                                error: `Bad Request ${err}, Please contact technical support for creating a new item.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve({
                        success: false,
                        error: `Your contract parameters are not correct:  ${err}, Please contact technical support for creating a new item.`
                    })
                });
        });
        return trxPromise;
    } catch (e) {
        return {
            success: false,
            error: e.toString() + ', Please contact technical support for creating a new item.'
        }
    }
}


exports.transfer = async (reqData) => {
    const fromAddress = reqData.account;
    const privateKey = reqData.privateKey;
    const contractAddress = reqData.contractAddress;
    const to_address = reqData.to_address;
    const token = reqData.token;
    

    const getFee = reqData.getFee; // bool


    try {
        web3.eth.defaultAccount = fromAddress;
        const currentBalance = await web3.eth.getBalance(fromAddress);

        if (currentBalance == 0) {
            return {
                success: false,
                error: "Insufficient transaction fee in fee provider wallet, Please contact technical support for transfer item."
            }
        }

        const contract = await new web3.eth.Contract(ABI, contractAddress);
        let count = await web3.eth.getTransactionCount(fromAddress, 'pending');       

        const balance = await contract.methods.balanceOf(fromAddress).call();
        const decimals = await contract.methods.decimals().call();     
        let trxToken = parseInt(parseFloat(token) * 10 ** parseInt(decimals)).toString();
        if(parseInt(balance) < parseInt(trxToken)){
            return {
                success: false,
                error: "Insufficient token balance in wallet"
            }
        }
        
        const tx_builder = await contract.methods.transfer(to_address, trxToken.toString());
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
                                error: `Bad Request ${err}, Please contact technical support for transfer item.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve({
                        success: false,
                        error: `Your contract parameters are not correct:  ${err}, Please contact technical support for transfer item.`
                    })
                });
        });
        return trxPromise;
    } catch (ee) {
        return {
            success: false,
            error: ee.toString() + ', Please contact technical support for transfer item.'
        }
    }
}