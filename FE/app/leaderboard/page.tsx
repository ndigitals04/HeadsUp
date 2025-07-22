"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Leaderboard } from "@/components/leaderboard"
import { AnimatedBackground } from "@/components/animated-background"
import { CommentsSidebar } from "@/components/comments-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { useAccount, useBalance } from "wagmi"

export default function LeaderboardPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("celo")
  const [chainID, setChainID] = useState<number>()
  const { address } = useAccount()
  const _balance = useBalance({
    address: address,
    chainId: chainID,
    token: undefined,
  }).data?.formatted
  const [balance, setBalance] = useState(String(Number(_balance).toFixed(5)))
  const [walletAddress, setWalletAddress] = useState("")
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="golden-flip-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground relative transition-colors duration-300 flex flex-col">
        <AnimatedBackground />

        <CommentsSidebar
          isOpen={isCommentsSidebarOpen}
          setIsOpen={setIsCommentsSidebarOpen}
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
        />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-shrink-0">
            <Header
              isWalletConnected={isWalletConnected}
              setIsWalletConnected={setIsWalletConnected}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              setChainID={setChainID}
              balance={balance}
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              setIsCommentsSidebarOpen={setIsCommentsSidebarOpen}
            />
          </div>

          <main className="flex-1 container mx-auto px-3 sm:px-4 py-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <Leaderboard />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}