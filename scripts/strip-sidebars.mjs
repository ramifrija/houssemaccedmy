import fs from 'fs'

const pages = [
  'src/pages/Users.tsx',
  'src/pages/Settings.tsx',
  'src/pages/Attendance.tsx',
  'src/pages/MessagingPage.tsx',
  'src/pages/AnnouncementsPage.tsx',
  'src/pages/ReportsPage.tsx',
  'src/pages/TestPage.tsx',
  'src/pages/TeacherDashboard.tsx',
  'src/pages/StudentDashboard.tsx',
  'src/pages/MobileHome.tsx',
]

for (const f of pages) {
  let c = fs.readFileSync(f, 'utf8')
  c = c.replace(/import \{ SidebarProvider, SidebarTrigger \} from [^\n]+\n/g, '')
  c = c.replace(/import \{ SidebarProvider \} from [^\n]+\n/g, '')
  c = c.replace(/import \{ AppSidebar \} from [^\n]+\n/g, '')
  c = c.replace(
    /<SidebarProvider>\s*\n\s*<div className="min-h-screen flex w-full bg-school-gray-light">\s*\n\s*<AppSidebar \/>\s*\n\s*<main className="flex-1">/g,
    '<div className="min-h-screen bg-school-gray-light">\n        <main className="flex-1">'
  )
  c = c.replace(
    /<SidebarProvider>\s*\n\s*<div className="min-h-screen flex w-full bg-school-gray-light">\s*\n\s*<main className="flex-1">/g,
    '<div className="min-h-screen bg-school-gray-light">\n        <main className="flex-1">'
  )
  c = c.replace(/<\/main>\s*\n\s*<\/div>\s*\n\s*<\/SidebarProvider>/g, '</main>\n    </div>')
  c = c.replace(/<SidebarTrigger[^/]*\/>\s*\n/g, '')
  fs.writeFileSync(f, c)
  console.log('fixed', f)
}
