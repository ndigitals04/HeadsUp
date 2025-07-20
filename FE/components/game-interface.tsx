"use client"

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
  const [selectedAsset, setSelectedAsset] = useState("ETH")
  const [isFlipping, setIsFlipping] = useState(false)
  const [gameResult, setGameResult] = useState<{
    result: "heads" | "tails"
    won: boolean
    payout: number
  } | null>(null)

  // Network-specific assets with enhanced data
  const assets = useMemo((): Record<number, Asset[]> => ({
    1135: [ // Lisk
      { symbol: "LSK", name: "Lisk", icon: "⟠", balance: "1,234.56", network: "Lisk" },
      { symbol: "ETH", name: "Ethereum", icon: "⟠", balance: "5.67", network: "Lisk" },
    ],
    42220: [ // Celo
      { symbol: "CELO", name: "Celo", icon: "◊", balance: "890.12", network: "Celo" },
      { symbol: "cUSD", name: "Celo Dollar", icon: "$", balance: "2,345.78", network: "Celo" },
    ],
  }), [])

  const currentAssets = assets[chainId] || assets[1135]
  const currentAsset = currentAssets.find(asset => asset.symbol === selectedAsset) || currentAssets[0]

  const flipCoin = useCallback(async () => {
    if (!selectedSide || !address) return

    setIsFlipping(true)
    setGameResult(null)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const result = Math.random() < 0.5 ? "heads" : "tails"
    const won = result === selectedSide
    const payout = won ? betAmount[0] * 1.95 : 0

    setGameResult({ result, won, payout })
    setIsFlipping(false)
  }, [selectedSide, betAmount, address])

  const adjustBetAmount = useCallback((multiplier: number) => {
    setBetAmount([Math.max(0.01, betAmount[0] * multiplier)])
  }, [betAmount])

  const resetGame = useCallback(() => {
    setGameResult(null)
    setSelectedSide(null)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 md:space-y-4 p-2">
          {/* Compact Coin Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div 
                className={`w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold transition-all duration-500 shadow-lg ${
                  isFlipping ? 'animate-spin' : 'hover:scale-105'
                }`}
                style={{
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                }}
              >
                {isFlipping ? (
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 text-white animate-pulse" />
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

          {/* Compact Game Result */}
          {gameResult && (
            <Card className="bg-card/80 backdrop-blur-sm border-gold/20 mx-auto max-w-sm">
              <CardContent className="p-3 text-center">
                <div className={`text-lg font-bold mb-1 ${
                  gameResult.won ? 'text-green-400' : 'text-red-400'
                }`}>
                  {gameResult.won ? '🎉 WON!' : '💔 LOST'}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Result: <span className="font-semibold text-foreground">{gameResult.result.toUpperCase()}</span>
                </div>
                {gameResult.won && (
                  <div className="text-lg font-bold text-green-400 mb-2">
                    +{gameResult.payout.toFixed(4)} {selectedAsset}
                  </div>
                )}
                <Button
                  onClick={resetGame}
                  variant="outline"
                  size="sm"
                  className="border-gold/30 hover:bg-gold/10 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Compact Side Selection */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <Button
              variant={selectedSide === "heads" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSide("heads")}
              className={`h-12 md:h-14 text-sm font-semibold transition-all duration-300 ${
                selectedSide === "heads" 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700' 
                  : 'border-gold/30 hover:bg-gold/10'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg">👑</span>
                <span className="text-xs">HEADS</span>
              </div>
            </Button>
            
            <Button
              variant={selectedSide === "tails" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSide("tails")}
              className={`h-12 md:h-14 text-sm font-semibold transition-all duration-300 ${
                selectedSide === "tails" 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700' 
                  : 'border-gold/30 hover:bg-gold/10'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg">💰</span>
                <span className="text-xs">TAILS</span>
              </div>
            </Button>
          </div>

          {/* Compact Asset Selection */}
          <Card className="bg-card/80 backdrop-blur-sm border-gold/20 max-w-sm mx-auto">
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-cyan-400">Asset</label>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    {currentAsset?.network}
                  </Badge>
                </div>
                
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="border-gold/30 bg-background/50 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-sm border-gold/20">
                    {currentAssets.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol} className="hover:bg-cyan-500/10">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{asset.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{asset.symbol}</div>
                            <div className="text-xs text-muted-foreground">
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

          {/* Compact Bet Controls */}
          <Card className="bg-card/80 backdrop-blur-sm border-gold/20 max-w-sm mx-auto">
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-cyan-400">Bet Amount</label>
                  <div className="text-sm font-bold text-gold">
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
                
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 2, 5, 10].map((multiplier) => (
                    <Button
                      key={multiplier}
                      variant="outline"
                      size="sm"
                      onClick={() => adjustBetAmount(multiplier)}
                      className="border-gold/30 hover:bg-cyan-500/10 text-xs h-6"
                    >
                      {multiplier < 1 ? `÷${1/multiplier}` : `×${multiplier}`}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Potential Payout - Inline */}
          {selectedSide && !gameResult && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-sm bg-card/50 rounded-lg px-3 py-1 border border-gold/20">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-muted-foreground">Potential:</span>
                <span className="font-bold text-green-400">
                  {(betAmount[0] * 1.95).toFixed(4)} {selectedAsset}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Flip Button at Bottom */}
      <div className="flex-shrink-0 p-3 border-t border-gold/20">
        <Button
          onClick={flipCoin}
          disabled={!selectedSide || !address || isFlipping}
          size="lg"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
        >
          {isFlipping ? (
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 animate-spin" />
              <span>FLIPPING...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5" />
              <span>FLIP COIN</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
