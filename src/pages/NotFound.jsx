import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-7xl font-extrabold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-ink mb-2">Page Not Found</h2>
        <p className="text-sm text-dark-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
        >
          <FiHome size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
