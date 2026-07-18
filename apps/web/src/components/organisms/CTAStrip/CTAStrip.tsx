import { Link } from "@/i18n/navigation";

interface CTAStripProps {
  heading: string;
  buttonLabel: string;
}

export function CTAStrip({ heading, buttonLabel }: CTAStripProps) {
  return (
    <section className="py-16">
      <div className="rounded-3xl bg-primary/10 border border-primary/20 p-10 md:p-16 text-center flex flex-col items-center gap-6">
        <h2 className="text-2xl md:text-3xl font-bold text-base-content">{heading}</h2>
        <Link href="/register" className="btn btn-primary btn-lg">
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
