export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
