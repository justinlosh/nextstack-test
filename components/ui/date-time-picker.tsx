"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
}

export function DateTimePicker({ date, setDate, disabled = false }: DateTimePickerProps) {
  const minuteOptions = React.useMemo(() => {
    const options = []
    for (let i = 0; i < 60; i += 5) {
      options.push(i)
    }
    return options
  }, [])

  const hourOptions = React.useMemo(() => {
    const options = []
    for (let i = 0; i < 24; i++) {
      options.push(i)
    }
    return options
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const newDate = new Date(selectedDate)
              if (date) {
                newDate.setHours(date.getHours())
                newDate.setMinutes(date.getMinutes())
              }
              setDate(newDate)
            } else {
              setDate(undefined)
            }
          }}
          initialFocus
        />
        <div className="border-t border-border p-3 flex gap-2">
          <Select
            value={date ? date.getHours().toString() : undefined}
            onValueChange={(value) => {
              if (!date) return
              const newDate = new Date(date)
              newDate.setHours(Number.parseInt(value))
              setDate(newDate)
            }}
            disabled={!date}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((hour) => (
                <SelectItem key={hour} value={hour.toString()}>
                  {hour.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={date ? date.getMinutes().toString() : undefined}
            onValueChange={(value) => {
              if (!date) return
              const newDate = new Date(date)
              newDate.setMinutes(Number.parseInt(value))
              setDate(newDate)
            }}
            disabled={!date}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Minute" />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map((minute) => (
                <SelectItem key={minute} value={minute.toString()}>
                  {minute.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
