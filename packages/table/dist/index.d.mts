import * as React from 'react';
import { Checkbox as Checkbox$1, Select as Select$1 } from 'radix-ui';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import { ClassValue } from 'clsx';

type SortDirection = "asc" | "desc";
type DataTableSort = {
    key: string;
    direction: SortDirection;
};
type DataTableColumn<T> = {
    key: string;
    header: string;
    sortable?: boolean;
    hideBelow?: "sm" | "md" | "lg";
    /** Optional custom cell renderer. Defaults to `String(row[key])`. */
    cell?: (row: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
};
type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    pageSize?: number;
    selectable?: boolean;
    stickyHeader?: boolean;
    maxHeight?: string;
    /** Empty-state message shown when `data` is empty. */
    emptyMessage?: string;
    /** Resolve a stable row id. Defaults to `row.id` or the row index. */
    getRowId?: (row: T, index: number) => string;
    /** Controlled selection. */
    selectedIds?: string[];
    defaultSelectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    /** Controlled sort. */
    sort?: DataTableSort | null;
    defaultSort?: DataTableSort | null;
    onSortChange?: (sort: DataTableSort | null) => void;
    /** Highlight a single active row (e.g. keyboard/focus target). */
    activeRowId?: string | null;
    onRowClick?: (row: T, index: number) => void;
    className?: string;
    rowClassName?: string | ((row: T, index: number) => string | undefined);
};
declare function DataTable<T>({ data, columns, pageSize: pageSizeProp, selectable, stickyHeader, maxHeight, emptyMessage, getRowId, selectedIds, defaultSelectedIds, onSelectionChange, sort: controlledSort, defaultSort, onSortChange, activeRowId, onRowClick, className, rowClassName, }: DataTableProps<T>): React.JSX.Element;

type TablePaginationProps = {
    page: number;
    pageCount: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
    className?: string;
};
declare function TablePagination({ page, pageCount, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions, className, }: TablePaginationProps): React.JSX.Element;

type UseTableSelectionOptions = {
    /** Controlled selected row ids. When provided, the hook becomes controlled. */
    selectedIds?: string[];
    /** Default selection for uncontrolled usage. */
    defaultSelectedIds?: string[];
    /** Called whenever selection changes. */
    onSelectionChange?: (selectedIds: string[]) => void;
};
type UseTableSelectionReturn = {
    selectedIds: string[];
    isSelected: (id: string) => boolean;
    toggle: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clear: () => void;
    isAllSelected: (ids: string[]) => boolean;
    isSomeSelected: (ids: string[]) => boolean;
};
/**
 * Controllable row-selection state for DataTable.
 * Supports both controlled (`selectedIds`) and uncontrolled (`defaultSelectedIds`) modes.
 */
declare function useTableSelection(options?: UseTableSelectionOptions): UseTableSelectionReturn;

declare function Table({ className, ...props }: React.ComponentProps<"table">): React.JSX.Element;
declare function TableHeader({ className, ...props }: React.ComponentProps<"thead">): React.JSX.Element;
declare function TableBody({ className, ...props }: React.ComponentProps<"tbody">): React.JSX.Element;
declare function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">): React.JSX.Element;
declare function TableRow({ className, ...props }: React.ComponentProps<"tr">): React.JSX.Element;
declare function TableHead({ className, ...props }: React.ComponentProps<"th">): React.JSX.Element;
declare function TableCell({ className, ...props }: React.ComponentProps<"td">): React.JSX.Element;
declare function TableCaption({ className, ...props }: React.ComponentProps<"caption">): React.JSX.Element;

declare function Checkbox({ className, ...props }: React.ComponentProps<typeof Checkbox$1.Root>): React.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Button({ className, variant, size, asChild, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}): React.JSX.Element;

declare function Select({ ...props }: React.ComponentProps<typeof Select$1.Root>): React.JSX.Element;
declare function SelectGroup({ ...props }: React.ComponentProps<typeof Select$1.Group>): React.JSX.Element;
declare function SelectValue({ ...props }: React.ComponentProps<typeof Select$1.Value>): React.JSX.Element;
declare function SelectTrigger({ className, size, children, ...props }: React.ComponentProps<typeof Select$1.Trigger> & {
    size?: "sm" | "default";
}): React.JSX.Element;
declare function SelectContent({ className, children, position, align, ...props }: React.ComponentProps<typeof Select$1.Content>): React.JSX.Element;
declare function SelectLabel({ className, ...props }: React.ComponentProps<typeof Select$1.Label>): React.JSX.Element;
declare function SelectItem({ className, children, ...props }: React.ComponentProps<typeof Select$1.Item>): React.JSX.Element;
declare function SelectSeparator({ className, ...props }: React.ComponentProps<typeof Select$1.Separator>): React.JSX.Element;
declare function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof Select$1.ScrollUpButton>): React.JSX.Element;
declare function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof Select$1.ScrollDownButton>): React.JSX.Element;

declare function cn(...inputs: ClassValue[]): string;

export { Button, Checkbox, DataTable, type DataTableColumn, type DataTableProps, type DataTableSort, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, type SortDirection, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TablePagination, type TablePaginationProps, TableRow, type UseTableSelectionOptions, type UseTableSelectionReturn, buttonVariants, cn, useTableSelection };
