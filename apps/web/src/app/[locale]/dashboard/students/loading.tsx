export default function DashboardStudentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton h-8 w-40 rounded-xl" />
      <div className="skeleton h-10 w-64 rounded-xl" />
      <div className="skeleton h-96 rounded-2xl" />
    </div>
  );
}
