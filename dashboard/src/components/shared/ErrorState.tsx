type Props = {
  title?: string;
  description?: string;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again later.",
}: Props) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-border bg-card p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
