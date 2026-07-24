import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

interface CreatePollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendPoll: (question: string, options: string[]) => void
}

export function CreatePollDialog({ open, onOpenChange, onSendPoll }: CreatePollDialogProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options]
      newOptions.splice(index, 1)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSend = () => {
    const filteredOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0)
    if (question.trim().length === 0) {
      alert('Veuillez entrer une question.')
      return
    }
    if (filteredOptions.length < 2) {
      alert('Veuillez entrer au moins deux options valides.')
      return
    }
    onSendPoll(question.trim(), filteredOptions)
    setQuestion('')
    setOptions(['', ''])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un sondage</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <Input
              placeholder="Posez votre question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Options</label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={handleAddOption}
            >
              <Plus className="h-4 w-4" />
              Ajouter une option
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend}>Envoyer le sondage</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
