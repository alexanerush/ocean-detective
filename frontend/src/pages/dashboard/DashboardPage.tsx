import { Link } from 'react-router-dom';
import './DashboardPage.css';

const quickActions = [
  {
    title: 'Satellite Analysis',
    description:
      'Upload multispectral satellite imagery and explore marine debris detection.',
    path: '/analysis',
    label: 'Start analysis',
    number: '01',
  },
  {
    title: 'ML Experiments',
    description:
      'Explore model performance and compare RGB and multispectral approaches.',
    path: '/experiments',
    label: 'Explore experiments',
    number: '02',
  },
  {
    title: 'Analysis History',
    description: 'Access previously submitted satellite images and analysis results.',
    path: '/history',
    label: 'View history',
    number: '03',
  },
];

export default function DashboardPage() {
  return (
    <section className="od-dashboard">
      <div className="od-dashboard-heading">
        <span className="eyebrow">PLATFORM OVERVIEW</span>
        <h2>Dashboard</h2>
        <p>
          A research-oriented platform for marine debris detection and multispectral
          satellite image analysis.
        </p>
      </div>

      <div className="od-dashboard-actions">
        {quickActions.map((action) => (
          <article className="od-dashboard-card" key={action.path}>
            <span className="od-card-number">{action.number}</span>

            <h3>{action.title}</h3>
            <p>{action.description}</p>

            <Link to={action.path} className="od-dashboard-link">
              {action.label} →
            </Link>
          </article>
        ))}
      </div>

      <section className="od-dashboard-card">
        <span className="eyebrow">ABOUT THE PROJECT</span>

        <h3>Marine Debris Detection</h3>

        <p>
          Ocean Detective is designed to support marine pollution monitoring through the
          analysis of multispectral Sentinel-2 satellite imagery and machine learning
          techniques.
        </p>

        <div className="od-dashboard-tags">
          <span>Sentinel-2</span>
          <span>MARIDA</span>
          <span>Multispectral Imagery</span>
          <span>Machine Learning</span>
          <span>Semantic Segmentation</span>
        </div>
      </section>
    </section>
  );
}
