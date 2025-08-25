"use client"
import contractAbi from "@/lib/localhost-abi.json" // if your ABI is stored here
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers"


import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Coins, Zap, TrendingUp, Sparkles, RotateCcw } from "lucide-react"
import { useAccount, useChainId } from "wagmi"

interface Asset {
  symbol: string
  name: string
  icon: string
  balance: string
  network: string
}

export function GameInterface() {
  const { address } = useAccount()
  const chainId = useChainId()
  
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails" | null>(null)
  const [betAmount, setBetAmount] = useState([0.1])
  const [selectedAsset, setSelectedAsset] = useState("CELO")
  const [isFlipping, setIsFlipping] = useState(false)
  const [gameResult, setGameResult] = useState<{
    result: "heads" | "tails"
    won: boolean
    payout: number
  } | null>(null)

  // Network-specific assets with enhanced data - Only Celo networks
  const assets = useMemo((): Record<number, Asset[]> => ({
    42220: [ // Celo Mainnet
      { symbol: "CELO", name: "Celo", icon: "◊", balance: "890.12", network: "Celo" },
      { symbol: "cUSD", name: "Celo Dollar", icon: "$", balance: "2,345.78", network: "Celo" },
      { symbol: "cEUR", name: "Celo Euro", icon: "€", balance: "1,567.89", network: "Celo" },
    ],
    44787: [ // Celo Alfajores Testnet
      { symbol: "CELO", name: "Celo", icon: "◊", balance: "100.00", network: "Alfajores" },
      { symbol: "cUSD", name: "Celo Dollar", icon: "$", balance: "500.00", network: "Alfajores" },
      { symbol: "cEUR", name: "Celo Euro", icon: "€", balance: "300.00", network: "Alfajores" },
    ],
  }), [])

  const currentAssets = assets[chainId] || assets[42220]
  const currentAsset = currentAssets.find(asset => asset.symbol === selectedAsset) || currentAssets[0]

  // const flipCoin = useCallback(async () => {
  //   if (!selectedSide || !address) return

  //   setIsFlipping(true)
  //   setGameResult(null)

  //   // Simulate network delay
  //   await new Promise(resolve => setTimeout(resolve, 2000))

  //   const result = Math.random() < 0.5 ? "heads" : "tails"
  //   const won = result === selectedSide
  //   const payout = won ? betAmount[0] * 1.95 : 0

  //   setGameResult({ result, won, payout })
  //   setIsFlipping(false)
  // }, [selectedSide, betAmount, address])


const contractAddress = "0xYourContractAddress"

// TODO: put your real deployed addresses here
const ADDR: Record<number, string> = {
  44787: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9", // Alfajores testnet
  42220: "0xYourCeloMainnetAddress" // Celo mainnet
}

function randomUint256(): bigint {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const hex = "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("")
  return BigInt(hex)
}

const flipCoin = useCallback(async () => {
  if (!selectedSide || !address || !window.ethereum) return

  try {
    setIsFlipping(true)
    setGameResult(null)

    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const network = await provider.getNetwork()
    const chainId = Number(network.chainId)

    const contractAddress = ADDR[chainId]
    if (!contractAddress || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      throw new Error(`Contract address not set for chainId ${chainId}. Update ADDR mapping.`)
    }

    const contract = new Contract(contractAddress, contractAbi, signer)

    // Only CELO is supported by the contract right now
    // (UI shows cUSD/cEUR, but the contract only accepts native CELO via msg.value)
    const valueInWei = parseEther(betAmount[0].toString())

    // Optional: enforce min/max bet from contract to avoid reverts
    const [minBet, maxBet] = await contract.getBetLimits()
    if (valueInWei < minBet || valueInWei > maxBet) {
      const min = Number(formatEther(minBet))
      const max = Number(formatEther(maxBet))
      throw new Error(`Bet must be between ${min} and ${max} CELO`)
    }

    const choiceNum = selectedSide === "heads" ? 1 : 0
    const rnd = randomUint256()

    // Call the payable function exactly as defined in the ABI
    const tx = await contract.flipCoin(choiceNum, rnd, { value: valueInWei })
    const receipt = await tx.wait()

    // Parse logs to find GameResult(requestId, player, amount, playerChoice, result, won, payout, randomNumber, timestamp)
    let won = false
    let resultSide: "heads" | "tails" = "tails"
    let payout = 0

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log)
        if (parsed.name === "GameResult") {
          won = Boolean(parsed.args.won)
          const resultNum = Number(parsed.args.result) // 0 or 1
          resultSide = resultNum === 1 ? "heads" : "tails"
          payout = Number(formatEther(parsed.args.payout))
          break
        }
      } catch { /* not our event */ }
    }

    setGameResult({
      result: resultSide,
      won,
      payout: won ? payout : 0,
    })
  } catch (err: any) {
    console.error("Flip failed:", err)
    alert(err?.message ?? String(err))
  } finally {
    setIsFlipping(false)
  }
}, [selectedSide, betAmount, address])




  const adjustBetAmount = useCallback((multiplier: number) => {
    setBetAmount([Math.max(0.01, betAmount[0] * multiplier)])
  }, [betAmount])

  const resetGame = useCallback(() => {
    setGameResult(null)
    setSelectedSide(null)
  }, [])

  return (
    <div className="min-h-0 md:h-full flex flex-col">
      <div className="flex-1 md:overflow-y-auto">
        <div className="space-y-6 md:space-y-4 lg:space-y-3 p-4 md:p-3 lg:p-2">
          {/* Mobile-First Coin Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div 
                className={`w-40 h-40 md:w-32 md:h-32 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl md:text-3xl lg:text-2xl font-bold transition-all duration-500 shadow-lg ${
                  isFlipping ? 'animate-spin' : 'hover:scale-105'
                }`}
                style={{
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                }}
              >
                {isFlipping ? (
                  <Sparkles className="w-12 h-12 md:w-8 md:h-8 lg:w-6 lg:h-6 text-white animate-pulse" />
                ) : gameResult ? (
                  <span className="drop-shadow-lg">
                    {gameResult.result === "heads" ? "👑" : "💰"}
                  </span>
                ) : (
                  <span className="drop-shadow-lg text-white">?</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-pulse" />
            </div>
          </div>

          {/* Mobile-First Game Result */}
          {gameResult && (
            <Card className="bg-card/80 backdrop-blur-sm border-gold/20 mx-auto max-w-sm">
              <CardContent className="p-6 md:p-4 lg:p-3 text-center">
                <div className={`text-2xl md:text-xl lg:text-lg font-bold mb-3 md:mb-2 lg:mb-1 ${
                  gameResult.won ? 'text-green-400' : 'text-red-400'
                }`}>
                  {gameResult.won ? '🎉 WON!' : '💔 LOST'}
                </div>
                <div className="text-lg md:text-base lg:text-sm text-muted-foreground mb-3 md:mb-2 lg:mb-1">
                  Result: <span className="font-semibold text-foreground">{gameResult.result.toUpperCase()}</span>
                </div>
                {gameResult.won && (
                  <div className="text-2xl md:text-xl lg:text-lg font-bold text-green-400 mb-4 md:mb-3 lg:mb-2">
                    +{gameResult.payout.toFixed(4)} {selectedAsset}
                  </div>
                )}
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="lg"
                  className="border-gold/30 hover:bg-gold/10 text-base md:text-sm lg:text-xs h-12 md:h-10 lg:h-8 px-6 md:px-4 lg:px-3"
                >
                  <RotateCcw className="w-5 h-5 md:w-4 md:h-4 lg:w-3 lg:h-3 mr-2" />
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mobile-First Side Selection */}
          <div className="grid grid-cols-2 gap-6 md:gap-4 lg:gap-3 max-w-sm mx-auto">
            <Button
              variant={selectedSide === "heads" ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedSide("heads")}
              className={`h-20 md:h-16 lg:h-14 text-lg md:text-base lg:text-sm font-semibold transition-all duration-300 ${
                selectedSide === "heads" 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700' 
                  : 'border-gold/30 hover:bg-gold/10'
              }`}
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-1">
                <span className="text-3xl md:text-2xl lg:text-lg">👑</span>
                <span className="text-base md:text-sm lg:text-xs font-bold">HEADS</span>
              </div>
            </Button>
            
            <Button
              variant={selectedSide === "tails" ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedSide("tails")}
              className={`h-20 md:h-16 lg:h-14 text-lg md:text-base lg:text-sm font-semibold transition-all duration-300 ${
                selectedSide === "tails" 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700' 
                  : 'border-gold/30 hover:bg-gold/10'
              }`}
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-1">
                <span className="text-3xl md:text-2xl lg:text-lg">💰</span>
                <span className="text-base md:text-sm lg:text-xs font-bold">TAILS</span>
              </div>
            </Button>
          </div>

          {/* Mobile-First Asset Selection */}
          <Card className="bg-card/80 backdrop-blur-sm border-gold/20 max-w-sm mx-auto">
            <CardContent className="p-6 md:p-4 lg:p-3">
              <div className="space-y-5 md:space-y-4 lg:space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base md:text-sm lg:text-xs font-medium text-cyan-400">Asset</label>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-base md:text-sm lg:text-xs px-3 py-1">
                    {currentAsset?.network}
                  </Badge>
                </div>
                
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="border-gold/30 bg-background/50 h-12 md:h-10 lg:h-8 text-lg md:text-base lg:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-sm border-gold/20">
                    {currentAssets.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol} className="hover:bg-cyan-500/10 py-4 md:py-3 lg:py-2">
                        <div className="flex items-center space-x-4 md:space-x-3 lg:space-x-2">
                          <span className="text-lg md:text-base lg:text-sm">{asset.icon}</span>
                          <div>
                            <div className="font-medium text-lg md:text-base lg:text-sm">{asset.symbol}</div>
                            <div className="text-base md:text-sm lg:text-xs text-muted-foreground">
                              Balance: {asset.balance}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-First Bet Controls */}
          <Card className="bg-card/80 backdrop-blur-sm border-gold/20 max-w-sm mx-auto">
            <CardContent className="p-6 md:p-4 lg:p-3">
              <div className="space-y-5 md:space-y-4 lg:space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base md:text-sm lg:text-xs font-medium text-cyan-400">Bet Amount</label>
                  <div className="text-lg md:text-base lg:text-sm font-bold text-gold">
                    {betAmount[0].toFixed(4)} {selectedAsset}
                  </div>
                </div>
                
                <Slider
                  value={betAmount}
                  onValueChange={setBetAmount}
                  max={10}
                  min={0.01}
                  step={0.01}
                  className="w-full"
                />
                
                <div className="grid grid-cols-4 gap-3 md:gap-2 lg:gap-1">
                  {[0.5, 2, 5, 10].map((multiplier) => (
                    <Button
                      key={multiplier}
                      variant="outline"
                      size="default"
                      onClick={() => adjustBetAmount(multiplier)}
                      className="border-gold/30 hover:bg-cyan-500/10 text-base md:text-sm lg:text-xs h-10 md:h-8 lg:h-6 px-3 md:px-2"
                    >
                      {multiplier < 1 ? `÷${1/multiplier}` : `×${multiplier}`}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-First Potential Payout */}
          {selectedSide && !gameResult && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-4 md:space-x-3 lg:space-x-2 text-lg md:text-base lg:text-sm bg-card/50 rounded-lg px-6 md:px-4 lg:px-3 py-3 md:py-2 lg:py-1 border border-gold/20">
                <TrendingUp className="w-5 h-5 md:w-4 md:h-4 lg:w-3 lg:h-3 text-green-400" />
                <span className="text-muted-foreground">Potential:</span>
                <span className="font-bold text-green-400">
                  {(betAmount[0] * 1.95).toFixed(4)} {selectedAsset}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-First Flip Button - Sticky on mobile */}
      <div className="flex-shrink-0 p-6 md:p-4 lg:p-3 border-t border-gold/20 bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none sticky bottom-0 md:static">
        <Button
          onClick={flipCoin}
          disabled={!selectedSide || !address || isFlipping}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 py-6 md:py-4 lg:py-3 text-2xl md:text-xl lg:text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg h-16 md:h-14 lg:h-12"
        >
          {isFlipping ? (
            <div className="flex items-center space-x-4 md:space-x-3 lg:space-x-2">
              <Zap className="w-8 h-8 md:w-6 md:h-6 lg:w-5 lg:h-5 animate-spin" />
              <span>FLIPPING...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4 md:space-x-3 lg:space-x-2">
              <Coins className="w-8 h-8 md:w-6 md:h-6 lg:w-5 lg:h-5" />
              <span>FLIP COIN</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
