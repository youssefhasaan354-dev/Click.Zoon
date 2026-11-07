import { useParams, Navigate } from 'react-router-dom';

/**
 * CaseStudyPage redirects legacy /work/:slug URLs to the unified /showcase/:slug route.
 * Real projects and portfolio details are read strictly from the database via Showcase.
 */
export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/showcase" replace />;
  }

  return <Navigate to={`/showcase/${slug}`} replace />;
}
