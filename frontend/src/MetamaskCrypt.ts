import { Contract, ethers } from 'ethers';
import Store from '../../contract/artifacts/contracts/Store.sol/Store.json';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util'

export default class MetamaskCrypt {
    private ethereum;
    private _store: Contract;
    constructor(ethereum) {
        this.ethereum = ethereum;
    }

    get provider() {
        return new ethers.providers.Web3Provider(this.ethereum, 'any');
    }

    get signer() {
        return this.provider.getSigner();
    }

    get address() {
        return (async () => await this.signer.getAddress())();
    }

    get store() {
        if (!this._store) {
            console.log('calculated store')
            return (async () => {
                const address = await this.signer.getAddress();
                // const storeFactory = new ethers.ContractFactory()
                this._store = new ethers.Contract(
                    '0x5fbdb2315678afecb367f032d93f642f64180aa3',
                    Store.abi,
                    this.provider
                ).connect(this.signer);
                return this._store;
            })();
        } else {
            console.log('used cached store')
            return this._store;
        }
    }

    public async read() {
        await this.provider.send('eth_requestAccounts', []);
        const store = await this.store
        const encrypted: string = await store.get();
        if (encrypted === '0x') {
            return [];
        } else {
            const decrypted = await this.ethereum.request({
                method: 'eth_decrypt',
                params: [encrypted, await this.address]
            });
            return JSON.parse(decrypted);
        }
    }

}