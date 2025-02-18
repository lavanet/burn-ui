"use client"

import * as React from "react"
import { cn } from "@burn/lib/utils"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

type SortDirection = "asc" | "desc" | null

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    sortable?: boolean
}

const TableContext = React.createContext<{
    sortData: (rows: HTMLTableRowElement[], columnIndex: number, direction: SortDirection) => void,
    activeSortColumn: number | null,
    setActiveSortColumn: (index: number | null) => void
}>({
    sortData: () => { },
    activeSortColumn: null,
    setActiveSortColumn: () => { }
})

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
    const [activeSortColumn, setActiveSortColumn] = React.useState<number | null>(null)

    const sortData = (rows: HTMLTableRowElement[], columnIndex: number, direction: SortDirection) => {
        const tbody = rows[0]?.parentElement
        if (!tbody || !direction) return

        const sortedRows = Array.from(rows).sort((a, b) => {
            const aText = a.cells[columnIndex]?.textContent?.trim() || ''
            const bText = b.cells[columnIndex]?.textContent?.trim() || ''

            // Special case for date column (first column)
            if (columnIndex === 0) {
                // Get the block number from the second column
                const aBlock = parseFloat(a.cells[1]?.textContent?.replace(/,/g, '') || '0')
                const bBlock = parseFloat(b.cells[1]?.textContent?.replace(/,/g, '') || '0')
                return direction === 'asc' ? aBlock - bBlock : bBlock - aBlock
            }

            // For other columns, keep the existing logic
            const aNum = parseFloat(aText.replace(/[$,]/g, ''))
            const bNum = parseFloat(bText.replace(/[$,]/g, ''))

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return direction === 'asc' ? aNum - bNum : bNum - aNum
            }

            return direction === 'asc'
                ? aText.localeCompare(bText)
                : bText.localeCompare(aText)
        })

        // Clear and re-append in new order
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild)
        }
        sortedRows.forEach(row => tbody.appendChild(row))
    }

    return (
        <TableContext.Provider value={{ sortData, activeSortColumn, setActiveSortColumn }}>
            <div className="relative w-full overflow-auto">
                <table
                    ref={ref}
                    className={cn("w-full caption-bottom text-sm", className)}
                    {...props}
                />
            </div>
        </TableContext.Provider>
    )
})
Table.displayName = "Table"

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
    ({ className, children, sortable = true, ...props }, ref) => {
        const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)
        const { sortData, activeSortColumn, setActiveSortColumn } = React.useContext(TableContext)
        const thRef = React.useRef<HTMLTableHeaderCellElement>(null)

        const handleSort = () => {
            if (!thRef.current) return

            const columnIndex = Array.from(thRef.current.parentElement?.children || [])
                .indexOf(thRef.current)

            const table = thRef.current.closest('table')
            if (!table) return

            const tbody = table.querySelector('tbody')
            if (!tbody) return

            const rows = Array.from(tbody.rows)

            if (activeSortColumn !== columnIndex) {
                setSortDirection('asc')
                setActiveSortColumn(columnIndex)
                sortData(rows, columnIndex, 'asc')
            } else {
                setSortDirection(prev => {
                    const newDirection = prev === null ? "asc" : prev === "asc" ? "desc" : null
                    if (newDirection === null) {
                        setActiveSortColumn(null)
                    }
                    sortData(rows, columnIndex, newDirection)
                    return newDirection
                })
            }
        }

        // Reset sort direction if this is not the active column
        React.useEffect(() => {
            if (!thRef.current) return
            const columnIndex = Array.from(thRef.current.parentElement?.children || [])
                .indexOf(thRef.current)
            if (activeSortColumn !== columnIndex) {
                setSortDirection(null)
            }
        }, [activeSortColumn])

        return (
            <th
                ref={thRef}
                className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                    sortable && "cursor-pointer select-none hover:text-foreground",
                    className
                )}
                onClick={sortable ? handleSort : undefined}
                {...props}
            >
                <div className="flex items-center justify-between gap-2">
                    <span>{children}</span>
                    {sortable && (
                        <div className="flex items-center">
                            {sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : sortDirection === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                            )}
                        </div>
                    )}
                </div>
            </th>
        )
    }
)
TableHead.displayName = "TableHead"

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}

export type { SortDirection }
