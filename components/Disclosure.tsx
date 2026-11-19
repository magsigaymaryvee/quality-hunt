// The affiliate disclosure. Use it in the footer and above any buy links.
type Props = { tone?: "light" | "dark" };

export default function Disclosure({ tone = "light" }: Props) {
  const style = tone === "dark" ? "text-wall" : "bg-wall text-ink rounded-2xl p-4";
  return (
    <p className={`text-sm leading-relaxed ${style}`}>
      We may earn a commission when you buy through links on this site, at no extra
      cost to you. As an Amazon Associate I earn from qualifying purchases.
    </p>
  );
}