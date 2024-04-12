import { Escrow } from './src/contracts/escrow'
import {
    // bsv,
    // TestWallet,
    // DefaultProvider,
    PubKey,
    toByteString,
    // pubKey2Addr,
    Sig,
    FixedArray,
} from 'scrypt-ts'

import { getDefaultSigner } from './tests/utils/txHelper'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        'No "PRIVATE_KEY" found in .env, Please run "npm run genprivkey" to generate a private key'
    )
}

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
// const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
// const signer = new TestWallet(
//     privateKey,
//     new DefaultProvider({
//         network: bsv.Networks.testnet,
//     })
// )

// async function main() {
//     await Escrow.loadArtifact()

//     // TODO: Adjust the amount of satoshis locked in the smart contract:
//     const amount = 10

//     const arbiter1 = PubKey(
//         '0239a28b08a0c2f90cb18496d08bcc295d70fd928b6fc5474ffb1e9ec0086cdeba'
//     )
//     const arbiter2 = PubKey(
//         '024e439b72e926962b108e690ec64fb976e90dfba968bed9a16227dbfa6f201469'
//     )
//     const arbiter3 = PubKey(
//         '03f75c9504ed23cdf1aa206116bcae7df5a969f9e478933013dc0f3a3c6a66d04e'
//     )

//     const buyerAddr = pubKey2Addr(
//         PubKey(
//             '0265b58951db762e755d6f5b19eacb79dc59bd08c3692c99dfaff707c56fec54b9'
//         )
//     )
//     const sellerAddr = pubKey2Addr(
//         PubKey(
//             '02eec213d43ed5be4f73af118aa5b71cad2451c674dc09375a141bab85cf2b3ab7b9'
//         )
//     )
//     console.log('*************************', sellerAddr)
//     const arbiters = [arbiter1, arbiter2, arbiter3]
//     const instance = new Escrow(buyerAddr, sellerAddr, arbiter1, 1610000n)

//     // Connect to a signer.
//     await instance.connect(signer)

//     // Contract deployment.
//     const deployTx = await instance.deploy(amount)
//     console.log(`Escrow contract deployed: ${deployTx.id}`)
// }

// main()

async function callConfirmPayment(
    buyerSig: Sig,
    buyerPubKey: PubKey,
    arbiterSigs: FixedArray<Sig, typeof Escrow.N_ARBITERS>,
    atOutputIndex = 0
): Promise<string> {
    const signer = getDefaultSigner()
    // await signer.connect()
    const tx = await signer.connectedProvider.getTransaction(
        'd7164ece6a09d1b3f22cc04ceca47004d2120fbb86f7819a08fb58ecca4c74d9'
    )
    await Escrow.compile()
    const instance = Escrow.fromTx(tx, atOutputIndex)

    const nextInstance = instance.next()
    console.log(nextInstance)

    return 'string'
}

const buyerSig = Sig(
    toByteString('cSd6oZgyX1sazUpE69hXuJ2UnPCiudciF19pCEJ7yUspPP3V5YKd')
)
const buyerPubKey = PubKey(
    '0265b58951db762e755d6f5b19eacb79dc59bd08c3692c99dfaff707c56fec54b9'
)
const arbiterSigs: FixedArray<Sig, typeof Escrow.N_ARBITERS> = [
    Sig(
        toByteString(
            'cVnFoodujMwHhuRQiGtDBKhhVua1W4GoTHBZkr1DsgS9DkFLrY58',
            true
        )
    ),
    Sig(
        toByteString(
            'cMcQe6sc4QNZgF4Z3Sfj3zNpdGhADDYMfUCjfPecWM2LXbnA7tLL',
            true
        )
    ),
    Sig(
        toByteString(
            'cTtsYwiYwyeLQhTfsArQh7RComtY9wnYnFcVwQVdktiBhKjjYcPj',
            true
        )
    ),
]

callConfirmPayment(buyerSig, buyerPubKey, arbiterSigs)

// @method(SigHash.ANYONECANPAY_SINGLE)
// public confirmPayment(
//     buyerSig: Sig,
//     buyerPubKey: PubKey,
//     arbiterSigs: FixedArray<Sig, typeof Escrow.N_ARBITERS>
// ) {
//     assert(pubKey2Addr(buyerPubKey) == this.buyerAddr, 'invalid public key for buyer')
//     assert(this.checkSig(buyerSig, buyerPubKey), 'buyer signature check failed')
//     assert(this.checkMultiSig(arbiterSigs, this.arbiters), 'arbiters checkMultiSig failed')

//     const amount = this.ctx.utxo.value
//     const out = Utils.buildPublicKeyHashOutput(this.sellerAddr, amount)
//     assert(hash256(out) == this.ctx.hashOutputs, 'hashOutputs mismatch')

// buyerAddr: Addr, sellerAddr: Addr, arbiter: PubKey, deadline: bigint

//buyer addr-mkkCyhLSZqtRAyanPwCz9Wqt3dNeTKGYoa   PRIVATE_KEY="cSd6oZgyX1sazUpE69hXuJ2UnPCiudciF19pCEJ7yUspPP3V5YKd" pub-0265b58951db762e755d6f5b19eacb79dc59bd08c3692c99dfaff707c56fec54b9
//seller addr-n3VFz3rHKPf7Noy9u7k9Qz3YNP8zuSMgTn pub- 02eec213d43ed5be4f73af118aa5b71cad2451c674dc09375a141bab85cf2b3ab7
//arbiter PUB-[0239a28b08a0c2f90cb18496d08bcc295d70fd928b6fc5474ffb1e9ec0086cdeba, 024e439b72e926962b108e690ec64fb976e90dfba968bed9a16227dbfa6f201469, 03f75c9504ed23cdf1aa206116bcae7df5a969f9e478933013dc0f3a3c6a66d04e]
//        PRIV-[cVnFoodujMwHhuRQiGtDBKhhVua1W4GoTHBZkr1DsgS9DkFLrY58, cMcQe6sc4QNZgF4Z3Sfj3zNpdGhADDYMfUCjfPecWM2LXbnA7tLL, cTtsYwiYwyeLQhTfsArQh7RComtY9wnYnFcVwQVdktiBhKjjYcPj]
