/**
 * Componente DatePicker para el sistema v8.0
 * Basado en react-day-picker y shadcn/ui
 */

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

// Componente Calendar básico
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <CalendarIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <CalendarIcon className="h-4 w-4" />,
      }}
      locale={es}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

// Componente DatePicker principal
function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  ...props
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}

// Componente DatePickerWithRange para rangos de fechas
function DatePickerWithRange({
  dateRange,
  onDateRangeChange,
  placeholder = "Seleccionar rango de fechas",
  disabled = false,
  className,
  ...props
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                {format(dateRange.to, "LLL dd, y", { locale: es })}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y", { locale: es })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={2}
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}

// Hook personalizado para manejar fechas
function useDatePicker(initialDate = null) {
  const [date, setDate] = React.useState(initialDate)

  const handleDateChange = React.useCallback((newDate) => {
    setDate(newDate)
  }, [])

  const resetDate = React.useCallback(() => {
    setDate(null)
  }, [])

  const formatDate = React.useCallback((dateToFormat = date, formatString = "PPP") => {
    if (!dateToFormat) return ""
    return format(dateToFormat, formatString, { locale: es })
  }, [date])

  return {
    date,
    setDate: handleDateChange,
    resetDate,
    formatDate,
  }
}

// Hook para rangos de fechas
function useDateRangePicker(initialRange = null) {
  const [dateRange, setDateRange] = React.useState(initialRange)

  const handleDateRangeChange = React.useCallback((newRange) => {
    setDateRange(newRange)
  }, [])

  const resetDateRange = React.useCallback(() => {
    setDateRange(null)
  }, [])

  const isRangeComplete = React.useMemo(() => {
    return dateRange?.from && dateRange?.to
  }, [dateRange])

  return {
    dateRange,
    setDateRange: handleDateRangeChange,
    resetDateRange,
    isRangeComplete,
  }
}

export { 
  Calendar, 
  DatePicker, 
  DatePickerWithRange, 
  useDatePicker, 
  useDateRangePicker 
}

