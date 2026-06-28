"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge, Input } from "@/components/ui";
import { PLAN_LABELS, PLAN_ORDER, type PlanId } from "@/5-shared/lib/billing/plans";
import type { AdminWorkspaceRow } from "@/3-features/admin/queries/adminWorkspaces";

type SortField = "name" | "owner" | "plan" | "sites" | "members" | "createdAt";
type SortDir = "asc" | "desc";

function SortIndicator({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (sortField !== field) {
    return (
      <span className="inline-block ml-1 text-muted-foreground/30 text-[10px]">
        ↕
      </span>
    );
  }
  return (
    <span className="inline-block ml-1 text-primary text-[10px]">
      {sortDir === "asc" ? "▲" : "▼"}
    </span>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function SubscriptionPill({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    past_due: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    canceled: "bg-muted text-muted-foreground",
    unpaid: "bg-red-500/10 text-red-600 dark:text-red-400",
    trialing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    incomplete: "bg-muted text-muted-foreground",
    incomplete_expired: "bg-muted text-muted-foreground",
  };
  const cls = styles[status] ?? "bg-muted text-muted-foreground";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full gap-1.5 px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span className="rounded-full size-1.5 bg-current" />
      {label}
    </span>
  );
}

interface AdminWorkspacesTableProps {
  rows: AdminWorkspaceRow[];
  locale: string;
}

export function AdminWorkspacesTable({
  rows,
  locale,
}: AdminWorkspacesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...rows];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.ownerEmail.toLowerCase().includes(q) ||
          r.plan.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "owner":
          cmp = a.ownerName.localeCompare(b.ownerName);
          break;
        case "plan":
          cmp =
            PLAN_ORDER.indexOf(a.plan as PlanId) -
            PLAN_ORDER.indexOf(b.plan as PlanId);
          break;
        case "sites":
          cmp = a.publishedSites - b.publishedSites;
          break;
        case "members":
          cmp = a.memberCount - b.memberCount;
          break;
        case "createdAt":
          cmp = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rows, searchQuery, sortField, sortDir]);

  return (
    <div>
      <h2 className="text-lg font-bold text-card-foreground mb-4">
        All Workspaces
      </h2>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by workspace, owner, or plan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="hidden md:block">
        {filtered.length === 0 ? (
          <section className="bg-card p-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {searchQuery
                ? "No workspaces match your search"
                : "No workspaces found"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              {searchQuery
                ? "Try a different search term."
                : "Create a workspace to get started."}
            </p>
          </section>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("name")}
                  >
                    Workspace
                    <SortIndicator field="name" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("owner")}
                  >
                    Owner
                    <SortIndicator field="owner" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("plan")}
                  >
                    Plan
                    <SortIndicator field="plan" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Sub Status
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("sites")}
                  >
                    Sites
                    <SortIndicator field="sites" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("members")}
                  >
                    Members
                    <SortIndicator field="members" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Created
                    <SortIndicator field="createdAt" sortField={sortField} sortDir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/admin/workspaces/${row.id}`}
                        className="text-sm font-semibold text-card-foreground hover:text-primary transition-colors"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-card-foreground">
                          {row.ownerName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {row.ownerEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {PLAN_LABELS[row.plan as PlanId] ?? row.plan}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionPill status={row.subscriptionStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-card-foreground">
                        {row.publishedSites}/{row.totalSites}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-card-foreground">
                        {row.memberCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className="text-sm text-muted-foreground"
                        title={row.createdAt.toLocaleString()}
                      >
                        {timeAgo(row.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <section className="bg-card p-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              No workspaces found
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              Try adjusting your search.
            </p>
          </section>
        ) : (
          filtered.map((row) => (
            <Link
              key={row.id}
              href={`/${locale}/admin/workspaces/${row.id}`}
              className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-card-foreground text-sm flex-1 min-w-0 truncate">
                  {row.name}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold shrink-0">
                  {PLAN_LABELS[row.plan as PlanId] ?? row.plan}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                <p>
                  {row.ownerName} &lt;{row.ownerEmail}&gt;
                </p>
                <p>
                  Sites: {row.publishedSites}/{row.totalSites} · Members:{" "}
                  {row.memberCount}
                </p>
                <p>Created {timeAgo(row.createdAt)}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
