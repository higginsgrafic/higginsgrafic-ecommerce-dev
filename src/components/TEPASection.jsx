
function TEPASection({
  title,
  children,
  className = '',
  containerClassName = 'max-w-7xl mx-auto px-4 lg:px-8',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10',
}) {
  return (
    <div className={containerClassName}>
      <div className={`border-t border-line pt-12 pb-12 ${className}`.trim()}>
        {title ? (
          <h2 className="font-roboto text-[15px] font-normal mb-6" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
            {title}
          </h2>
        ) : null}

        <div className={gridClassName}>{children}</div>
      </div>
    </div>
  );
}

export default TEPASection;
