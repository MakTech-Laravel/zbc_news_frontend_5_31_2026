import type { EditorialBoardMember } from "@/services/user/editorial";
import { cn } from "@/lib/utils";

type AboutProps = {
  members: EditorialBoardMember[];
  className?: string;
};

export function About({ members, className }: AboutProps) {
  return (
    <section
      className={cn(
        "mt-4 w-full rounded-[14px] border border-border-light bg-white p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-inter text-base font-medium leading-8 text-ink-heading">
        About Our Editorial Board
      </h2>
      <p className="font-inter text-sm font-normal leading-6 text-zbc-gray-1000">
        Our editorial team brings decades of journalism experience and diverse perspectives
        to provide thoughtful analysis on the issues that matter most.
      </p>
      <div className="mt-4 space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-admin-label">Contributors will appear here from published editorials.</p>
        ) : (
          members.map((item) => (
            <div key={item.id} className="rounded-lg bg-zbc-gray-200 p-4 text-zbc-gray-1000">
              <h3 className="line-clamp-1 font-inter text-base font-semibold leading-8 text-zbc-gray-1000">
                {item.name}
              </h3>
              <p className="text-xs font-inter font-medium text-zbc-gray-500">{item.title}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
