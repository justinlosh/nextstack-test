"use client"

import type React from "react"

import { useState } from "react"
import { CalendarClock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SchedulingDialogProps {
  isScheduled: boolean
  scheduledAt: Date | null
  onSchedule: (date: Date) => Promise<void>
  onUnschedule: () => Promise<void>
  isLoading?: boolean
  error?: Error | null
  trigger?: React.ReactNode
}

export function SchedulingDialog({
  isScheduled,
  scheduledAt,
  onSchedule,
  onUnschedule,
  isLoading = false,
  error = null,
  trigger,
}: SchedulingDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(scheduledAt || undefined)

  const handleSchedule = async () => {
    if (!selectedDate) return

    await onSchedule(selectedDate)
    setOpen(false)
  }

  const handleUnschedule = async () => {
    await onUnschedule()
    setOpen(false)
  }

  // Ensure selected date is in the future
  const isValidDate = selectedDate ? selectedDate > new Date() : false

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <CalendarClock className="h-4 w-4 mr-2" />
            {isScheduled ? "Edit Schedule" : "Schedule"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isScheduled ? "Edit Scheduled Publication" : "Schedule Publication"}</DialogTitle>
          <DialogDescription>
            {isScheduled
              ? "This content is scheduled for publication. You can modify the schedule or unschedule it."
              : "Choose when this content should be automatically published."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <DateTimePicker date={selectedDate} setDate={setSelectedDate} disabled={isLoading} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {selectedDate && !isValidDate && (
            <Alert variant="warning">
              <AlertDescription>The selected date must be in the future.</AlertDescription>
            </Alert>
          )}

          {isScheduled && (
            <div className="text-sm text-muted-foreground">
              Currently scheduled for: <span className="font-medium">{scheduledAt?.toLocaleString()}</span>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          {isScheduled && (
            <Button variant="outline" onClick={handleUnschedule} disabled={isLoading}>
              Unschedule
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={!isValidDate || isLoading}>
              {isLoading ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
