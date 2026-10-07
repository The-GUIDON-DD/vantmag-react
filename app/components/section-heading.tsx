/** Calluna heading followed by a rule that fills the remaining width. */
export default function SectionHeading({ children }: { children: string }) {
  return (
    <div className="heading-container mb-6">
      <h3>{children}</h3>
      <div className="line" />
    </div>
  );
}
