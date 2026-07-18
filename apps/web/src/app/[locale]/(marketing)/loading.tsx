export default function MarketingHomeLoading() {
  return (
    <div className="flex flex-col gap-6 py-16">
      <div className="skeleton mx-auto h-10 w-2/3 max-w-xl rounded-xl" />
      <div className="skeleton mx-auto h-6 w-1/2 max-w-md rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
