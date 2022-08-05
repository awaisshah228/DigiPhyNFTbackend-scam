/* COMPILE AND DEPLOY CONTRACT */
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
// const privateKey = '0x5f8a69d43addd60d84cca2a07ebccc9dae4cd6786c4da908f917acc90cf10666';
const providerOrUrl = 'https://rpc-mumbai.maticvigil.com';
// const providerOrUrl = 'https://rinkeby.infura.io/v3/9255e09afae94ffa9ea052ce163b8c90';

const web3 = new Web3();
web3.setProvider(
    new web3.providers.HttpProvider(providerOrUrl)
);


// const privateKey = '0x5f8a69d43addd60d84cca2a07ebccc9dae4cd6786c4da908f917acc90cf10666';
// const account = "0x9CEE00358Da45Eb0F8E47a8fA0dcf275D8E031B9";
// const nftName = "Kamlesh";
// const nftSymbol = "KK";
// const ownerAddress = account;
// const baseUri = "https://espsofttech.in/digify/nft/metadata/";

exports.deploy = async (reqData) => {
    try {
        //   const content =  fs.readFile("./DigiphyNFT.sol", 'utf8');

        // const content = fs.readFile('./controllers/web3/DigiphyNFT.sol','utf8');
        const content = await fs.readFileSync('./controllers/web3/DigiphyNFT.sol', 'utf8');

        const input = {
            language: 'Solidity',
            sources: {
                'DigiphyNFT.sol': { content }
            },
            settings: {
                outputSelection: { '*': { '*': ['*'] } }
            }
        };
        console.log(reqData)

        const account = reqData.account;//"0x9CEE00358Da45Eb0F8E47a8fA0dcf275D8E031B9";
        const privateKey = reqData.privateKey;//'0x5f8a69d43addd60d84cca2a07ebccc9dae4cd6786c4da908f917acc90cf10666';
        const nftName = reqData.nftName;//"Kamlesh";
        const nftSymbol = reqData.nftSymbol;//"KK";
        const ownerAddress = reqData.ownerAddress;//account;
        const baseUri = reqData.baseUri;//"https://espsofttech.in/digify/nft/metadata/";


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

        // return;

        // const { _address } = await new web3.eth.Contract(abi)
        //   .deploy({ data: bytecode })
        //   .send({from: account, gas: 1000000 });
        // console.log("Contract Address =>", _address);


        let encoded_tx = deployData;//tx_builder.encodeABI();

        let gasPrice = await web3.eth.getGasPrice();

        let count = await web3.eth.getTransactionCount(account);
        let gasLimit = await web3.eth.estimateGas({
            from: account,
            nonce: web3.utils.toHex(count),
            gasPrice: web3.utils.toHex(gasPrice),
            data: encoded_tx
        });

        console.log('gasPrice', gasPrice);
        console.log('gasLimit', gasLimit);

        let transactionObject = {
            nonce: web3.utils.toHex(count),
            from: account,
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            data: encoded_tx
        };
        const trxPromise =await new Promise((resolve, reject) => {
            web3.eth.accounts
                .signTransaction(transactionObject, privateKey)
                .then(async (signedTx) => {
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (
                        err,
                        hash
                    ) {
                        
                        if (!err) {
                            resolve( {
                                success: true,
                                hash: hash
                            })
                        } else {
                            resolve( {
                                success: false,
                                error: `Bad Request ${err}, Please contact support for creating a new collection.`
                            })
                        }
                    });
                })
                .catch((err) => {
                    resolve( {
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

