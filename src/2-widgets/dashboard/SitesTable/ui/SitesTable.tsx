"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Search } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
} from "@/components/ui";
import {
  parsePublishCapError,
  type PublishCapInfo,
} from "@/5-shared/lib/tenants/publish-cap";
import {
  publishTenant,
  unpublishTenant,
} from "@/3-features/manage-tenants/actions/publishTenant";
import { EXTRA_SITE } from "@/5-shared/lib/billing/plans";
import { PublishCapDialog } from "@/2-widgets/dashboard/Billing/ui/PublishCapDialog";
import {
  archiveTenant,
  restoreTenant,
} from "@/3-features/manage-tenants/actions/archiveTenant";
import { deleteTenant } from "@/3-features/manage-tenants/actions/deleteTenant";
import type { Tenant } from "@/5-shared/lib/db/schema";

interface TenantDomain {
  tenantId: string;
  domain: string;
  status: string;
}

interface SitesTableProps {
  userTenants: Tenant[];
  roles: { tenantId: string; role: string }[];
  manageableTenantIds: string[];
  locale: string;
  domains: TenantDomain[];
}

function roleLabel(role: string): string {
  if (role === "owner") return "Owner";
  if (role === "webmaster") return "Web-master";
  return "Editor";
}

function StatusPill({ status, compact = false }: { status: string; compact?: boolean }) {
  const styles: Record<string, { label: string; pill: string; dot: string }> = {
    published: {
      label: "Published",
      pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    archived: {
      label: "Archived",
      pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    draft: {
      label: "Draft",
      pill: "bg-muted text-muted-foreground",
      dot: "bg-muted-foreground",
    },
  };
  const s = styles[status] ?? styles.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${
        compact ? "gap-1 px-2 py-0.5 text-[10px]" : "gap-1.5 px-2.5 py-0.5 text-xs"
      } ${s.pill}`}
    >
      <span className={`rounded-full ${compact ? "size-1" : "size-1.5"} ${s.dot}`} />
      {s.label}
    </span>
  );
}

interface RowActionsProps {
  tenant: Tenant;
  locale: string;
  canManage: boolean;
  isOwnerRow: boolean;
  isPublished: boolean;
  isArchived: boolean;
  isPending: boolean;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (tenant: Tenant) => void;
}

function RowActions({
  tenant,
  locale,
  canManage,
  isOwnerRow,
  isPublished,
  isArchived,
  isPending,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onDelete,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="size-8 shrink-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/dashboard/site-builder/${tenant.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!isArchived && canManage && (
          <DropdownMenuItem
            disabled={isPending}
            onSelect={() => (isPublished ? onUnpublish(tenant.id) : onPublish(tenant.id))}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
        )}
        {!isArchived && isOwnerRow && (
          <DropdownMenuItem disabled={isPending} onSelect={() => onArchive(tenant.id)}>
            Archive
          </DropdownMenuItem>
        )}
        {isArchived && isOwnerRow && (
          <DropdownMenuItem disabled={isPending} onSelect={() => onRestore(tenant.id)}>
            Restore
          </DropdownMenuItem>
        )}
        {isArchived && isOwnerRow && (
          <DropdownMenuItem
            disabled={isPending}
            onSelect={() => onDelete(tenant)}
            className="text-destructive focus:text-destructive"
          >
            Delete permanently
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type FilterStatus = "all" | "published" | "draft" | "archived";
type SortField = "name" | "status" | "updatedAt" | "locales";

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

export function SitesTable({
  userTenants,
  roles,
  manageableTenantIds,
  locale,
  domains,
}: SitesTableProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [tenants, setTenants] = useState(userTenants);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [capDialog, setCapDialog] = useState<
    { info: PublishCapInfo; tenantId: string } | null
  >(null);

  const domainMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of domains) {
      if (d.status === "verified") {
        map.set(d.tenantId, d.domain);
      }
    }
    return map;
  }, [domains]);

  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of roles) {
      map.set(m.tenantId, m.role);
    }
    return map;
  }, [roles]);

  const statusCounts = useMemo(() => {
    const counts = { all: tenants.length, published: 0, draft: 0, archived: 0 };
    for (const t of tenants) {
      if (t.status === "published") counts.published++;
      else if (t.status === "archived") counts.archived++;
      else counts.draft++;
    }
    return counts;
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    let result = [...tenants];

    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => {
        const customDomain = domainMap.get(t.id) ?? "";
        return (
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          customDomain.toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "updatedAt":
          cmp =
            new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime();
          break;
        case "locales":
          cmp = (a.locales?.length ?? 0) - (b.locales?.length ?? 0);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tenants, filterStatus, searchQuery, sortField, sortDir, domainMap]);

  const manageableSet = useMemo(
    () => new Set(manageableTenantIds),
    [manageableTenantIds],
  );

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  const handlePublish = useCallback(
    (tenantId: string) => {
      startTransition(async () => {
        try {
          await publishTenant(tenantId);
          setTenants((prev) =>
            prev.map((t) =>
              t.id === tenantId ? { ...t, status: "published" } : t,
            ),
          );
          toast.success("Site published");
        } catch (err: unknown) {
          const cap = parsePublishCapError(err);
          if (cap) {
            setCapDialog({ info: cap, tenantId });
            return;
          }
          const message =
            err instanceof Error ? err.message : "Failed to publish";
          toast.error(message);
        }
      });
    },
    [],
  );

  const handleUnpublish = useCallback(
    (tenantId: string) => {
      startTransition(async () => {
        try {
          await unpublishTenant(tenantId);
          setTenants((prev) =>
            prev.map((t) =>
              t.id === tenantId ? { ...t, status: "draft" } : t,
            ),
          );
          toast.success("Site unpublished");
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to unpublish";
          toast.error(message);
        }
      });
    },
    [],
  );

  const handleArchive = useCallback((tenantId: string) => {
    startTransition(async () => {
      try {
        await archiveTenant(tenantId);
        setTenants((prev) =>
          prev.map((t) => (t.id === tenantId ? { ...t, status: "archived" } : t)),
        );
        toast.success("Site archived");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to archive");
      }
    });
  }, []);

  const handleRestore = useCallback((tenantId: string) => {
    startTransition(async () => {
      try {
        await restoreTenant(tenantId);
        setTenants((prev) =>
          prev.map((t) => (t.id === tenantId ? { ...t, status: "draft" } : t)),
        );
        toast.success("Site restored");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to restore");
      }
    });
  }, []);

  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
  const [confirmName, setConfirmName] = useState("");

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      try {
        await deleteTenant(target.id, confirmName);
        setTenants((prev) => prev.filter((t) => t.id !== target.id));
        toast.success("Site deleted");
        setDeleteTarget(null);
        setConfirmName("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  const filterCards = [
    {
      key: "all" as FilterStatus,
      label: "All",
      count: statusCounts.all,
    },
    {
      key: "published" as FilterStatus,
      label: "Published",
      count: statusCounts.published,
    },
    {
      key: "draft" as FilterStatus,
      label: "Drafts",
      count: statusCounts.draft,
    },
    {
      key: "archived" as FilterStatus,
      label: "Archived",
      count: statusCounts.archived,
    },
  ];

  const noTenants = tenants.length === 0;

  const hasActiveFilters = filterStatus !== "all" || searchQuery !== "";

  const showEmptyState =
    !noTenants && filteredTenants.length === 0 && hasActiveFilters;

  const showInitialEmptyState = noTenants && !hasActiveFilters;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {filterCards.map((card) => {
          const isActive = filterStatus === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterStatus(card.key)}
              className={`text-left bg-card border rounded-xl p-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                isActive
                  ? "border-primary ring-1 ring-primary"
                  : "border-border"
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                {card.label}
              </p>
              <p className="text-3xl font-black text-foreground tracking-tighter mt-1">
                {card.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      {!noTenants && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, subdomain, or custom domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        {/* Initial empty state */}
        {showInitialEmptyState && (
          <section className="bg-card p-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              No Tenants Found
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              Your workshop is initialized. Awaiting the first deployment.
            </p>
          </section>
        )}

        {/* Filtered empty state */}
        {showEmptyState && (
          <section className="bg-card p-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {filterStatus !== "all" && searchQuery
                ? `No ${filterStatus} sites match your search`
                : filterStatus !== "all"
                  ? `No ${filterStatus} sites`
                  : "No sites match your search"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              {filterStatus !== "all" && searchQuery
                ? "Try a different search or filter."
                : filterStatus !== "all"
                  ? filterStatus === "published"
                    ? "Publish a site to see it here."
                    : filterStatus === "archived"
                      ? "Archive a site to see it here."
                      : "Create a site to see it here."
                  : "Try a different search term."}
            </p>
          </section>
        )}

        {/* Table */}
        {filteredTenants.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                    <SortIndicator
                      field="name"
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("status")}
                  >
                    Status
                    <SortIndicator
                      field="status"
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Subdomain
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Custom Domain
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none hidden lg:table-cell"
                    onClick={() => toggleSort("locales")}
                  >
                    Languages
                    <SortIndicator
                      field="locales"
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </th>
                  <th
                    className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("updatedAt")}
                  >
                    Updated
                    <SortIndicator
                      field="updatedAt"
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                    Role
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => {
                  const canManage = manageableSet.has(tenant.id);
                  const role = roleMap.get(tenant.id) ?? "editor";
                  const customDomain = domainMap.get(tenant.id);
                  const isPublished = tenant.status === "published";
                  const isArchived = tenant.status === "archived";
                  const isOwnerRow = role === "owner";

                  return (
                    <tr
                      key={tenant.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/${locale}/dashboard/site-builder/${tenant.id}`}
                          className="text-sm font-semibold text-card-foreground hover:text-primary transition-colors"
                        >
                          {tenant.name}
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusPill status={tenant.status} />
                      </td>

                      {/* Subdomain */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          {tenant.slug}.{rootDomain}
                        </span>
                      </td>

                      {/* Custom Domain */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {customDomain ? (
                          <span className="text-sm text-foreground font-mono">
                            {customDomain}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">
                            &mdash;
                          </span>
                        )}
                      </td>

                      {/* Languages */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-foreground">
                          {tenant.locales?.length ?? 0}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3">
                        <span
                          className="text-sm text-muted-foreground"
                          title={new Date(tenant.updatedAt).toLocaleString()}
                        >
                          {timeAgo(new Date(tenant.updatedAt))}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge
                          variant={role === "editor" ? "secondary" : "default"}
                          className="text-[10px] uppercase tracking-wider font-semibold"
                        >
                          {roleLabel(role)}
                        </Badge>
                      </td>

                      {/* Actions dropdown */}
                      <td className="px-2 py-3">
                        <RowActions
                          tenant={tenant}
                          locale={locale}
                          canManage={canManage}
                          isOwnerRow={isOwnerRow}
                          isPublished={isPublished}
                          isArchived={isArchived}
                          isPending={isPending}
                          onPublish={handlePublish}
                          onUnpublish={handleUnpublish}
                          onArchive={handleArchive}
                          onRestore={handleRestore}
                          onDelete={setDeleteTarget}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {showInitialEmptyState && (
          <section className="bg-card p-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              No Tenants Found
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              Your workshop is initialized. Awaiting the first deployment.
            </p>
          </section>
        )}

        {showEmptyState && (
          <section className="bg-card p-12 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              {filterStatus !== "all"
                ? `No ${filterStatus} sites`
                : "No sites match your search"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              Try adjusting your search or filter.
            </p>
          </section>
        )}

        {filteredTenants.map((tenant) => {
          const canManage = manageableSet.has(tenant.id);
          const role = roleMap.get(tenant.id) ?? "editor";
          const customDomain = domainMap.get(tenant.id);
          const isPublished = tenant.status === "published";
          const isArchived = tenant.status === "archived";
          const isOwnerRow = role === "owner";

          return (
            <div
              key={tenant.id}
              className="bg-card border border-border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/${locale}/dashboard/site-builder/${tenant.id}`}
                  className="font-semibold text-card-foreground hover:text-primary transition-colors text-sm flex-1 min-w-0 truncate"
                >
                  {tenant.name}
                </Link>
                <RowActions
                  tenant={tenant}
                  locale={locale}
                  canManage={canManage}
                  isOwnerRow={isOwnerRow}
                  isPublished={isPublished}
                  isArchived={isArchived}
                  isPending={isPending}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDelete={setDeleteTarget}
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <StatusPill status={tenant.status} compact />
                <Badge
                  variant={role === "editor" ? "secondary" : "default"}
                  className="text-[10px] uppercase tracking-wider font-semibold"
                >
                  {roleLabel(role)}
                </Badge>
              </div>

              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                <p>
                  Subdomain:{" "}
                  <span className="font-mono">
                    {tenant.slug}.{rootDomain}
                  </span>
                </p>
                {customDomain && (
                  <p>
                    Domain:{" "}
                    <span className="font-mono">{customDomain}</span>
                  </p>
                )}
                <p>
                  Languages: {tenant.locales?.length ?? 0} | Updated:{" "}
                  {timeAgo(new Date(tenant.updatedAt))}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permanent-delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setConfirmName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete site permanently?</DialogTitle>
            <DialogDescription>
              This permanently deletes{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>{" "}
              and all of its content, languages, domains, and images. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-semibold">{deleteTarget?.name}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={deleteTarget?.name ?? ""}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setConfirmName("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || confirmName.trim() !== (deleteTarget?.name ?? "")}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {capDialog && (
        <PublishCapDialog
          open={capDialog !== null}
          onOpenChange={(open) => !open && setCapDialog(null)}
          plan={capDialog.info.plan}
          addonSites={capDialog.info.addonSites}
          softCap={EXTRA_SITE.softCap}
          onExtraSiteAdded={() => {
            const id = capDialog.tenantId;
            setCapDialog(null);
            router.refresh();
            handlePublish(id);
          }}
        />
      )}
    </div>
  );
}

function SortIndicator({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: "asc" | "desc";
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
