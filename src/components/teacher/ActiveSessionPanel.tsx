import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, Loader2, UserCheck, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  CalendarSession,
  findCurrentOrNextSession,
  isSessionInProgress,
} from '@/lib/courses-api'
import {
  ensureAttendanceForCourseSession,
  fetchAttendanceRecords,
  markAttendance,
  type AttendanceStatus,
} from '@/lib/attendance-api'

interface ActiveSessionPanelProps {
  sessions: CalendarSession[]
}

export function ActiveSessionPanel({ sessions }: ActiveSessionPanelProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const activeSession = findCurrentOrNextSession(sessions)
  const inProgress = activeSession ? isSessionInProgress(activeSession) : false

  const { data: attendanceSessionId, isLoading: ensuring } = useQuery({
    queryKey: ['attendance-session', activeSession?.id],
    queryFn: () => ensureAttendanceForCourseSession(activeSession!.id),
    enabled: !!activeSession?.id,
  })

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['attendance-records', attendanceSessionId],
    queryFn: () => fetchAttendanceRecords(attendanceSessionId!),
    enabled: !!attendanceSessionId,
  })

  const mark = useMutation({
    mutationFn: ({ studentId, status }: { studentId: string; status: AttendanceStatus }) =>
      markAttendance(attendanceSessionId!, studentId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance-records', attendanceSessionId] })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  if (!activeSession) {
    return (
      <Card className="border-school-yellow/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Cours actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-school-black/50 text-center py-4">
            Aucun cours en cours ou à venir aujourd&apos;hui
          </p>
        </CardContent>
      </Card>
    )
  }

  const loading = ensuring || loadingRecords

  return (
    <Card className="border-school-yellow/30 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            {inProgress ? 'Cours en cours' : 'Prochain cours'}
          </CardTitle>
          <Badge className={inProgress ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {activeSession.startTime} – {activeSession.endTime}
          </Badge>
        </div>
        <p className="text-sm text-school-black/70">
          {activeSession.title} — {activeSession.className} ({activeSession.room})
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-school-yellow" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-school-black/50 text-center py-4">
            Aucun élève inscrit dans cette classe
          </p>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.studentId}
                className="flex items-center justify-between gap-2 p-3 bg-white rounded-lg border border-school-yellow/10"
              >
                <div>
                  <p className="font-medium text-sm text-school-black">{record.fullName}</p>
                  <p className="text-xs text-school-black/50 capitalize">{statusLabel(record.status)}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={record.status === 'present' ? 'default' : 'outline'}
                    className={record.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                    disabled={mark.isPending}
                    onClick={() => mark.mutate({ studentId: record.studentId, status: 'present' })}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={record.status === 'late' ? 'default' : 'outline'}
                    className={record.status === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    disabled={mark.isPending}
                    onClick={() => mark.mutate({ studentId: record.studentId, status: 'late' })}
                  >
                    <Clock className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={record.status === 'absent' ? 'default' : 'outline'}
                    className={record.status === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                    disabled={mark.isPending}
                    onClick={() => mark.mutate({ studentId: record.studentId, status: 'absent' })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function statusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'Présent'
    case 'absent':
      return 'Absent'
    case 'late':
      return 'Retard'
    default:
      return status
  }
}
