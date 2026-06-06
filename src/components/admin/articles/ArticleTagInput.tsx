import { Plus, X } from "lucide-react";
import * as React from "react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ArticleTagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  inputClassName?: string;
};

export function ArticleTagInput({
  tags,
  onChange,
  error,
  inputClassName,
}: ArticleTagInputProps) {
  const [tagInput, setTagInput] = React.useState("");

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag"
          className={cn(inputClassName, "min-w-0 flex-1 rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zbc-blue-200/50 md:text-sm")}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTag}
          className="h-10 shrink-0 gap-1 rounded-[10px] border-admin-input-border px-3"
        >
          <Plus className="size-4" aria-hidden />
          Add
        </Button>
      </div>
      {tags.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-admin-heading"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-admin-input-border/50"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <InputError message={error} className="mt-1" />
    </div>
  );
}
