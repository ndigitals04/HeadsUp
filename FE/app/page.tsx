"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { GameInterface } from "@/components/game-interface"
import { StatsPanel } from "@/components/stats-panel"
import { AnimatedBackground } from "@/components/animated-background"
import { CommentsSidebar } from "@/components/comments-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { useAccount, useBalance } from "wagmi"
import { useChainId } from 'wagmi'

export default function GamePage() {
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
      <div className="min-h-screen md:h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground relative md:overflow-hidden transition-colors duration-300 flex flex-col">
        <AnimatedBackground />

        {/* Comments Sidebar */}
        <CommentsSidebar
          isOpen={isCommentsSidebarOpen}
          setIsOpen={setIsCommentsSidebarOpen}
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
        />
        
        <div className="relative z-10 flex flex-col min-h-screen md:h-full">
          {/* Header */}
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

          {/* Main Game Content */}
          <main className="flex-1 container mx-auto px-3 sm:px-2 sm:px-4 py-2 sm:py-1 sm:py-2 md:overflow-hidden">
            <div className="min-h-0 md:h-full flex flex-col">
              {/* Title Section */}
              <div className="text-center mb-3 sm:mb-1 sm:mb-2 md:mb-3 flex-shrink-0">
                <h1 className="text-2xl sm:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-1 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  HEADS UP
                </h1>
                <p className="text-sm sm:text-xs md:text-sm text-muted-foreground mb-2 sm:mb-1">
                  Where Fortune Favors the Bold
                </p>
                <p className="text-sm sm:text-xs text-gold font-semibold">
                  Double Your Crypto • Provably Fair • Multi-Chain
                </p>
              </div>

              {/* Game Content */}
              <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-2 sm:gap-3 md:gap-4 md:min-h-0">
                <div className="flex-1 lg:col-span-2 md:min-h-0 order-1">
                  <GameInterface />
                </div>
                <div className="flex-shrink-0 lg:flex-1 md:min-h-0 order-2 lg:order-2">
                  <StatsPanel />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
