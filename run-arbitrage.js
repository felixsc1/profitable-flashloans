require('dotenv').config()
const abis = require('./abis')
const { mainnet: addresses } = require('./addresses')

const Web3 = require('web3')
const web3 = new Web3(
    new Web3(process.env.INFURA_URL)
)

const kyber = new web3.eth.Contract(
    abis.kyber.kyberNetworkProxy,
    addresses.kyber.kyberNetworkProxy
)

const AMOUNT_ETH = 100
const RECENT_ETH_PRICE = 3138 // todo: dynamically update this value
const AMOUNT_ETH_WEI = web3.utils.toWei(AMOUNT_ETH.toString())
const AMOUNT_DAI_WEI = web3.utils.toWei((AMOUNT_ETH * RECENT_ETH_PRICE).toString())

// only information we want: Whether there is a new block. thus we only subscribe to the headers.
web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
        console.log(`New block received. Block # ${block.number}`)

        // 0xeee.. is how kyber expresses ETH
        const kyberResults = await Promise.all([
            kyber
                .methods
                .getExpectedRate(
                    addresses.tokens.dai,
                    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    AMOUNT_DAI_WEI
                )
                .call(),
            kyber
                .methods
                .getExpectedRate(
                    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    addresses.tokens.dai,
                    AMOUNT_ETH_WEI
                )
                .call()
        ])
        console.log(kyberResults)
    })
    .on('error', error => {
        console.log(error)
    })