export default function HomeLoading() {
  return (
    <main className="w-full px-container-margin py-xl">
      <div className="mx-auto max-w-3xl space-y-md" style={{ paddingTop: "7rem" }}>
        <div className="mx-auto h-36 w-40 rounded-2xl bg-surface-container" />
        <div className="mx-auto h-8 w-72 rounded bg-surface-container" />
        <div className="mx-auto h-16 w-full max-w-xl rounded bg-surface-container-low" />
      </div>
    </main>
  );
}
