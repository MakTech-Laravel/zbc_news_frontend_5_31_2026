import { cn } from "@/lib/utils";

const editorialBoard = [
    {
        id: "1",
        name: "John Doe",
        title: "Editor-in-Chief",
        description: "John Doe is the editor-in-chief of our editorial board.",
    },
    {
        id: "2",
        name: "Jane Doe",
        title: "Editor",
        description: "Jane Doe is the editor of our editorial board.",
    },
    
];

type AboutProps = {
    className?: string;
};

export function About({ className }: AboutProps) {
    return (
        <section
            className={cn(
                "w-full rounded-[14px] border border-border-light bg-white p-6 mt-4",
                className,
            )}
        >
            <h2 className="flex items-center gap-2 font-inter text-base font-medium leading-8 text-ink-heading">
                About Our Editorial Board
            </h2>
            <p className="font-inter text-sm font-normal leading-6 text-zbc-gray-1000">Our editorial team brings decades of journalism experience and diverse perspectives to provide thoughtful analysis on the issues that matter most.</p>
            <div className="mt-4 space-y-1">
                {editorialBoard.map((item) => (
                    <div key={item.id}>
                        <div className="bg-zbc-gray-200 text-zbc-gray-1000 rounded-lg p-4">
                            <h3 className="font-inter text-base font-semibold leading-8 text-zbc-gray-1000 line-clamp-1">{item.name}. </h3>
                            <h2 className=" text-xs font-inter font-medium text-zbc-gray-500">{item.title}</h2>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}