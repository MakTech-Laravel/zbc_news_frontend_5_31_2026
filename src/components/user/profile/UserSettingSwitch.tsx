import { cn } from "@/lib/utils";

type UserSettingSwitchProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-label"?: string;
};

export function UserSettingSwitch({
  id,
  checked,
  onCheckedChange,
  "aria-label": ariaLabel,
}: UserSettingSwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-[22px] w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-zbc-gray-900" : "bg-zbc-gray-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-1",
        )}
      />
    </button>
  );
}
