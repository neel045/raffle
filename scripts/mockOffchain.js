const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const raffle = await ethers.getContract("Raffle")
    const checkdata = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(checkdata)

    // console.log(upkeepNeeded)

    if (upkeepNeeded) {
        const tx = await raffle.performUpkeep(checkdata)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        // console.log(requestId)

        if (network.config.chainId === 31337) {
            await mockvrf(requestId, raffle)
        }
    }
}

async function mockvrf(requestId, raffle) {
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.address)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit("1")
    })
