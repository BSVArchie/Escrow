import {
    assert,
    method,
    prop,
    SmartContract,
    Addr,
    FixedArray,
    PubKey,
    fill,
    SigHash,
    Sig,
    pubKey2Addr,
    Utils,
    hash256,
} from 'scrypt-ts'

export class Escrow extends SmartContract {
    static readonly N_ARBITERS = 3

    @prop()
    readonly buyerAddr: Addr

    @prop()
    readonly sellerAddr: Addr

    @prop()
    readonly arbiters: FixedArray<PubKey, typeof Escrow.N_ARBITERS>

    @prop()
    readonly deadline: bigint

    constructor(
        buyerAddr: Addr,
        sellerAddr: Addr,
        arbiter: PubKey,
        deadline: bigint
    ) {
        super(...arguments)
        this.buyerAddr = buyerAddr
        this.sellerAddr = sellerAddr
        this.arbiters = fill(arbiter, Escrow.N_ARBITERS)
        this.deadline = deadline
    }

    @method(SigHash.ANYONECANPAY_SINGLE)
    public confirmPayment(
        buyerSig: Sig,
        buyerPubKey: PubKey,
        arbiterSigs: FixedArray<Sig, typeof Escrow.N_ARBITERS>
    ) {
        assert(
            pubKey2Addr(buyerPubKey) == this.buyerAddr,
            'invalid public key for buyer'
        )
        assert(
            this.checkSig(buyerSig, buyerPubKey),
            'buyer signature check failed'
        )
        assert(
            this.checkMultiSig(arbiterSigs, this.arbiters),
            'arbiters checkMultiSig failed'
        )

        const amount = this.ctx.utxo.value
        const out = Utils.buildPublicKeyHashOutput(this.sellerAddr, amount)
        assert(hash256(out) == this.ctx.hashOutputs, 'hashOutputs mismatch')
    }

    @method()
    public refund(
        buyerSig: Sig,
        buyerPubKey: PubKey,
        arbiterSigs: FixedArray<Sig, typeof Escrow.N_ARBITERS>
    ) {
        assert(
            pubKey2Addr(buyerPubKey) == this.buyerAddr,
            'invalid public key for buyer'
        )
        assert(
            this.checkSig(buyerSig, buyerPubKey),
            'buyer signature check failed'
        )
        assert(
            this.checkMultiSig(arbiterSigs, this.arbiters),
            'arbiters checkMultiSig failed'
        )

        const amount = this.ctx.utxo.value
        const out = Utils.buildPublicKeyHashOutput(this.buyerAddr, amount)
        assert(hash256(out) == this.ctx.hashOutputs, 'hashOutputs mismatch')
    }

    @method()
    public refundDeadline(buyerSig: Sig, buyerPubKey: PubKey) {
        assert(
            pubKey2Addr(buyerPubKey) == this.buyerAddr,
            'invalid public key for buyer'
        )
        assert(
            this.checkSig(buyerSig, buyerPubKey),
            'buyer signature check failed'
        )
        assert(this.timeLock(this.deadline), 'deadline not yet reached')

        const amount = this.ctx.utxo.value
        const out = Utils.buildPublicKeyHashOutput(this.buyerAddr, amount)
        assert(hash256(out) == this.ctx.hashOutputs, 'hashOutputs mismatch')
    }
}
