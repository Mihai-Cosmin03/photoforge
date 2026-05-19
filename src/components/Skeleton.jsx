import './Skeleton.css'

/**
 * Generic skeleton block.
 * @param {string}  className  extra class names
 * @param {object}  style      inline overrides (width, height, borderRadius…)
 */
export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

/** Card skeleton that matches CategoryCard / PortfolioCard proportions */
export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__image" />
      <div className="skeleton-card__body">
        <Skeleton className="skeleton-card__title" />
        <Skeleton className="skeleton-card__line" />
        <Skeleton className="skeleton-card__line skeleton-card__line--short" />
      </div>
    </div>
  )
}

/** Photographer card skeleton */
export function PhotographerCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <Skeleton className="skeleton-card__avatar" />
        <Skeleton className="skeleton-card__badge" />
      </div>
      <div className="skeleton-card__body">
        <Skeleton className="skeleton-card__title" />
        <Skeleton className="skeleton-card__line skeleton-card__line--short" />
        <div className="skeleton-card__pills">
          <Skeleton className="skeleton-card__pill" />
          <Skeleton className="skeleton-card__pill" />
        </div>
      </div>
    </div>
  )
}

/** Grid of n card skeletons */
export function CardGridSkeleton({ count = 6, type = 'card' }) {
  const Component = type === 'photographer' ? PhotographerCardSkeleton : CardSkeleton
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}
