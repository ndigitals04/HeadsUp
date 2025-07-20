"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, ThumbsUp, Reply, Clock, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Comment {
  id: number
  address: string
  message: string
  timestamp: string
  likes: number
  replies: any[]
  isLiked: boolean
}

interface CommentsSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isWalletConnected: boolean
  walletAddress: string
}

export function CommentsSidebar({ isOpen, setIsOpen, isWalletConnected, walletAddress }: CommentsSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      address: "0x1234...5678",
      message: "Just won 5 ETH! This platform is absolutely amazing. The fairness is real and payouts are instant! 🚀",
      timestamp: "2024-01-15 14:30:25",
      likes: 12,
      replies: [
        {
          id: 1,
          address: "0x8765...4321",
          message: "Congrats! What was your strategy?",
          timestamp: "2024-01-15 14:32:10",
          likes: 3,
          isLiked: false,
        },
      ],
      isLiked: false,
    },
    {
      id: 2,
      address: "0x9876...1234",
      message: "Love the new black and gold theme! Much more elegant and professional looking.",
      timestamp: "2024-01-15 14:25:45",
      likes: 8,
      replies: [],
      isLiked: true,
    },
    {
      id: 3,
      address: "0x4567...8901",
      message: "Multi-chain support is fantastic. Switched from Ethereum to Polygon for lower fees. Works perfectly!",
      timestamp: "2024-01-15 14:20:33",
      likes: 15,
      replies: [
        {
          id: 2,
          address: "0x2345...6789",
          message: "Same here! Polygon fees are so much better for smaller bets.",
          timestamp: "2024-01-15 14:22:18",
          likes: 5,
          isLiked: true,
        },
        {
          id: 3,
          address: "0x6789...0123",
          message: "Try Arbitrum too, even faster!",
          timestamp: "2024-01-15 14:24:05",
          likes: 2,
          isLiked: false,
        },
      ],
      isLiked: false,
    },
    {
      id: 4,
      address: "0x3456...7890",
      message: "The theme switcher is a great addition! Love being able to switch between dark and light modes. 🌓",
      timestamp: "2024-01-15 14:15:22",
      likes: 20,
      replies: [],
      isLiked: false,
    },
    {
      id: 5,
      address: "0x7890...2345",
      message: "Question: Are there any plans to add more tokens? Would love to see LINK and AAVE support.",
      timestamp: "2024-01-15 14:10:55",
      likes: 6,
      replies: [
        {
          id: 4,
          address: "0x5678...9012",
          message: "Great suggestion! More DeFi tokens would be awesome.",
          timestamp: "2024-01-15 14:12:30",
          likes: 4,
          isLiked: false,
        },
      ],
      isLiked: false,
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")

  const addComment = () => {
    if (!newComment.trim() || !isWalletConnected) return

    const comment: Comment = {
      id: Date.now(),
      address: walletAddress,
      message: newComment,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      replies: [],
      isLiked: false,
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const addReply = (commentId: number) => {
    if (!replyText.trim() || !isWalletConnected) return

    const reply = {
      id: Date.now(),
      address: walletAddress,
      message: replyText,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      isLiked: false,
    }

    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    )

    setReplyText("")
    setReplyingTo(null)
  }

  const toggleLike = (commentId: number, replyId?: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          if (replyId) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === replyId
                  ? { ...reply, likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1, isLiked: !reply.isLiked }
                  : reply,
              ),
            }
          } else {
            return {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked,
            }
          }
        }
        return comment
      }),
    )
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-card/95 backdrop-blur-sm border-r border-gold z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold text-gold">Community Chat</h2>
            <Badge variant="outline" className="border-green-500/30 text-green-500 text-xs">
              {comments.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Add Comment */}
          <div className="p-4 border-b border-gold/10">
            <div className="space-y-3">
              <Textarea
                placeholder={isWalletConnected ? "Share your thoughts..." : "Connect your wallet to comment"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isWalletConnected}
                className="bg-muted/50 border-gold text-foreground placeholder-muted-foreground resize-none text-sm"
                rows={3}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {isWalletConnected ? `As ${formatAddress(walletAddress)}` : "Connect wallet"}
                </span>
                <Button
                  onClick={addComment}
                  disabled={!newComment.trim() || !isWalletConnected}
                  size="sm"
                  className="bg-gold-gradient hover:opacity-90 text-white font-semibold"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted/30 rounded-lg p-3 space-y-3 border border-gold/10">
                {/* Comment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gold-gradient rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {comment.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-mono text-gold text-xs">{formatAddress(comment.address)}</span>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-2 h-2" />
                        <span>{getTimeAgo(comment.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-foreground text-sm leading-relaxed">{comment.message}</p>

                {/* Comment Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center space-x-1 text-xs transition-colors ${
                      comment.isLiked ? "text-green-500" : "text-muted-foreground hover:text-green-500"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.likes}</span>
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && isWalletConnected && (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-muted/50 border-gold text-foreground text-xs"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText("")
                        }}
                        className="text-muted-foreground hover:text-foreground text-xs h-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => addReply(comment.id)}
                        disabled={!replyText.trim()}
                        size="sm"
                        className="bg-gold-gradient hover:opacity-90 text-white text-xs h-6"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-4 space-y-2 border-l-2 border-gold/20 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/30 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gold-gradient rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {reply.address.slice(2, 4).toUpperCase()}
                            </div>
                            <span className="font-mono text-gold text-xs">{formatAddress(reply.address)}</span>
                            <span className="text-xs text-muted-foreground">{getTimeAgo(reply.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-foreground text-xs mb-1">{reply.message}</p>
                        <button
                          onClick={() => toggleLike(comment.id, reply.id)}
                          className={`flex items-center space-x-1 text-xs transition-colors ${
                            reply.isLiked ? "text-green-500" : "text-muted-foreground hover:text-green-500"
                          }`}
                        >
                          <ThumbsUp className="w-2 h-2" />
                          <span>{reply.likes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
