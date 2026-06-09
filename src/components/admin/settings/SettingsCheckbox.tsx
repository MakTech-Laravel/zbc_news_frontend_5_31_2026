import { cn } from "@/lib/utils";

type SettingsCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function SettingsCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  className,
}: SettingsCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-2",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="size-[13px] shrink-0 rounded border-admin-input-border text-zbc-blue accent-zbc-blue"
      />
      <span className="text-sm font-medium text-[#364153]">{label}</span>
    </label>
  );
}
