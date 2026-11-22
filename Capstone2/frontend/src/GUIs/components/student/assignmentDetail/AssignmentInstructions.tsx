import React from 'react';

interface AssignmentInstructionsProps {
  description?: string | null;
}

export function AssignmentInstructions({ description }: AssignmentInstructionsProps) {
  return (
    <section className="mb-4">
      <h2 className="asg-section-heading">Instructions</h2>
      <div className="asg-instructions-card">
        {description ? (
          <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{description}</p>
        ) : (
          <p className="text-muted mb-0">No additional instructions provided.</p>
        )}
      </div>
    </section>
  );
};

export default AssignmentInstructions;
