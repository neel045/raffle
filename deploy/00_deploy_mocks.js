const { network, ethers } = require("hardhat")
const { developmentChains } = require("./../helper-hardhat-config")

/*it is a fee for requesting random number from the VRF, we don't pay for some other sevices like getting value of Ethereum is USD because some componies are funding it
 */
const BASE_FEE = ethers.utils.parseEther("0.25")
/*link per gas uint calculated value based on the gas price of the chain. if price of ethers go way to high like million dollors so the chainlink will manage the price of gas per unit so no one will get bankrrupt
 */
const GAS_PRICE_LINK = 1e9
const args = [BASE_FEE, GAS_PRICE_LINK]

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("local network detected...Deploying Mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks Deployed........")
        log("_________________________________________")
    }
}

module.exports.tags = ["all", "mocks"]
