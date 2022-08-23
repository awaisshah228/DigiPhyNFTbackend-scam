module.exports = {
    //   mysqlHost: "localhost",
    mysqlHost: "espsofttech.in",
    user: "esp",
    password: "Espsoft123#",
    database: "digiphynft",
    
    Network:"TESTNET", //Please open for Testnet blockchain
    //Network:"MAINNET", //Please open for mainnet blockchain

    mysqlPort: 3306,

    JWT_SECRET_KEY: '6dqw7dydyw7ewyuw',
    SESSION_EXPIRES_IN: '24h', // Session will expire after 1 day of creation
    nftMetadataUrl : "https://espsofttech.in:6018/api/nft/metadata/",
    
    // walletApiUrl: "https://espsofttech.in:8001/api/erc1155/mainnet/createWallet",
    blockchainApiUrl: 'https://espsofttech.in:8001/api/erc1155/matictest/', //testnet
    ethTransferApiUrl: 'https://espsofttech.in:8001/api/matic/testnet/transfer',
    contractAddress: '0xa133d14922c9ea05accc357526cf823f75401997',// test
    contractOwnerAddress: '0x22ad707a2572f2eb573586cB73dA75E0c52e651f', //testnet
    blockchainNetwork: 'testnet',
    mailUrl: 'https://espsofttech.in/digiphynft/',
    pinata_api_key:"105327714c080a01a4b5",
    pinata_secret_api_key:"e18cf3c1a8a7376852a4674735896bda9b7870cb4e11cc05c9e614711f955b35",


}

