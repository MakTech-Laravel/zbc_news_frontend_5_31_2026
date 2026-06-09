import * as React from "react";

import { SettingsCheckbox } from "@/components/admin/settings/SettingsCheckbox";
import {
  groupPermissions,
  type PermissionGroup,
} from "@/components/admin/roles/groupPermissions";
import type { AdminPermission } from "@/services/admin/roles";
import { cn } from "@/lib/utils";

type PermissionSelectorProps = {
  permissions: AdminPermission[];
  selectedNames?: string[];
  onChange: (names: string[]) => void;
  disabled?: boolean;
  className?: string;
};

function GroupCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  id,
}: {
  id: string;
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(indeterminate ? true : e.target.checked)}
      className="size-[13px] shrink-0 rounded border-admin-input-border text-zbc-blue accent-zbc-blue"
    />
  );
}

function PermissionGroupCard({
  group,
  selectedSet,
  disabled,
  onToggleGroup,
  onTogglePermission,
}: {
  group: PermissionGroup;
  selectedSet: Set<string>;
  disabled?: boolean;
  onToggleGroup: (group: PermissionGroup, checked: boolean) => void;
  onTogglePermission: (name: string, checked: boolean) => void;
}) {
  const groupNames = group.permissions.map((p) => p.name);
  const selectedCount = groupNames.filter((name) => selectedSet.has(name)).length;
  const allSelected = selectedCount === groupNames.length && groupNames.length > 0;
  const someSelected = selectedCount > 0 && !allSelected;
  const headerId = `permission-group-${group.key.replace(/\s+/g, "-")}`;

  return (
    <div className="rounded-md border border-[#e5e7eb] bg-[#f3f4f6] p-4">
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] pb-3">
        <GroupCheckbox
          id={headerId}
          checked={allSelected}
          indeterminate={someSelected}
          disabled={disabled}
          onChange={(checked) => onToggleGroup(group, checked)}
        />
        <label
          htmlFor={headerId}
          className="cursor-pointer text-sm font-medium text-[#6b7280]"
        >
          {group.label}
          <span className="ml-1 text-xs font-normal text-admin-trend-muted">
            (Select all)
          </span>
        </label>
      </div>

      <ul className="divide-y divide-[#e5e7eb]">
        {group.permissions.map((permission) => {
          const itemId = `permission-${group.key}-${permission.id}`;
          return (
            <li key={itemId} className="py-2">
              <SettingsCheckbox
                id={itemId}
                label={permission.name}
                checked={selectedSet.has(permission.name)}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  onTogglePermission(permission.name, checked)
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PermissionSelector({
  permissions,
  selectedNames,
  onChange,
  disabled,
  className,
}: PermissionSelectorProps) {
  const groups = React.useMemo(() => groupPermissions(permissions), [permissions]);
  const selectedSet = React.useMemo(
    () => new Set(selectedNames ?? []),
    [selectedNames],
  );

  const togglePermission = React.useCallback(
    (name: string, checked: boolean) => {
      const next = new Set(selectedSet);
      if (checked) next.add(name);
      else next.delete(name);
      onChange(Array.from(next));
    },
    [onChange, selectedSet],
  );

  const toggleGroup = React.useCallback(
    (group: PermissionGroup, checked: boolean) => {
      const next = new Set(selectedSet);
      for (const permission of group.permissions) {
        if (checked) next.add(permission.name);
        else next.delete(permission.name);
      }
      onChange(Array.from(next));
    },
    [onChange, selectedSet],
  );

  if (permissions.length === 0) {
    return (
      <p className="text-sm text-admin-label">No permissions available.</p>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {groups.map((group) => (
        <PermissionGroupCard
          key={group.key}
          group={group}
          selectedSet={selectedSet}
          disabled={disabled}
          onToggleGroup={toggleGroup}
          onTogglePermission={togglePermission}
        />
      ))}
    </div>
  );
}
