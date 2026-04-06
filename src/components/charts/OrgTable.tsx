"use client";

import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { useState } from "react";
import { ChartCard } from "@/components/ui/ChartCard";
import type { OrgTableData } from "@/lib/types";

interface Props {
  data: OrgTableData;
}

export function OrgTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const isLoading = data.status === "loading";
  const error = data.status === "error" ? data.error : undefined;

  const filteredRows = data.rows.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.orgId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ChartCard
      title="Organization Table"
      subtitle={`${data.total} total organizations`}
      loading={isLoading}
      error={error}
      className="col-span-full"
    >
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-tremor-border bg-tremor-background px-3 py-1.5 text-sm text-tremor-content-strong placeholder:text-tremor-content focus:border-tremor-brand focus:outline-none focus:ring-1 focus:ring-tremor-brand"
        />
      </div>
      <div className="max-h-96 overflow-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Org Name</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell className="text-right">Projects</TableHeaderCell>
              <TableHeaderCell className="text-right">Paid Seats</TableHeaderCell>
              <TableHeaderCell className="text-right">Unpaid Seats</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.orgId}>
                <TableCell>
                  <span className="font-medium">{row.name}</span>
                  <span className="ml-2 text-xs text-tremor-content">
                    {row.orgId.slice(0, 8)}...
                  </span>
                </TableCell>
                <TableCell>{row.createdAt}</TableCell>
                <TableCell className="text-right">{row.projectCount}</TableCell>
                <TableCell className="text-right">{row.paidSeats}</TableCell>
                <TableCell className="text-right">{row.unpaidSeats}</TableCell>
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-tremor-content">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}
