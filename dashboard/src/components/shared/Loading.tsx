export default function Loading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"
          role="status"
          aria-label="Loading"
        />

        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
