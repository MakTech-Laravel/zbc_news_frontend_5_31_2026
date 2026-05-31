import { cn } from "@/lib/utils";

type EditorPicksProps = {
    className?: string;
};

const editorPicks = [
    {
        id: "1",
        title: "The Crisis of Truth in Modern Journalism",
    },
    {
        id: "2",
        title: "The Future of Work in the Age of AI",
    },
    {
        id: "3",
        title: "The Future of Work in the Age of AI",
    },
    {
        id: "4",
        title: "The Future of Work in the Age of AI",
    },
];


export function EditorPicks({ className }: EditorPicksProps) {
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
            <div className="mt-4 space-y-1">
                {editorPicks.map((item) => (
                    <div key={item.id}>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-inter font-medium text-zbc-gray-500">{item.id}. </p>
                            <h2 className="font-inter text-base font-semibold leading-8 text-zbc-gray-1000 line-clamp-1">{item.title}</h2>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
