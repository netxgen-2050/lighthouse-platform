/** Avatar placeholder de Hifa: sol dorado con filamentos de micelio que bajan y se ramifican. */
export function AvatarHifa({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={className}>
      <circle cx="24" cy="18" r="11" className="fill-gold stroke-gold-ink" strokeWidth="1.5" />
      <g className="stroke-green" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M24 29 V38 M24 34 C20 36 17 38 15 43 M24 34 C28 36 31 38 33 43" />
        <path d="M18 28 C15 32 12 34 9 36 M30 28 C33 32 36 34 39 36" />
        <path d="M24 38 V45" />
      </g>
      <circle cx="9" cy="36" r="1.6" className="fill-green" />
      <circle cx="39" cy="36" r="1.6" className="fill-green" />
      <circle cx="15" cy="43" r="1.6" className="fill-green" />
      <circle cx="33" cy="43" r="1.6" className="fill-green" />
      <circle cx="24" cy="45" r="1.6" className="fill-green" />
    </svg>
  );
}
