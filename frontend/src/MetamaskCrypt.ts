import { Contract, ethers } from 'ethers';
import Store from '../../contract/artifacts/contracts/Store.sol/Store.json';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util'

export default class MetamaskCrypt {
    private ethereum;
    private _store: Contract;
    private _encryptionPublicKey;
    constructor(ethereum) {
        this.ethereum = ethereum;
    }

    get provider() {
        return new ethers.providers.Web3Provider(this.ethereum, 'any');
    }

    get signer() {
        return this.provider.getSigner();
    }

    async getAddress() {
        return this.signer.getAddress();
    }

    async getEncryptionPublicKey() {
        if (!this._encryptionPublicKey) {
            this._encryptionPublicKey = await this.ethereum.request({
                method: 'eth_getEncryptionPublicKey',
                params: [await this.getAddress()] // you must have access to the specified account
            });
        }
        console.log('encpub', this._encryptionPublicKey)
        return this._encryptionPublicKey;
    }
    async encrypt(data) {
        const ephemeralKeyPair = nacl.box.keyPair();

        // assemble encryption parameters - from string to UInt8
        let pubKeyUInt8Array;
        try {
            pubKeyUInt8Array = naclUtil.decodeBase64(await this.getEncryptionPublicKey());
        } catch (err) {
            throw new Error('Bad public key');
        }

        const msgParamsUInt8Array = naclUtil.decodeUTF8(data);
        const nonce = nacl.randomBytes(nacl.box.nonceLength);

        // encrypt
        const encryptedMessage = nacl.box(
            msgParamsUInt8Array,
            nonce,
            pubKeyUInt8Array,
            ephemeralKeyPair.secretKey
        );

        // handle encrypted data
        const output = {
            version: 'x25519-xsalsa20-poly1305',
            nonce: naclUtil.encodeBase64(nonce),
            ephemPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
            ciphertext: naclUtil.encodeBase64(encryptedMessage)
        };
        return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JSON.stringify(output)));
    };

    async getStore() {
        if (!this._store) {
            console.log('calculated store')
            const address = await this.signer.getAddress();
            // const storeFactory = new ethers.ContractFactory()
            this._store = new ethers.Contract(
                '0x5fbdb2315678afecb367f032d93f642f64180aa3',
                Store.abi,
                this.provider
            ).connect(this.signer);
        } else {
            console.log('used cached store')
        }
        return this._store;
    }

    public async read() {
        await this.provider.send('eth_requestAccounts', []);
        const store = await this.getStore();
        const encrypted: string = await store.get();
        if (encrypted === '0x') {
            return [];
        } else {
            const decrypted = await this.ethereum.request({
                method: 'eth_decrypt',
                params: [encrypted, await this.getAddress()]
            });
            return JSON.parse(decrypted);
        }
    }

    public async write(state) {
        const encrypted = await this.encrypt(JSON.stringify(state))
        const store = await this.getStore();
        await store.set(encrypted)
    }

}