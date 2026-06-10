import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import UserAvatar, { getDefaultAvatarIndex } from '../components/UserAvatar'
import {
  getPendingPortfolios,
  approvePortfolio,
  rejectPortfolio,
  deleteEmptyPortfolios,
  getPendingPhotographers,
  approvePhotographer,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getGlobalStats,
  adminUpdateCategory,
  adminToggleFeatured,
  getAllReviews,
  deleteReview,
  getAuditLog,
} from '../services/adminService'
import { getAllCategories } from '../services/categoriesService'
import { CardGridSkeleton } from '../components/Skeleton'
import './Admin.css'

const TAB_PORTFOLIOS    = 'portfolios'
const TAB_PHOTOGRAPHERS = 'photographers'
const TAB_USERS         = 'users'
const TAB_STATS         = 'stats'
const TAB_CATEGORIES    = 'categories'
const TAB_REVIEWS       = 'reviews'
const TAB_AUDITLOG      = 'auditlog'

const ROLE_LABELS = { user: 'User', photographer: 'Photographer', admin: 'Admin' }

const ACTION_LABELS = {
  approve_portfolio:   'Approved portfolio',
  reject_portfolio:    'Rejected portfolio',
  approve_photographer:'Approved photographer',
  change_role:         'Changed user role',
  delete_user:         'Deleted user',
  delete_review:       'Deleted review',
}

