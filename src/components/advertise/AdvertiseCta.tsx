export function AdvertiseCta() {
  return (
    <section className="bg-linear-to-r from-zbc-blue to-zbc-blue-deep py-20 md:py-24">
      <div className="mx-auto container px-4 text-center">
        <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
          Ready to Reach the Most Engaged News Audience Online?
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-7 text-zbc-blue-light md:text-xl">
          Download our media kit for full rate card, audience data, and technical specifications, or book a 30-minute
          strategy call.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-zbc-blue transition-colors hover:bg-white/90 sm:w-auto"
          >
            Request Media Kit
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-white px-8 text-base font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Book a Consultation
          </button>
        </div>
      </div>
    </section>
  );
}
