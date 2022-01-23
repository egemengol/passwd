import { Contract, ethers } from 'ethers';
import Store from '../../static/Store.json';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util'

export class MetamaskCrypt {
    private ethereum: ethers.providers.ExternalProvider;
    private _store: Contract;
    private _encryptionPublicKey: string;
    constructor(ethereum: ethers.providers.ExternalProvider) {
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

    async getEncryptionPublicKey(): Promise<string> {
        if (!this._encryptionPublicKey) {
            this._encryptionPublicKey = await this.ethereum.request({
                method: 'eth_getEncryptionPublicKey',
                params: [await this.getAddress()] // you must have access to the specified account
            });
        }
        return this._encryptionPublicKey;
    }

    async encrypt(data): Promise<string> {
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

    async getStore(): Promise<Contract> {
        if (!this._store) {
            const address = await this.signer.getAddress();
            // const storeFactory = new ethers.ContractFactory()
            this._store = new ethers.Contract(
                '0xd3bC207ffA860B389D2EC35075605147c2A98670',
                Store.abi,
                this.provider
            ).connect(this.signer);
        } else {
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