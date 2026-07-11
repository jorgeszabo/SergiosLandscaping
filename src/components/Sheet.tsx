"use client";
/* Bottom-sheet modal — used for line-item actions and add-line forms. */
export function Sheet({
  onClose,
  children,
  pad,
}: {
  onClose: () => void;
  children: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <div
      className="menu"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("menu")) onClose();
      }}
    >
      <div className="sheet" style={pad ? { padding: 16 } : undefined}>
        {children}
      </div>
    </div>
  );
}
