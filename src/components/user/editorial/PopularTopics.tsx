import { cn } from "@/lib/utils";

type PopularTopicsProps = {
    className?: string;
};

const tags = [
    {
        id: "1",
        title: "Climate",
    },
    {
        id: "2",
        title: "Politics",
    },
    {
        id: "3",
        title: "Business",
    },
    {
        id: "4",
        title: "Sports",
    },
    {
        id: "4",
        title: "Technology",
    },
    {
        id: "4",
        title: "Health",
    },
    {
        id: "4",
        title: "Entertainment",
    },
];

export function PopularTopics({ className }: PopularTopicsProps) {
    return (
        <section
            className={cn(
                "w-full rounded-[14px] border border-border-light bg-white p-6 mt-4",
                className,
            )}
        >
            <h2 className="flex items-center gap-2 font-inter text-base font-medium leading-8 text-ink-heading">
                Editor Picks
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
                {tags.map((item) => (
                    <div key={item.id}>
                        <p className="bg-zbc-gray-200 text-zbc-gray-1000 text-center font-inter text-base font-semibold leading-8 py-0.5 px-1.5 rounded-lg">{item.title}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
