
const openpgp = require("openpgp");
const { base64encode, base64decode } = require('nodejs-base64');

exports.pgpEncrypt = async function(public_key,metaData){
        // encrypt-file.js
        try {
            
            const publicKeyArmored = base64decode(public_key); 
            const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: metaData }), // input as Message object
                encryptionKeys: publicKey,
                // signingKeys: privateKey // optional
            });
            console.log(encrypted); // ReadableStream containing '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
    
    
            let encoded = base64encode(encrypted); // "aGV5ICB0aGVyZQ=="
            return {
                success: true,
                encrypted: encoded
            }
        } catch (err) {
            return {
                success: false,
                error: err.toString()
            }
        }

}
