import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
};

// min-h-11 = 44px tall, big enough to tap with a thumb
export default function Button({ href, children, variant = "primary" }: Props) {
  const base =
    "inline-flex items-center justify-center min-h-11 px-5 rounded-full font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-eucalyptus text-white hover:bg-ink"
      : "border-[1.5px] border-ink text-ink hover:bg-white";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}