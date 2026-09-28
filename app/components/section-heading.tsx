/** Bold label followed by a rule that fills the remaining width. */
export default function SectionHeading({ children }: { children: string }) {
  return (
    <div className="heading-container mb-6 uppercase">
      <p className="heading">{children}</p>
      <div className="line" />
    </div>
  );
}
