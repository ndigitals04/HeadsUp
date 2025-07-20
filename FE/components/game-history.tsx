"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"

export function GameHistory() {
  const gameHistory = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:25",
      bet: "0.5 ETH",
      side: "heads",
      result: "heads",
      outcome: "WIN",
      payout: "0.975 ETH",
      profit: "+0.475 ETH",
    },
    {
      id: 2,
      timestamp: "2024-01-15 14:28:12",
      bet: "1.2 USDC",
      side: "tails",
      result: "heads",
      outcome: "LOSE",
      payout: "0",
      profit: "-1.2 USDC",
    },
    {
      id: 3,
      timestamp: "2024-01-15 14:25:45",
      bet: "0.1 ETH",
      side: "heads",
      result: "heads",
      outcome: "WIN",
      payout: "0.195 ETH",
      profit: "+0.095 ETH",
    },
    {
      id: 4,
      timestamp: "2024-01-15 14:23:18",
      bet: "2.0 USDT",
      side: "tails",
      result: "heads",
      outcome: "LOSE",
      payout: "0",
      profit: "-2.0 USDT",
    },
    {
      id: 5,
      timestamp: "2024-01-15 14:20:33",
      bet: "0.8 ETH",
      side: "tails",
      result: "tails",
      outcome: "WIN",
      payout: "1.56 ETH",
      profit: "+0.76 ETH",
    },
    {
      id: 6,
      timestamp: "2024-01-15 14:18:07",
      bet: "0.3 ETH",
      side: "heads",
      result: "tails",
      outcome: "LOSE",
      payout: "0",
      profit: "-0.3 ETH",
    },
    {
      id: 7,
      timestamp: "2024-01-15 14:15:22",
      bet: "1.5 USDC",
      side: "tails",
      result: "tails",
      outcome: "WIN",
      payout: "2.925 USDC",
      profit: "+1.425 USDC",
    },
    {
      id: 8,
      timestamp: "2024-01-15 14:12:55",
      bet: "0.2 ETH",
      side: "heads",
      result: "heads",
      outcome: "WIN",
      payout: "0.39 ETH",
      profit: "+0.19 ETH",
    },
  ]

  const totalProfit = gameHistory.reduce((sum, game) => {
    const profit = Number.parseFloat(game.profit.replace(/[^\d.-]/g, ""))
    return sum + (game.profit.includes("ETH") ? profit : profit * 0.0004) // Rough ETH conversion
  }, 0)

  const winRate = ((gameHistory.filter((game) => game.outcome === "WIN").length / gameHistory.length) * 100).toFixed(1)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              {totalProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toFixed(3)} ETH
            </h3>
            <p className="text-gray-400">Total P&L</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-2xl font-bold text-cyan-400 mb-1">{winRate}%</h3>
            <p className="text-gray-400">Win Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-1">{gameHistory.length}</h3>
            <p className="text-gray-400">Games Played</p>
          </CardContent>
        </Card>
      </div>

      {/* Game History Table */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Game History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Bet</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Side</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Result</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Outcome</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((game) => (
                  <tr key={game.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-2 text-gray-300 text-sm font-mono">{game.timestamp.split(" ")[1]}</td>
                    <td className="py-3 px-2 text-white font-medium">{game.bet}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                        {game.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="border-gray-500/30 text-gray-300">
                        {game.result.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant="outline"
                        className={
                          game.outcome === "WIN"
                            ? "border-green-500/30 text-green-400"
                            : "border-red-500/30 text-red-400"
                        }
                      >
                        {game.outcome}
                      </Badge>
                    </td>
                    <td
                      className={`py-3 px-2 text-right font-bold ${
                        game.profit.startsWith("+") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {game.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
