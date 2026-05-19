import { Link } from 'react-router-dom'
import categories from '../data/categories'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            Photo<span>Forge</span>
          </div>
          <p className="footer-tagline">
            Discover the world's finest photography talent. Curated portfolios, authentic stories.
          </p>
          <p className="footer-copy">© {new Date().getFullYear()} PhotoForge. All rights reserved.</p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-heading">Categories</h4>
          <ul className="footer-links">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/categories/${cat.slug}`}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-heading">Explore</h4>
          <ul className="footer-links">
            <li><Link to="/photographers">Photographers</Link></li>
            <li><Link to="/materials">Materials</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4 className="footer-col-heading">Stay Inspired</h4>
          <p className="footer-newsletter-text">
            Get curated photography highlights and new portfolio announcements delivered to your inbox.
          </p>
          <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="footer-newsletter-input"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>Built for photographers and their audiences.</span>
        </div>
      </div>
    </footer>
  )
}
