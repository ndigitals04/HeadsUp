"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"

export function Leaderboard() {
  const topWinners = [
    {
      rank: 1,
      address: "0x1234...5678",
      totalWon: "45.67 ETH",
      gamesWon: 234,
      winRate: "67.8%",
      biggestWin: "12.5 ETH",
    },
    {
      rank: 2,
      address: "0x8765...4321",
      totalWon: "38.92 ETH",
      gamesWon: 189,
      winRate: "62.1%",
      biggestWin: "8.9 ETH",
    },
    {
      rank: 3,
      address: "0x9876...1234",
      totalWon: "31.45 ETH",
      gamesWon: 156,
      winRate: "58.9%",
      biggestWin: "7.2 ETH",
    },
    {
      rank: 4,
      address: "0x4567...8901",
      totalWon: "28.73 ETH",
      gamesWon: 143,
      winRate: "55.4%",
      biggestWin: "6.8 ETH",
    },
    {
      rank: 5,
      address: "0x2345...6789",
      totalWon: "25.18 ETH",
      gamesWon: 128,
      winRate: "53.2%",
      biggestWin: "5.9 ETH",
    },
    {
      rank: 6,
      address: "0x6789...0123",
      totalWon: "22.94 ETH",
      gamesWon: 117,
      winRate: "51.8%",
      biggestWin: "5.4 ETH",
    },
    {
      rank: 7,
      address: "0x3456...7890",
      totalWon: "20.67 ETH",
      gamesWon: 105,
      winRate: "49.7%",
      biggestWin: "4.8 ETH",
    },
    { rank: 8, address: "0x7890...2345", totalWon: "18.42 ETH", gamesWon: 94, winRate: "47.9%", biggestWin: "4.2 ETH" },
  ]

  const biggestWins = [
    { address: "0x1234...5678", amount: "12.5 ETH", timestamp: "2024-01-15 14:30:25" },
    { address: "0x8765...4321", amount: "8.9 ETH", timestamp: "2024-01-15 13:45:12" },
    { address: "0x9876...1234", amount: "7.2 ETH", timestamp: "2024-01-15 12:20:33" },
    { address: "0x4567...8901", amount: "6.8 ETH", timestamp: "2024-01-15 11:15:47" },
    { address: "0x2345...6789", amount: "5.9 ETH", timestamp: "2024-01-15 10:30:18" },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">{rank}</span>
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Winners */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Top Winners - All Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Rank</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Player</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Total Won</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Games Won</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Win Rate</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Biggest Win</th>
                </tr>
              </thead>
              <tbody>
                {topWinners.map((player) => (
                  <tr key={player.rank} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">{getRankIcon(player.rank)}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-white">{player.address}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-green-400">{player.totalWon}</td>
                    <td className="py-3 px-2 text-right text-white">{player.gamesWon}</td>
                    <td className="py-3 px-2 text-right">
                      <Badge
                        variant="outline"
                        className={`${
                          Number.parseFloat(player.winRate) > 60
                            ? "border-green-500/30 text-green-400"
                            : Number.parseFloat(player.winRate) > 50
                              ? "border-yellow-500/30 text-yellow-400"
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {player.winRate}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-cyan-400">{player.biggestWin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hall of Fame - Biggest Wins */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Hall of Fame - Biggest Single Wins</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {biggestWins.map((win, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-slate-900 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-mono text-white">{win.address}</div>
                    <div className="text-sm text-gray-400">{win.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{win.amount}</div>
                  <div className="text-sm text-gray-400">Single Win</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-1">45,123</h3>
            <p className="text-gray-400">Total Games</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-2xl font-bold text-cyan-400 mb-1">1,234.5 ETH</h3>
            <p className="text-gray-400">Total Volume</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-2xl font-bold text-green-400 mb-1">2,847</h3>
            <p className="text-gray-400">Active Players</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-1">567.8 ETH</h3>
            <p className="text-gray-400">Total Payouts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
