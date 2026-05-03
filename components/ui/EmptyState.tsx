export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div>
        <p className="empty-state__title">{title}</p>
        {description ? <p className="empty-state__description">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