export default function Admin() {
  const { user, token } = useAuth()
  const toast = useToast()

  const [tab, setTab]                         = useState(TAB_PORTFOLIOS)
  const [portfolios, setPortfolios]           = useState([])
  const [photographers, setPhotographers]     = useState([])
  const [users, setUsers]                     = useState([])
  const [globalStats, setGlobalStats]         = useState(null)
  const [categories, setCategories]           = useState([])
  const [editingCategory, setEditingCategory] = useState(null)
  const [reviews, setReviews]                 = useState([])
  const [auditLog, setAuditLog]               = useState([])
  const [loadingData, setLoadingData]         = useState(true)
  const [actionIds, setActionIds]             = useState(new Set())
  const [userSearch, setUserSearch]           = useState('')
  const [roleFilter, setRoleFilter]           = useState('all')
  const [confirmDelete, setConfirmDelete]     = useState(null)

  const loadAll = useCallback(async () => {
    if (!token || !user || user.role !== 'admin') { setLoadingData(false); return }
    setLoadingData(true)
    try {
      const [pf, ph, us, stats, cats, revs, log] = await Promise.all([
        getPendingPortfolios(token),
        getPendingPhotographers(token),
        getAllUsers(token),
        getGlobalStats(token),
        getAllCategories(),
        getAllReviews(token),
        getAuditLog(token),
      ])
      setPortfolios(pf)
      setPhotographers(ph.filter((p) => p.status !== 'approved'))
      setUsers(us)
      setGlobalStats(stats)
      setCategories(cats)
      setReviews(revs?.data ?? revs)
      setAuditLog(log)
    } catch {
      toast.error('Failed to load admin data.')
    } finally {
      setLoadingData(false)
    }
  }, [token, user])

  useEffect(() => { loadAll() }, [loadAll])

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  const withAction = async (id, fn, successMsg, failMsg) => {
    setActionIds((prev) => new Set(prev).add(id))
    try {
      await fn()
      toast.success(successMsg)
      await loadAll()
    } catch {
      toast.error(failMsg)
    } finally {
      setActionIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const pendingCount = portfolios.length + photographers.length

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleRoleChange = (userId, newRole) => {
    withAction(
      userId,
      () => updateUserRole(token, userId, newRole),
      'Role updated successfully.',
      'Failed to update role.',
    )
  }

  const handleDeleteUser = (userId) => {
    withAction(
      userId,
      () => deleteUser(token, userId),
      'User deleted.',
      'Failed to delete user.',
    )
    setConfirmDelete(null)
  }

  return (
    <div className="admin-page">
      <div className="page-container">

        {/* ── Header ─────────────────────────────────── */}
        <div className="admin-header">
          <div>
            <span className="section-eyebrow">Dashboard</span>
            <h1 className="admin-title">Admin Panel</h1>
          </div>
          {pendingCount > 0 && (
            <span className="admin-pending-badge">{pendingCount} pending</span>
          )}
        </div>

        {/* ── Stats row ───────────────────────────────── */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{portfolios.length}</span>
            <span className="admin-stat-label">Pending Portfolios</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{photographers.length}</span>
            <span className="admin-stat-label">Pending Photographers</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{users.length}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">
              {users.filter((u) => u.role === 'photographer').length}
            </span>
            <span className="admin-stat-label">Photographers</span>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────── */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === TAB_PORTFOLIOS ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_PORTFOLIOS)}
          >
            Portfolios
            {portfolios.length > 0 && (
              <span className="admin-tab-count">{portfolios.length}</span>
            )}
          </button>
          <button
            className={`admin-tab ${tab === TAB_PHOTOGRAPHERS ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_PHOTOGRAPHERS)}
          >
            Photographers
            {photographers.length > 0 && (
              <span className="admin-tab-count">{photographers.length}</span>
            )}
          </button>
          <button
            className={`admin-tab ${tab === TAB_USERS ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_USERS)}
          >
            Users
            <span className="admin-tab-count admin-tab-count--neutral">{users.length}</span>
          </button>
          <button
            className={`admin-tab ${tab === TAB_STATS ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_STATS)}
          >
            Statistics
          </button>
          <button
            className={`admin-tab ${tab === TAB_CATEGORIES ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_CATEGORIES)}
          >
            Categories
          </button>
          <button
            className={`admin-tab ${tab === TAB_REVIEWS ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_REVIEWS)}
          >
            Reviews
            <span className="admin-tab-count admin-tab-count--neutral">{reviews.length}</span>
          </button>
          <button
            className={`admin-tab ${tab === TAB_AUDITLOG ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(TAB_AUDITLOG)}
          >
            Audit Log
            {auditLog.length > 0 && (
              <span className="admin-tab-count admin-tab-count--neutral">{auditLog.length}</span>
            )}
          </button>
        </div>

        {/* ── Content ─────────────────────────────────── */}
        {loadingData ? (
          <CardGridSkeleton count={4} />
        ) : (
          <AnimatePresence mode="wait">
            {tab === TAB_PORTFOLIOS && (
              <motion.div
                key="portfolios"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <button
                    className="btn-ghost btn-sm admin-btn-reject"
                    onClick={async () => {
                      if (!window.confirm('Delete all portfolios with no images?')) return
                      try {
                        const { deleted } = await deleteEmptyPortfolios(token)
                        toast.success(`Deleted ${deleted} empty portfolio${deleted !== 1 ? 's' : ''}.`)
                        setPortfolios((prev) => prev.filter((p) => p.images?.length > 0))
                      } catch {
                        toast.error('Failed to delete empty portfolios.')
                      }
                    }}
                  >
                    Delete empty portfolios
                  </button>
                </div>
                {portfolios.length === 0 ? (
                  <div className="empty-state">
                    <h3>All caught up!</h3>
                    <p>No portfolios are pending review.</p>
                  </div>
                ) : (
                  <div className="admin-list">
                    {portfolios.map((p) => (
                      <div key={p.id} className="admin-item">
                        <img
                          src={p.coverImage || '/uploads/placeholder.jpg'}
                          alt={p.title}
                          className="admin-item__thumb"
                        />
                        <div className="admin-item__info">
                          <h3 className="admin-item__title">{p.title}</h3>
                          <p className="admin-item__meta">
                            {p.description?.slice(0, 100)}…
                          </p>
                          <span className="pill" style={{ marginTop: 4 }}>
                            {p.status}
                          </span>
                        </div>
                        <div className="admin-item__actions">
                          <button
                            className="btn-primary btn-sm"
                            disabled={actionIds.has(p.id)}
                            onClick={() =>
                              withAction(
                                p.id,
                                () => approvePortfolio(token, p.id),
                                `"${p.title}" approved.`,
                                'Failed to approve portfolio.',
                              )
                            }
                          >
                            {actionIds.has(p.id) ? '…' : 'Approve'}
                          </button>
                          <button
                            className="btn-ghost btn-sm admin-btn-reject"
                            disabled={actionIds.has(p.id)}
                            onClick={() =>
                              withAction(
                                p.id,
                                () => rejectPortfolio(token, p.id),
                                `"${p.title}" rejected.`,
                                'Failed to reject portfolio.',
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === TAB_PHOTOGRAPHERS && (
              <motion.div
                key="photographers"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {photographers.length === 0 ? (
                  <div className="empty-state">
                    <h3>All caught up!</h3>
                    <p>No photographers are pending review.</p>
                  </div>
                ) : (
                  <div className="admin-list">
                    {photographers.map((ph) => (
                      <div key={ph.id} className="admin-item">
                        <img
                          src={ph.avatar || '/uploads/placeholder.jpg'}
                          alt={ph.name}
                          className="admin-item__thumb admin-item__thumb--round"
                        />
                        <div className="admin-item__info">
                          <h3 className="admin-item__title">{ph.name}</h3>
                          <p className="admin-item__meta">
                            {ph.city} · {ph.experience} years experience
                          </p>
                          <div className="specialty-pills" style={{ marginTop: 4 }}>
                            {ph.specialties?.map((s) => (
                              <span key={s} className="pill">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="admin-item__actions">
                          <button
                            className="btn-primary btn-sm"
                            disabled={actionIds.has(ph.id)}
                            onClick={() =>
                              withAction(
                                ph.id,
                                () => approvePhotographer(token, ph.id),
                                `${ph.name} approved.`,
                                'Failed to approve photographer.',
                              )
                            }
                          >
                            {actionIds.has(ph.id) ? '…' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === TAB_USERS && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="admin-users-toolbar">
                  <input
                    className="admin-search"
                    type="search"
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <div className="admin-role-filters">
                    {['all', 'user', 'photographer', 'admin'].map((r) => (
                      <button
                        key={r}
                        className={`admin-role-filter ${roleFilter === r ? 'admin-role-filter--active' : ''}`}
                        onClick={() => setRoleFilter(r)}
                      >
                        {r === 'all' ? 'All roles' : ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-users-table-wrap">
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="admin-users-empty">
                            No users match your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className={actionIds.has(u.id) ? 'admin-user-row--loading' : ''}>
                            <td className="admin-user-name-cell">
                              <UserAvatar
                                user={u}
                                size={34}
                                avatarIndex={u.avatar ? null : getDefaultAvatarIndex(u)}
                                className="admin-user-avatar"
                              />
                              <span className="admin-user-name">{u.name}</span>
                              {u.id === user.id && (
                                <span className="admin-user-you">you</span>
                              )}
                            </td>
                            <td className="admin-user-email">{u.email}</td>
                            <td>
                              <select
                                className={`admin-role-select admin-role-select--${u.role}`}
                                value={u.role}
                                disabled={u.id === user.id || actionIds.has(u.id)}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              >
                                <option value="user">User</option>
                                <option value="photographer">Photographer</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="admin-user-date">
                              {new Date(u.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </td>
                            <td>
                              <button
                                className="admin-delete-btn"
                                disabled={u.id === user.id || actionIds.has(u.id)}
                                title={u.id === user.id ? 'Cannot delete your own account' : 'Delete user'}
                                onClick={() => setConfirmDelete(u)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {tab === TAB_STATS && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {!globalStats ? (
                  <div className="empty-state"><p>Loading statistics…</p></div>
                ) : (
                  <>
                    <div className="admin-global-stats">
                      {[
                        { label: 'Total Users',   value: globalStats.totals.users },
                        { label: 'Photographers', value: globalStats.totals.photographers },
                        { label: 'Portfolios',    value: globalStats.totals.portfolios },
                        { label: 'Bookings',      value: globalStats.totals.bookings },
                        { label: 'Reviews',       value: globalStats.totals.reviews },
                      ].map(s => (
                        <div key={s.label} className="admin-stat-card">
                          <span className="admin-stat-value">{s.value.toLocaleString()}</span>
                          <span className="admin-stat-label">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="admin-charts-row">
                      <div className="admin-chart-card">
                        <h3 className="admin-chart-title">New registrations (last 6 months)</h3>
                        {globalStats.usersByMonth.length === 0 ? (
                          <p className="admin-chart-empty">No data yet</p>
                        ) : (
                          <div className="admin-bar-chart">
                            {globalStats.usersByMonth.map(d => {
                              const max = Math.max(...globalStats.usersByMonth.map(x => parseInt(x.count, 10)), 1)
                              const pct = (parseInt(d.count, 10) / max) * 100
                              return (
                                <div key={d.month} className="admin-bar-col">
                                  <span className="admin-bar-count">{d.count}</span>
                                  <div className="admin-bar-wrap">
                                    <div className="admin-bar" style={{ height: `${Math.max(pct, 4)}%` }} />
                                  </div>
                                  <span className="admin-bar-label">{d.month}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div className="admin-chart-card">
                        <h3 className="admin-chart-title">Bookings by status</h3>
                        <div className="admin-donut-list">
                          {Object.entries(globalStats.bookingsByStatus).map(([status, count]) => (
                            <div key={status} className="admin-donut-row">
                              <div className={`admin-donut-dot admin-donut-dot--${status}`} />
                              <span className="admin-donut-label">{status}</span>
                              <span className="admin-donut-value">{count}</span>
                            </div>
                          ))}
                          {Object.keys(globalStats.bookingsByStatus).length === 0 && (
                            <p className="admin-chart-empty">No bookings yet</p>
                          )}
                        </div>
                        <h3 className="admin-chart-title" style={{ marginTop: 24 }}>Portfolios by status</h3>
                        <div className="admin-donut-list">
                          {Object.entries(globalStats.portfoliosByStatus).map(([status, count]) => (
                            <div key={status} className="admin-donut-row">
                              <div className={`admin-donut-dot admin-donut-dot--${status}`} />
                              <span className="admin-donut-label">{status}</span>
                              <span className="admin-donut-value">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="admin-chart-card">
                        <h3 className="admin-chart-title">Users by role</h3>
                        <div className="admin-donut-list">
                          {Object.entries(globalStats.usersByRole).map(([role, count]) => (
                            <div key={role} className="admin-donut-row">
                              <div className={`admin-donut-dot admin-donut-dot--${role}`} />
                              <span className="admin-donut-label">{role}</span>
                              <span className="admin-donut-value">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {tab === TAB_CATEGORIES && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="admin-list">
                  {categories.map((cat) => (
                    <div key={cat.id} className="admin-item admin-cat-item">
                      {cat.coverImage && (
                        <img src={cat.coverImage} alt={cat.name} className="admin-item__thumb" />
                      )}
                      <div className="admin-item__info">
                        <h3 className="admin-item__title">{cat.name}</h3>
                        <p className="admin-item__meta">/{cat.slug}</p>
                        {cat.description && (
                          <p className="admin-item__meta" style={{ marginTop: 4 }}>
                            {cat.description.slice(0, 80)}…
                          </p>
                        )}
                      </div>
                      <div className="admin-item__actions">
                        <button
                          className={`admin-featured-toggle ${cat.featured ? 'admin-featured-toggle--on' : ''}`}
                          onClick={async () => {
                            const updated = await adminToggleFeatured(token, cat.id, !cat.featured)
                            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, featured: updated?.featured ?? !cat.featured } : c))
                          }}
                        >
                          {cat.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => setEditingCategory({ ...cat })}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === TAB_REVIEWS && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {reviews.length === 0 ? (
                  <div className="empty-state"><h3>No reviews yet</h3></div>
                ) : (
                  <div className="admin-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="admin-item">
                        <div className="admin-item__info">
                          <div className="admin-review-header">
                            <span className="admin-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                            <span className="admin-review-author">by {r.user?.name ?? 'Anonymous'}</span>
                            <span className="admin-review-target">→ {r.photographer?.name}</span>
                            <span className="admin-review-date">
                              {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {r.text && <p className="admin-item__meta" style={{ marginTop: 6 }}>{r.text}</p>}
                        </div>
                        <div className="admin-item__actions">
                          <button
                            className="admin-delete-btn"
                            disabled={actionIds.has(r.id)}
                            onClick={() =>
                              withAction(
                                r.id,
                                () => deleteReview(token, r.id),
                                'Review deleted.',
                                'Failed to delete review.',
                              ).then(() => setReviews(prev => prev.filter(x => x.id !== r.id)))
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === TAB_AUDITLOG && (
              <motion.div
                key="auditlog"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {auditLog.length === 0 ? (
                  <div className="empty-state">
                    <h3>No audit entries yet</h3>
                    <p>Admin actions will appear here.</p>
                  </div>
                ) : (
                  <div className="admin-users-table-wrap">
                    <table className="admin-users-table">
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Admin</th>
                          <th>Action</th>
                          <th>Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLog.map((entry) => (
                          <tr key={entry.id}>
                            <td className="admin-user-date" style={{ whiteSpace: 'nowrap' }}>
                              {new Date(entry.createdAt).toLocaleString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td className="admin-user-name-cell">
                              <div className="admin-user-avatar">{entry.adminName?.charAt(0).toUpperCase()}</div>
                              <span className="admin-user-name">{entry.adminName}</span>
                            </td>
                            <td>
                              <span className={`admin-audit-action admin-audit-action--${entry.action}`}>
                                {ACTION_LABELS[entry.action] ?? entry.action}
                              </span>
                            </td>
                            <td className="admin-audit-target">{entry.target ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Edit category modal ──────────────────────────────────────── */}
        <AnimatePresence>
          {editingCategory && (
            <motion.div
              className="admin-modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingCategory(null)}
            >
              <motion.div
                className="admin-modal admin-modal--wide"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="admin-modal__title">Edit "{editingCategory.name}"</h3>
                <div className="admin-cat-form">
                  {[
                    { key: 'name',         label: 'Name' },
                    { key: 'heroTitle',    label: 'Hero Title' },
                    { key: 'heroSubtitle', label: 'Hero Subtitle' },
                    { key: 'description',  label: 'Description' },
                    { key: 'coverImage',   label: 'Cover Image URL' },
                  ].map(({ key, label }) => (
                    <div key={key} className="admin-cat-field">
                      <label className="admin-cat-label">{label}</label>
                      <input
                        className="admin-cat-input"
                        value={editingCategory[key] || ''}
                        onChange={e => setEditingCategory(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="admin-modal__actions">
                  <button className="btn-ghost btn-sm" onClick={() => setEditingCategory(null)}>Cancel</button>
                  <button
                    className="btn-primary btn-sm"
                    onClick={async () => {
                      await adminUpdateCategory(token, editingCategory.id, editingCategory)
                      setCategories(prev => prev.map(c => c.id === editingCategory.id ? editingCategory : c))
                      toast.success(`"${editingCategory.name}" updated.`)
                      setEditingCategory(null)
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Confirm delete modal ─────────────────────────────────────── */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              className="admin-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
            >
              <motion.div
                className="admin-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="admin-modal__title">Delete account?</h3>
                <p className="admin-modal__body">
                  You are about to permanently delete <strong>{confirmDelete.name}</strong>'s account
                  ({confirmDelete.email}). This action cannot be undone.
                </p>
                <div className="admin-modal__actions">
                  <button className="btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                    Cancel
                  </button>
                  <button
                    className="btn-sm admin-modal__confirm-delete"
                    onClick={() => handleDeleteUser(confirmDelete.id)}
                  >
                    Yes, delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
