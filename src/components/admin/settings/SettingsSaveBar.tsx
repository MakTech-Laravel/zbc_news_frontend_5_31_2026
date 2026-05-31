import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SettingsSaveBarProps = {
  onSave: () => void;
};

export function SettingsSaveBar({ onSave }: SettingsSaveBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-1 border-t border-border bg-admin-surface/95 px-1 py-3 backdrop-blur-sm",
        "sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
      )}
    >
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onSave}
          className="h-11 w-full gap-2 rounded-[10px] bg-zbc-blue px-6 text-base font-medium hover:bg-zbc-blue/90 sm:h-12 sm:w-auto"
        >
          <Save className="size-5" aria-hidden />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
