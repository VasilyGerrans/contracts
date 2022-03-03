const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LPStakingRewardsFactory", function () {

  let admin, staker
  let signers
  let UNISX, LPTest, LPStakingRewardsFactory

  beforeEach(async () => {

    /* Setup roles */
    [admin, staker] = await ethers.provider.listAccounts()
    signers = {
      admin: ethers.provider.getSigner(0),
      staker: ethers.provider.getSigner(1),
    }

    /* Deploy contracts */

    const LPStakingRewardsFactoryContract = await ethers.getContractFactory("LPStakingRewardsFactory")
    const UNISXContract = await ethers.getContractFactory("UNISX")
    const LPTestContract = await ethers.getContractFactory("LPTest")

    UNISX = await UNISXContract.deploy(1000)
    await UNISX.deployed()

    LPTest = await LPTestContract.deploy(1000)
    await LPTest.deployed()

    LPStakingRewardsFactory = await LPStakingRewardsFactoryContract.deploy()
    await LPStakingRewardsFactory.deployed()
  });

  it("Should createLPStakingRewards", async function () {
    await (await LPStakingRewardsFactory.createLPStakingRewards(
      LPTest.address,
      UNISX.address,
      admin,
      1,
      Math.round(new Date().getTime() / 1000),
    )).wait()

    expect(await LPStakingRewardsFactory.stakingRewards(LPTest.address)).to.not.equal(
      '0x0000000000000000000000000000000000000000'
    )
  });

  it("Should transfer ownership to creator", async function () {
    await (await LPStakingRewardsFactory.createLPStakingRewards(
      LPTest.address,
      UNISX.address,
      admin,
      1,
      Math.round(new Date().getTime() / 1000),
    )).wait()

    const stakingRewardsAddress = await LPStakingRewardsFactory.stakingRewards(LPTest.address)
    const LPStakingRewards = await ethers.getContractFactory("LPStakingRewards")
    const stakingRewards = LPStakingRewards.attach(stakingRewardsAddress)
    expect(await stakingRewards.owner()).to.equal(admin)
    await stakingRewards.setRewardRate(0)
  });

  it("Should not be able to createLPStakingRewards if not an owner", async function () {
    expect(LPStakingRewardsFactory.connect(signers.staker).createLPStakingRewards(
      LPTest.address,
      UNISX.address,
      admin,
      1,
      Math.round(new Date().getTime() / 1000),
    )).to.be.revertedWith('Ownable: caller is not the owner');

  });

});
