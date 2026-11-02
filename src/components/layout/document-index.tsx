type DocumentIndexProps = {
  sections: readonly { id: string; title: string }[];
};

export function DocumentIndex({ sections }: DocumentIndexProps) {
  return (
    <nav
      aria-labelledby="document-index-title"
      className="rounded-xl border border-border bg-white p-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto"
    >
      <h2
        className="scroll-mt-24 font-serif text-xl font-bold text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
        id="document-index-title"
        tabIndex={-1}
      >
        Nesta página
      </h2>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className="flex min-h-11 items-center rounded-md px-2 py-2 text-sm leading-6 text-aqua-700 hover:bg-aqua-50 hover:text-navy-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-700"
              href={`#${section.id}`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
