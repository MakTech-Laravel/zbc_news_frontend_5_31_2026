import { cn } from "@/lib/utils";

type SettingsCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export function SettingsCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  className,
}: SettingsCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn("flex cursor-pointer items-center gap-2", className)}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="size-[13px] shrink-0 rounded border-admin-input-border text-zbc-blue accent-zbc-blue"
      />
      <span className="text-sm font-medium text-[#364153]">{label}</span>
    </label>
  );
}
