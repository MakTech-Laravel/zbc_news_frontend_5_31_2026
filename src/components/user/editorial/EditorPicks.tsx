import { Link } from "react-router-dom";

import type { EditorialPick } from "@/services/user/editorial";
import { cn } from "@/lib/utils";

type EditorPicksProps = {
  picks: EditorialPick[];
  className?: string;
};

export function EditorPicks({ picks, className }: EditorPicksProps) {
  return (
    <section
      className={cn(
        "w-full rounded-[14px] border border-border-light bg-white p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-inter text-base font-medium leading-8 text-ink-heading">
        Editor Picks
      </h2>
      <div className="mt-4 space-y-3">
        {picks.length === 0 ? (
          <p className="text-sm text-admin-label">No editor picks available yet.</p>
        ) : (
          picks.map((item, index) => {
            const content = (
              <div className="flex items-start gap-2">
                <p className="text-sm font-inter font-medium text-zbc-gray-500">{index + 1}.</p>
                <h3 className="font-inter text-base font-semibold leading-7 text-zbc-gray-1000 line-clamp-2">
                  {item.title}
                </h3>
              </div>
            );

            if (!item.slug) {
              return <div key={item.id}>{content}</div>;
            }

            return (
              <Link
                key={item.id}
                to={`/news-details/${encodeURIComponent(item.slug)}`}
                className="block rounded-md transition-colors hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
