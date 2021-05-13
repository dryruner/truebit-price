const ethers = require('ethers')
const fetch = require('node-fetch');

const INFURA_PROJECT_ID = '3a16610842344b4d97d004d409beb1d8'

const contracts = {
  purchase: {
    address: '0x764C64b2A09b09Acb100B80d8c505Aa6a0302EF2',
    abi: [
      'function getPurchasePrice(uint256 numTRU) public view returns (uint256)',
      'function getRetirePrice(uint256 numTRU) public view returns (uint256)',
      'function reserve() public view returns (uint256)',
      'function opex() public view returns (uint256)',
      'function OPEX_COST() public view returns (uint256)',
      'function THETA() public view returns (uint256)'
    ]
  },
  token: {
    address: '0xf65B5C5104c4faFD4b709d9D60a185eAE063276c',
    abi: [
      'function totalSupply() public view returns (uint256)',
      'function balanceOf(address account) public view returns (uint256)'
    ]
  },
  uniswap: { // weth-tru
    address: '0x80b4d4e9d88D9f78198c56c5A27F3BACB9A685C5',
    abi: [
      'function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
    ],
    v3: {
      p1: { address: '0x86e69d1ae728c9cd229f07bbf34e01bf27258354' },
      p03: { address: '0x2efec2097beede290b2eed63e2faf5ecbbc528fc' },
      abi: [
        'function observe(uint32[] secondsAgos) public view returns (uint256[] tickCumulatives, uint256[] liquidityCumulatives)'
      ]
    }
  },
}

const f = n => new Intl.NumberFormat().format(n)

;

(async () => {
  const resp = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
  const respJson = await resp.json()
  const ethPrice = respJson.ethereum.usd
  
  console.log(`1 ETH = $${f(ethPrice)}`)
  console.log()

  const provider = new ethers.providers.InfuraProvider(null, INFURA_PROJECT_ID)

  contracts.purchase.instance = new ethers.Contract(contracts.purchase.address, contracts.purchase.abi, provider)
  contracts.token.instance = new ethers.Contract(contracts.token.address, contracts.token.abi, provider)
  contracts.uniswap.instance = new ethers.Contract(contracts.uniswap.address, contracts.uniswap.abi, provider)

  contracts.uniswap.v3.p1.instance = new ethers.Contract(contracts.uniswap.v3.p1.address, contracts.uniswap.v3.abi, provider)

  const mintPrice = ethers.utils.formatEther(await contracts.purchase.instance.getPurchasePrice("1000000000000000000"))
  const retirePrice = ethers.utils.formatEther(await contracts.purchase.instance.getRetirePrice("1000000000000000000"))

  console.log(`Truebit OS mint price: ${mintPrice} ETH ($${mintPrice * ethPrice})`)
  console.log(`Truebit OS retire price: ${retirePrice} ETH ($${retirePrice * ethPrice})`)
  console.log()

  const totalSupply = ethers.utils.formatEther(await contracts.token.instance.totalSupply())
  //const totalBurned = await contracts.token.instance.balanceOf("0x0000000000000000000000000000000000000000")
  const reserve = ethers.utils.formatEther(await contracts.purchase.instance.reserve())
  console.log(`Total supply: ${f(totalSupply)} TRU`)
  //console.log(`Total burned: ${totalBurned} TRU`)
  console.log(`Reserve: ${f(reserve)} ETH ($${f(reserve * ethPrice)})`)
  console.log()

  let [poolETH, poolTRU] = await contracts.uniswap.instance.getReserves()
  poolETH = ethers.utils.formatEther(poolETH)
  poolTRU = ethers.utils.formatEther(poolTRU)
  console.log(`Uniswap v2 ETH: ${f(poolETH)} ($${f(poolETH * ethPrice)})`)
  console.log(`Uniswap v2 TRU: ${f(poolTRU)}`)
  console.log(`Uniswap v2: 1 TRU = ${poolETH / poolTRU} ETH ($${poolETH / poolTRU * ethPrice})`)
  console.log()

  //console.log()
  //console.log(await contracts.uniswap.v3.p1.instance.observe([3600, 0]))
  //console.log()

  const opex = await contracts.purchase.instance.opex()
  const opex_cost = await contracts.purchase.instance.OPEX_COST()
  const theta = await contracts.purchase.instance.THETA()

  console.log(`Opex: ${opex}`)
  console.log(`Opex Cost: ${opex_cost}`)
  console.log(`Theta: ${theta}`)

})()

'Latest prices from the Truebit OS purchase smart contract on Ethereum'
