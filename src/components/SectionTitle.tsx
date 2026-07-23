export default function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-10 w-full rounded-base border-[3px] border-border bg-bg px-6 py-5 text-center shadow-brutal-lg dark:bg-secondaryBlack dark:shadow-brutal-dark-lg">
      <h2 className="text-2xl font-black sm:text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}
