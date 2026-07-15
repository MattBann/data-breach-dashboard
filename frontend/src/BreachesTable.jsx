import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import BreachesFilter from "./BreachesFilter"
import { getDataClassColourIndex } from "./utils/utils"

const fallbackData = []

/**
 * Creates the table data view with pagination, filtering and sorting
 * @param {object} param0 props
 * @param {Array} param0.data table data as a list of objects
 * @returns React component
 */
function BreachesTable({ data }) {
    const columnHelper = useMemo(() => createColumnHelper(), [])
    const columns = useMemo(() => [
            // columnHelper.accessor("Name", {
            //     header: () => "Name",
            //     cell: info => info.getValue()
            // }),
            columnHelper.accessor("Title", {
                header: () => "Title",
                cell: info => info.getValue()
            }),
            columnHelper.accessor("Domain", {
                header: () => "Domain",
                cell: info => info.getValue()
            }),
            columnHelper.accessor(row => Date.parse(row.BreachDate), {
                id: "BreachDate",
                header: () => "Date Breached",
                cell: info => new Date(info.getValue()).toLocaleDateString(),
                meta: {
                    filterType: "dateRange"
                },
                filterFn: "inNumberRange",
            },),
            // columnHelper.accessor("AddedDate", {
            //     header: () => "AddedDate",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("ModifiedDate", {
            //     header: () => "ModifiedDate",
            //     cell: info => info.getValue()
            // },),
            columnHelper.accessor("PwnCount", {
                header: () => "Number of records",
                cell: info => info.getValue(),
                meta: {
                    filterType: "range"
                }
            },),
            columnHelper.accessor("DataClasses", {
                header: () => "Types of data breached",
                cell: info => {
                    let classes = info.getValue()
                    return <div className="flex flex-wrap max-h-[3lh] overflow-auto">
                        {classes.map(dataClass =>
                            <div key={dataClass} className={`${getDataClassColourIndex(dataClass)} m-[0.4ch] p-[0.4ch] text-sm rounded-md`}>{dataClass}</div>
                        )}
                    </div>
                },

                enableSorting: false,
                size: 300,
                meta: {
                    filterType: "selection",
                },
                filterFn: "arrIncludesSome",
            },),
            columnHelper.accessor("Description", {
                header: () => "Description",
                cell: info => {
                    let desc = { __html: info.getValue() }
                    return <div className="max-h-[3lh] overflow-auto" dangerouslySetInnerHTML={desc} />
                },
                enableSorting: false,
                size: 500,
            },),
            // columnHelper.accessor("LogoPath", {
            //     header: () => "LogoPath",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("Attribution", {
            //     header: () => "Attribution",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("DisclosureUrl", {
            //     header: () => "DisclosureUrl",
            //     cell: info => info.getValue()
            // },),
            columnHelper.accessor("IsVerified", {
                header: () => "Is Verified?",
                cell: info => info.getValue() ? "True" : "False",
                meta: {
                    filterType: "boolean"
                }
            },),
            columnHelper.accessor("IsFabricated", {
                header: () => "Is Fabricated?",
                cell: info => info.getValue() ? "True" : "False",
                meta: {
                    filterType: "boolean"
                }
            },),
            // columnHelper.accessor("IsSensitive", {
            //     header: () => "IsSensitive",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("IsRetired", {
            //     header: () => "IsRetired",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("IsSpamList", {
            //     header: () => "IsSpamList",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("IsMalware", {
            //     header: () => "IsMalware",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("IsSubscriptionFree", {
            //     header: () => "IsSubscriptionFree",
            //     cell: info => info.getValue()
            // },),
            // columnHelper.accessor("IsStealerLog", {
            //     header: () => "IsStealerLog",
            //     cell: info => info.getValue()
            // },),
            columnHelper.accessor("isHashed", {
                header: () => <>Is Hashed? (<em>inferred</em> <span title="Automatically extracted from the description, so could be inaccurate">🛈</span>)</>,
                cell: info => info.getValue() === null ? "Unknown" : info.getValue() ? "True" : "False",
                meta: {
                    filterType: "boolean"
                }
            }),
            columnHelper.accessor("isSalted", {
                header: () => <>Is Salted? (<em>inferred</em> <span title="Automatically extracted from the description, so could be inaccurate">🛈</span>)</>,
                cell: info => info.getValue() === null ? "Unknown" : info.getValue() ? "True" : "False",
                meta: {
                    filterType: "boolean"
                }
            }),
            columnHelper.accessor("hashAlgo", {
                header: () => <>Hash Function Used (<em>inferred</em> <span title="Automatically extracted from the description, so could be inaccurate">🛈</span>)</>,
                cell: info => info.getValue() === null ? "Unknown" : info.getValue(),

            })
    ], [columnHelper])


    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });

    // const [columnFilters, setColumnFilters] = useState([]);


    const table = useReactTable({
        columns,
        // safeData,
        data: data ?? fallbackData,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),

        onPaginationChange: setPagination,

        columnResizeDirection: "ltr",
        columnResizeMode: "onChange",

        state: {
            pagination,
            // columnFilters
        },
        // onColumnFiltersChange: setColumnFilters,
        initialState: {
            sorting: [
                {
                    id: "BreachDate",
                    desc: true,
                }
            ]
        },
        defaultColumn: {
            size: 150,
            minSize: 50
        }
    })

    return <>
        <BreachesFilter table={table} />
        <div className="h-fit">
            <div className="overflow-auto">
                <table className="border-collapse border table-fixed" style={{ width: table.getCenterTotalSize() }}>
                    <thead className="bg-blue-200 dark:bg-gray-800">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <th className="border relative" key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                                            {header.isPlaceholder ? null : (
                                                <>
                                                    <div className="flex justify-center">
                                                        <div
                                                            className={`${header.column.getCanSort() ? "cursor-pointer select-none flex justify-center" : ""} p-1 w-fit`}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            title={header.column.getCanSort() ? (
                                                                header.column.getNextSortingOrder() == "asc" ? "Sort by this column ascending" : (
                                                                    header.column.getNextSortingOrder() == "desc" ? "Sort by this column descending"
                                                                        : "Stop sorting by this column"
                                                                )
                                                            ) : undefined
                                                            }
                                                        >
                                                            <span className="">
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                            </span>
                                                            <span className="content-center">
                                                                {header.column.getIsSorted() == "asc" ? "▴" : (
                                                                    header.column.getIsSorted() == "desc" ? "▾" : null
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div {...{
                                                        className: "w-1 absolute -right-0.5 top-0 h-full cursor-e-resize",
                                                        onDoubleClick: () => header.column.resetSize(),
                                                        onMouseDown: (e) => { e.preventDefault(); header.getResizeHandler()(e) },
                                                        onTouchStart: (e) => { e.preventDefault(); header.getResizeHandler()(e) },
                                                    }}
                                                    />
                                                </>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-1 border overflow-clip scroll-auto">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length == 0 ? <p>Loading...</p> : undefined}
            </div>
            <div className="flex flex-row-reverse">
                <div className="float-right">
                    <span className="p-0.5">{pagination.pageIndex}</span>
                    <button className="m-0.5 min-w-[4ch] border"
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<<'}
                    </button>
                    <button className="m-0.5 min-w-[4ch] border"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<'}
                    </button>
                    <button className="m-0.5 min-w-[4ch] border"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>'}
                    </button>
                    <button className="m-0.5 min-w-[4ch] border"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>>'}
                    </button>
                    <select className="m-0.5 px-0.5 h-full min-w-[4ch] border"
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value))
                        }}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    </>
}

export default BreachesTable