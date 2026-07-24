import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Users, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import {
  fetchAttendanceTrend,
  fetchClassAttendanceStats,
  fetchStudentCount,
  fetchTeacherCount,
} from '@/lib/reports-api'

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week')
  const todayStr = new Date().toISOString().slice(0, 10)
  const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90

  const { data: attendanceData = [] } = useQuery({
    queryKey: ['reports-attendance', selectedPeriod],
    queryFn: () => fetchAttendanceTrend(days),
  })

  const { data: classStats = [] } = useQuery({
    queryKey: ['reports-class-stats', todayStr],
    queryFn: () => fetchClassAttendanceStats(todayStr),
  })

  const { data: totalStudents = 0 } = useQuery({
    queryKey: ['admin-total-students'],
    queryFn: fetchStudentCount,
  })

  const { data: totalTeachers = 0 } = useQuery({
    queryKey: ['admin-total-teachers'],
    queryFn: fetchTeacherCount,
  })

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      periodDays: days,
      totalStudents,
      totalTeachers,
      attendanceTrend: attendanceData,
      classStatsToday: classStats,
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-presences-${todayStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const avgRate =
    attendanceData.length > 0
      ? Math.round(attendanceData.reduce((sum, d) => sum + d.rate, 0) / attendanceData.length)
      : 0

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Présences et statistiques réelles"
        actions={
          <Button
            size="sm"
            className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
            onClick={exportReport}
            disabled={attendanceData.length === 0}
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exporter JSON</span>
          </Button>
        }
      />

      <PageContent className="animate-fade-in space-y-6">
        <Card className="border-school-yellow/20">
          <CardHeader>
            <CardTitle className="text-school-black">Période</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">30 derniers jours</SelectItem>
                <SelectItem value="quarter">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-school-yellow/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-school-black/60">Élèves</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </CardContent>
          </Card>
          <Card className="border-school-yellow/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-school-black/60">Professeurs</p>
                <p className="text-2xl font-bold">{totalTeachers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </CardContent>
          </Card>
          <Card className="border-school-yellow/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-school-black/60">Taux moyen</p>
                <p className="text-2xl font-bold">{avgRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-school-yellow/20">
          <CardHeader>
            <CardTitle className="text-school-black">Évolution des présences</CardTitle>
            <CardDescription>Données issues de la table attendance_records</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceData.length === 0 ? (
              <p className="text-sm text-center text-school-black/50 py-12">Aucune donnée sur cette période</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Taux']} />
                    <Line type="monotone" dataKey="rate" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-school-yellow/20">
          <CardHeader>
            <CardTitle className="text-school-black">Par classe (aujourd&apos;hui)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classStats.length === 0 ? (
              <p className="text-sm text-center text-school-black/50 py-8">Aucune présence aujourd&apos;hui</p>
            ) : (
              classStats.map((stat) => (
                <div
                  key={stat.classId}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                >
                  <div>
                    <p className="font-medium">{stat.name}</p>
                    <p className="text-xs text-school-black/60">
                      {stat.present} présents · {stat.absent} absents · {stat.late} retards
                    </p>
                  </div>
                  <p className="text-xl font-bold">{stat.rate}%</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PageContent>
    </>
  )
}

export default ReportsPage
