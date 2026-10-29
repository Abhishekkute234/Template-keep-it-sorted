/** Keep It Sorted logo, served unchanged from /public/logo.jpg. */
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.jpg"
      width={size}
      height={size}
      alt="Keep It Sorted logo"
      className={className}
      style={{ borderRadius: "50%", display: "block", flex: "none" }}
    />
  );
}
