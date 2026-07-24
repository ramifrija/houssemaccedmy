import { useState, useEffect } from 'react'
import { voteOnPoll, fetchPollVotes } from '@/lib/messaging-api'
import { useAuth } from '@/components/auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PollMessageProps {
  messageId: string
  senderName: string
  sentAt: string
  isOwn: boolean
  metadata: any
}

interface PollOption {
  text: string
  votes: number
}

export function PollMessage({ messageId, senderName, sentAt, isOwn, metadata }: PollMessageProps) {
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  const question = metadata?.question || 'Sondage'
  const options = metadata?.options || []

  const [pollStats, setPollStats] = useState<Record<number, { voteCount: number; voters: { id: string; name: string }[] }>>({})
  const [hasVoted, setHasVoted] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const loadVotes = async () => {
    try {
      const votes = await fetchPollVotes(messageId)
      const stats: Record<number, { voteCount: number; voters: { id: string; name: string }[] }> = {}
      let userVotedFor: number | null = null

      votes.forEach((v) => {
        stats[v.optionIndex] = { voteCount: v.voteCount, voters: v.voters }
        if (v.voters.some((voter) => voter.id === user?.id)) {
          userVotedFor = v.optionIndex
        }
      })
      setPollStats(stats)
      setHasVoted(userVotedFor)
    } catch (err) {
      console.error('Error loading votes', err)
    }
  }

  useEffect(() => {
    loadVotes()
    // A real app might subscribe to real-time changes here
  }, [messageId, user?.id])

  const handleVote = async (index: number) => {
    if (loading || hasVoted === index) return
    setLoading(true)
    try {
      await voteOnPoll(messageId, index)
      setHasVoted(index)
      await loadVotes()
    } catch (err) {
      console.error('Error voting', err)
    } finally {
      setLoading(false)
    }
  }

  const totalVotes = Object.values(pollStats).reduce((acc, curr) => acc + curr.voteCount, 0)

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && <span className="text-xs text-muted-foreground ml-1 mb-1">{senderName}</span>}
        <Card className={`w-full ${isOwn ? 'bg-primary/5 border-primary/20' : 'bg-white'}`}>
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold leading-snug">{question}</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 pb-3 space-y-3">
            {options.map((opt: string, index: number) => {
              const stat = pollStats[index] || { voteCount: 0, voters: [] }
              const percentage = totalVotes > 0 ? Math.round((stat.voteCount / totalVotes) * 100) : 0
              const isVoted = hasVoted === index

              return (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => handleVote(index)}
                    disabled={loading}
                    className={`relative w-full text-left overflow-hidden rounded-md border transition-all duration-200 ${isVoted ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50'
                      }`}
                  >
                    {/* Background progress bar */}
                    {totalVotes > 0 && (
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${isVoted ? 'bg-primary/20' : 'bg-gray-100/80'
                          }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    {/* Content (Z-index above progress) */}
                    <div className="relative z-10 flex items-center justify-between p-3 gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Custom Checkbox/Radio circle */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isVoted ? 'border-primary' : 'border-gray-300'
                          }`}>
                          {isVoted && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>

                        <span className={`text-sm font-medium truncate ${isVoted ? 'text-primary' : 'text-gray-700'}`}>
                          {opt}
                        </span>
                      </div>

                      {totalVotes > 0 && (
                        <span className={`text-xs font-semibold shrink-0 ${isVoted ? 'text-primary' : 'text-gray-500'}`}>
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Voters List - Only visible for Admins */}
                  {isAdmin && stat.voters.length > 0 && (
                    <div className="pl-11 mt-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-[10px] text-blue-600 hover:underline">
                            Voir qui a voté ({stat.voters.length})
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-base font-semibold">Votants pour s "{opt}"</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-60 overflow-y-auto mt-2 space-y-2">
                            {stat.voters.map((v, i) => (
                              <div key={i} className="text-sm px-3 py-2 bg-gray-50 rounded-md border border-gray-100 flex items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 font-medium text-xs">
                                  {v.name.charAt(0).toUpperCase()}
                                </div>
                                {v.name}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              )
            })}
            <div className="text-[11px] font-medium text-muted-foreground mt-2 px-1 text-right border-t border-gray-100 pt-2">
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''} au total
            </div>
          </CardContent>
        </Card>
        <span className="text-[10px] text-muted-foreground mt-1">
          {format(new Date(sentAt), 'HH:mm', { locale: fr })}
        </span>
      </div>
    </div>
  )
}
