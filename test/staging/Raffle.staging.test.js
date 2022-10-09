const { expect, assert } = require("chai")
const { network, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Test", () => {
          let raffle, raffleEntranceFee, deployer
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live chainlink keepers and chainlimk VRF, we get a random winner", async function () {
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()

                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Winner Picked, event fired")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              //   console.log("Time stamp test ", endingTimeStamp > startingTimeStamp)
                              //   const numOfPlayers = await raffle.getNumberOfPlayers()
                              //   console.log(`Number of Players : ${numOfPlayers.toString()}`)
                              //   console.log(`State of the raffle:s ${raffleState.toString()}`)
                              //   console.log(
                              //       `start balance:${winnerStartingBalance.toString()} \nEnding Balance:${winnerStartingBalance
                              //           .add(raffleEntranceFee)
                              //           .toString()}`
                              //   )
                              //   console.log(`Recent Winner: ${recentWinner.toString()}`)

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState.toString(), "0")
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                          console.log("calling resolve")
                      })

                      //then entering raffle
                      console.log("Entering The raffle")
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      const winnerStartingBalance = await accounts[0].getBalance()

                      //and this won't finish untill our listener has finished
                  })
              })
          })
      })
