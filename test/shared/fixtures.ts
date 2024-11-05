import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeAiAmmPool } from '../../typechain/MockTimeAiAmmPool'
import { TestERC20 } from '../../typechain/TestERC20'
import { AiAmmFactory } from '../../typechain/AiAmmFactory'
import { TestAiAmmCallee } from '../../typechain/TestAiAmmCallee'
import { TestAiAmmRouter } from '../../typechain/TestAiAmmRouter'
import { MockTimeAiAmmPoolDeployer } from '../../typechain/MockTimeAiAmmPoolDeployer'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: AiAmmFactory
}

async function factoryFixture(): Promise<FactoryFixture> {
  const factoryFactory = await ethers.getContractFactory('AiAmmFactory')
  const factory = (await factoryFactory.deploy()) as AiAmmFactory
  return { factory }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestAiAmmCallee
  swapTargetRouter: TestAiAmmRouter
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeAiAmmPool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeAiAmmPoolDeployerFactory = await ethers.getContractFactory('MockTimeAiAmmPoolDeployer')
  const MockTimeAiAmmPoolFactory = await ethers.getContractFactory('MockTimeAiAmmPool')

  const calleeContractFactory = await ethers.getContractFactory('TestAiAmmCallee')
  const routerContractFactory = await ethers.getContractFactory('TestAiAmmRouter')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestAiAmmCallee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestAiAmmRouter

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer = (await MockTimeAiAmmPoolDeployerFactory.deploy()) as MockTimeAiAmmPoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string
      return MockTimeAiAmmPoolFactory.attach(poolAddress) as MockTimeAiAmmPool
    },
  }
}
