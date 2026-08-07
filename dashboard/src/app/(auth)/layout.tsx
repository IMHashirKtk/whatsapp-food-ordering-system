type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
