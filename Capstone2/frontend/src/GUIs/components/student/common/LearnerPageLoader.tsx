import React from 'react';

interface LearnerPageLoaderProps {
  title?: string;
  message?: string;
  fullPage?: boolean;
  containerClassName?: string;
}

export function LearnerPageLoader({
  title = 'Loading data...',
  message = 'The system is synchronizing the latest information, please wait a moment.',
  fullPage = true,
  containerClassName = '',
}: LearnerPageLoaderProps) {
  const loaderCard = (
    <div
      className="card border-0 shadow-sm rounded-4 bg-white p-5 my-4 text-center d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: '340px' }}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mb-3"
        style={{
          width: '68px',
          height: '68px',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.12)',
        }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: '2rem', height: '2rem', borderWidth: '0.22em' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <h2 className="h6 fw-bold text-dark mb-1">{title}</h2>
      <p className="text-muted small mb-0" style={{ maxWidth: '420px' }}>
        {message}
      </p>
    </div>
  );

  if (!fullPage) {
    return loaderCard;
  }

  return (
    <main className="main-content">
      <div className={`content-container ${containerClassName}`.trim()}>
        {loaderCard}
      </div>
    </main>
  );
}

export default LearnerPageLoader;
