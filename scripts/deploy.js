const { ethers } = require("hardhat");
const fs = require("fs");
const { yellow, cyan } = require("colors");
const { deployPDAYL, deployPresale, deployBUSD, verifyContract } = require("./utils")
const { config } = require("./config")
const depositors = require("../migration/depositor.json")

async function main() {
    const [owner] = await ethers.getSigners();
    console.log("\nDeploying Contracts\n".yellow);

    // Only once for testing, no need to deploy again
    const busd = await deployBUSD(owner)
    console.log("\nPresale BUSD Token deployed at: \n".yellow, busd.address);
    await verifyContract(busd.address, [])

    const pDAYL = await deployPDAYL(owner)
    console.log("\nPresale DAYL Token deployed at: \n".yellow, pDAYL.address);
    await verifyContract(pDAYL.address, [])

    const timeNow = (await ethers.provider.getBlock('latest')).timestamp
    console.log("\n Start Time :", new Date(timeNow * 1000), timeNow)

    const presaleParams = [
        timeNow, //_startTime,
        timeNow + 60 * 60 * 2, // _endTime,   + 2 hours
        timeNow + 60 * 60 * 3, // _claimTime, + 3 hours
        // "0xd54D4Dff8681f57701503d72456D22f496A433df", // _presaleDAYL,
        pDAYL.address, // _presaleDAYL,
        busd.address, // _busd,
        ethers.utils.parseUnits("40", 0), // _rate,
        ethers.utils.parseUnits("10000", 18), // _softCap - 20,000,
        ethers.utils.parseUnits("60000", 18), // _hardCap,
        ethers.utils.parseUnits("5000", 18), // _maxPerWallet,
        ethers.utils.parseUnits("100", 18), // _minPerWallet,
        "0x3825fF09816BCE5BcacF2AAdEcF55c83A0805Ead", // _treasury
        "0x7788601AeB71f11Df8C603c76A94571d1343D06d", // _vault
    ]

    // const presaleParams = [
    //     config.startTime, //_startTime,
    //     config.endTime, // _endTime,
    //     config.claimTime, // _claimTime,
    //     // "0xd54D4Dff8681f57701503d72456D22f496A433df", // _presaleDAYL,
    //     pDAYL.address, // _presaleDAYL,
    //     config.busd, // _busd,
    //     config.rate, // _rate,
    //     ethers.utils.parseUnits(config.softCap, 18), // _softCap - 20,000,
    //     ethers.utils.parseUnits(config.hardCap, 18), // _hardCap,
    //     ethers.utils.parseUnits(config.maxPerWallet, 18), // _maxPerWallet,
    //     ethers.utils.parseUnits(config.minPerWallet, 18), // _minPerWallet,
    //     config.treasury, // _treasury
    //     config.vault, // _vault
    // ]

    const presale = await deployPresale(owner, presaleParams)
    console.log("\nPresale deployed at: \n".yellow, presale.address);
    await verifyContract(presale.address, [presaleParams])

    // Set presale
    await pDAYL.setPresale(presale.address)
    console.log("\nPresale token set presale contract")

    // Migrate
    // const accounts = depositors.map(d => d.address)
    // const deposits = depositors.map(d => ethers.utils.parseUnits(d.amount.toString(), 12))
    // await presale.migrateUserDetail(accounts, deposits)
    // console.log("\nPresale set migration")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });