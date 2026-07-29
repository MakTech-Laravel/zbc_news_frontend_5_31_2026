import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type CareersCtaProps = {
  cta: {
    heading: string;
    description: string;
    button: string;
    buttonUrl: string;
  };
};

export function CareersCta({ cta }: CareersCtaProps) {
  const isInternal = cta.buttonUrl.startsWith("/");

  return (
    <section className="bg-linear-to-br from-zbc-gray-50 to-brand-soft py-20 md:py-24">
      <div className="mx-auto container px-4 text-center">
        <h2 className="text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
          {cta.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-admin-label">
          {cta.description}
        </p>
        {isInternal ? (
          <Link
            to={cta.buttonUrl}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded bg-zbc-blue px-8 text-base font-bold text-white transition-colors hover:bg-zbc-blue-deep"
          >
            {cta.button}
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        ) : (
          <a
            href={cta.buttonUrl}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded bg-zbc-blue px-8 text-base font-bold text-white transition-colors hover:bg-zbc-blue-deep"
          >
            {cta.button}
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        )}
      </div>
    </section>
  );
}
