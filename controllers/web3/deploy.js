/* COMPILE AND DEPLOY CONTRACT */
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const Web3 = require('web3');
const {Network} = require('../../config');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const providerOrUrlTestnet = 'https://rpc-mumbai.maticvigil.com'; // Mumbai Testnet
const providerOrUrlMainnet = 'https://polygon-rpc.com'; // Polygon Mainnet

const web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider((Network == 'TESTNET')? providerOrUrlTestnet : providerOrUrlMainnet)
);

exports.deploy = async (reqData) => {
    try {
        const account = reqData.account;
        const privateKey = reqData.privateKey;
        const nftName = reqData.nftName;
        const nftSymbol = reqData.nftSymbol;
        const ownerAddress = reqData.ownerAddress;
        const baseUri = reqData.baseUri;
      
        let bb = await web3.eth.getBalance(account);
          console.log(bb)
        const content = await fs.readFileSync('./controllers/web3/DigiphyNFT.sol', 'utf8');
        const input = {
            language: 'Solidity',
            sources: {
                'DigiphyNFT.sol': { content }
            },
            settings: {
                outputSelection: { '*': { '*': ['*'] } },
                optimizer: {
                    "enabled": true,
                    "runs": 200
                }
            }
        };

        const { contracts } = JSON.parse(
            solc.compile(JSON.stringify(input))
        );
        const contract = contracts['DigiphyNFT.sol'].DigiphyNFT;



        /* 3. Extract Abi And Bytecode From Contract */
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;
        /* 4. Send Smart Contract To Blockchain */

        const result = await new web3.eth.Contract(abi);
        const deployData = result
            .deploy({
                data: "0x" + bytecode,
                arguments: [
                    nftName,
                    nftSymbol,
                    ownerAddress,
                    baseUri
                ],
            })
            .encodeABI();

        let encoded_tx = deployData;
        let gasPrice = await web3.eth.getGasPrice();
        let count = await web3.eth.getTransactionCount(account,'pending');
        let gasLimit = await web3.eth.estimateGas({
            from: account,
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            data: encoded_tx
        });
        console.log({gasLimit,gasPrice,fee :gasLimit*gasPrice/10**18 })
        let transactionObject = {
            nonce: web3.utils.toHex(count),
            from: account,
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            data: encoded_tx
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
                                error: `Bad Request ${err}, Please contact support for creating a new collection.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve({
                        success: false,
                        error: `Your contract parameters are not correct:  ${err}, Please contact support for creating a new collection.`
                    })
                });
        });
        return trxPromise;
    } catch (ee) {

        return {
            success: false,
            error: ee.toString() + ', Please contact support for creating a new collection.'
        }
    }
};

