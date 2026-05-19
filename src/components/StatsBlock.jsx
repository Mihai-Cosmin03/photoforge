export default function StatsBlock({ totalCategories, totalPortfolios, totalPhotographers }) {
  const stats = [
    { value: totalCategories, label: 'Categories' },
    { value: totalPortfolios, label: 'Curated Portfolios' },
    { value: totalPhotographers, label: 'Professionals' },
  ]

  return (
    <div className="stats-block">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
