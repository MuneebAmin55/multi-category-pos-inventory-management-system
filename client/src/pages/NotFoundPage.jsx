/**
 * @file src/pages/NotFoundPage.jsx
 * @description 404 page displayed for unmatched routes.
 */

import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-slate-200">404</h1>
        <p className="text-xl font-semibold text-slate-700 mt-4">Page Not Found</p>
        <p className="text-slate-500 mt-2 max-w-md">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <HiOutlineHome className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
