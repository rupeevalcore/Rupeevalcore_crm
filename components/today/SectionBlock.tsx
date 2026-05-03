export function SectionBlock({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description?: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="card card-queue">
      <div className="card-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-subtitle">{description}</p> : null}
        </div>
        <span className="badge badge-gray">{count}</span>
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
