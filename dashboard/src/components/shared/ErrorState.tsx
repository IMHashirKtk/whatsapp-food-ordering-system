type Props = {
  title?: string;
  description?: string;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again later.",
}: Props) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="mt-2 text-gray-500">{description}</p>
      </div>
    </div>
  );
}
