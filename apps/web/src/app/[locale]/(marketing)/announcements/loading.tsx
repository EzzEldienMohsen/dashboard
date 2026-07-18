export default function AnnouncementsLoading() {
  return (
    <div className="flex flex-col gap-8 py-16">
      <div className="skeleton mx-auto h-10 w-2/3 max-w-xl rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
