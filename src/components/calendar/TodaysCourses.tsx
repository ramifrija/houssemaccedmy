
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Clock, MapPin, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Search, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { CalendarSession } from "@/lib/courses-api"

interface TodaysCoursesProps {
	courses: CalendarSession[]
	selectedDate?: Date
	canManage?: boolean
	onEdit?: (course: CalendarSession) => void
	onDelete?: (courseId: string) => void
}

const ITEMS_PER_PAGE = 3

const TodaysCourses = ({ courses, selectedDate = new Date(), canManage = false, onEdit, onDelete }: TodaysCoursesProps) => {
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedTeacher, setSelectedTeacher] = useState<string>("all")
	const [selectedClass, setSelectedClass] = useState<string>("all")
	const [openTeacher, setOpenTeacher] = useState(false)
	const [openClass, setOpenClass] = useState(false)

	// Réinitialiser la page et les filtres quand la date change
	useEffect(() => {
		setCurrentPage(1)
		setSelectedTeacher("all")
		setSelectedClass("all")
	}, [selectedDate, courses.length])

	const uniqueTeachers = Array.from(new Set(courses.map(c => c.teacherName))).filter(Boolean)
	const uniqueClasses = Array.from(new Set(courses.map(c => c.className))).filter(Boolean)

	const filteredCourses = courses.filter(c => {
		if (selectedTeacher !== "all" && c.teacherName !== selectedTeacher) return false
		if (selectedClass !== "all" && c.className !== selectedClass) return false
		return true
	})

	const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
	const displayedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

	return (
		<Card className="lg:col-span-2 border-school-yellow/20 flex flex-col">
			<CardHeader className="pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<CardTitle className="text-school-black">Cours du jour</CardTitle>
					<CardDescription>
						{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
					</CardDescription>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{uniqueTeachers.length > 0 && (
						<Popover open={openTeacher} onOpenChange={setOpenTeacher}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openTeacher}
									className="w-[140px] h-8 text-xs bg-white justify-between"
								>
									<span className="truncate">
										{selectedTeacher === "all" ? "Professeur" : uniqueTeachers.find((t) => t === selectedTeacher)}
									</span>
									<ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[180px] p-0">
								<Command>
									<CommandInput placeholder="Chercher prof..." className="h-8 text-xs" />
									<CommandList>
										<CommandEmpty>Aucun résultat</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value="all"
												onSelect={() => {
													setSelectedTeacher("all")
													setCurrentPage(1)
													setOpenTeacher(false)
												}}
											>
												<Check className={cn("mr-2 h-3 w-3", selectedTeacher === "all" ? "opacity-100" : "opacity-0")} />
												Tous les profs
											</CommandItem>
											{uniqueTeachers.map((t) => (
												<CommandItem
													key={t}
													value={t!}
													onSelect={(currentValue) => {
														setSelectedTeacher(currentValue === selectedTeacher ? "all" : t!)
														setCurrentPage(1)
														setOpenTeacher(false)
													}}
												>
													<Check className={cn("mr-2 h-3 w-3", selectedTeacher === t ? "opacity-100" : "opacity-0")} />
													{t}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					)}
					{uniqueClasses.length > 0 && (
						<Popover open={openClass} onOpenChange={setOpenClass}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openClass}
									className="w-[140px] h-8 text-xs bg-white justify-between"
								>
									<span className="truncate">
										{selectedClass === "all" ? "Classe" : uniqueClasses.find((c) => c === selectedClass)}
									</span>
									<ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[180px] p-0">
								<Command>
									<CommandInput placeholder="Chercher classe..." className="h-8 text-xs" />
									<CommandList>
										<CommandEmpty>Aucun résultat</CommandEmpty>
										<CommandGroup>
											<CommandItem
												value="all"
												onSelect={() => {
													setSelectedClass("all")
													setCurrentPage(1)
													setOpenClass(false)
												}}
											>
												<Check className={cn("mr-2 h-3 w-3", selectedClass === "all" ? "opacity-100" : "opacity-0")} />
												Toutes les classes
											</CommandItem>
											{uniqueClasses.map((c) => (
												<CommandItem
													key={c}
													value={c!}
													onSelect={(currentValue) => {
														setSelectedClass(currentValue === selectedClass ? "all" : c!)
														setCurrentPage(1)
														setOpenClass(false)
													}}
												>
													<Check className={cn("mr-2 h-3 w-3", selectedClass === c ? "opacity-100" : "opacity-0")} />
													{c}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					)}
				</div>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col pt-4">
				{filteredCourses.length === 0 ? (
					<p className="text-sm text-center text-school-black/50 py-8">
						{courses.length === 0 ? "Aucun cours pour cette date" : "Aucun cours ne correspond à ces filtres"}
					</p>
				) : (
					<div className="flex flex-col flex-1">
						<div className="space-y-4 flex-1">
							{displayedCourses.map((course) => (
								<div key={course.id} className="p-4 border border-school-yellow/20 rounded-lg hover:bg-school-yellow/5 transition-colors">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3 min-w-0">
											<div className={`w-1 h-16 ${course.color} rounded shrink-0`}></div>
											<div className="flex-1 min-w-0">
												<div className="flex flex-wrap items-center gap-2 mb-2">
													<h3 className="font-semibold text-school-black truncate">{course.title}</h3>
													<Badge variant="outline" className="border-blue-300 text-blue-700 shrink-0">
														{course.className}
													</Badge>
												</div>
												<div className="space-y-1 text-sm text-school-black/70">
													<div className="flex items-center gap-2">
														<Clock className="w-4 h-4 shrink-0" />
														<span className="truncate">{course.startTime} – {course.endTime}</span>
													</div>
													<div className="flex items-center gap-2">
														<MapPin className="w-4 h-4 shrink-0" />
														<span className="truncate">{course.room}</span>
													</div>
												</div>
												<p className="text-sm text-school-black/60 mt-2 truncate">{course.teacherName}</p>
											</div>
										</div>
										{canManage && (
										<div className="flex gap-1 shrink-0 ml-2">
											<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-school-yellow/10" onClick={() => onEdit?.(course)}>
												<Edit className="w-4 h-4" />
											</Button>
											<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete?.(course.id)}>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
										)}
									</div>
								</div>
							))}
						</div>
						
						{totalPages > 1 && (
							<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
								<p className="text-sm text-muted-foreground">
									Page {currentPage} sur {totalPages}
								</p>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="w-4 h-4 mr-1" />
										Précédent
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										disabled={currentPage === totalPages}
									>
										Suivant
										<ChevronRight className="w-4 h-4 ml-1" />
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default TodaysCourses
