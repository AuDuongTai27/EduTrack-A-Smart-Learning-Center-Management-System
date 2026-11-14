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
          <>
            <p>
              Please complete <strong>all</strong> exercises in the attached file below. Exercises include the following types:
            </p>
            <ul>
              <li>Solving quadratic equations using the <em>factorization method</em></li>
              <li>Applying general and reduced quadratic formulas</li>
              <li>Discussing the number of roots based on parameter m (10 exercises)</li>
              <li>Real-world problems related to quadratic equations (3 problems)</li>
            </ul>
            <p className="note-text mb-0">
              Present clearly with all steps shown. Submit a PDF file or high-quality photos of your work.{' '}
              <strong className="text-dark">Submissions with missing steps or blurry photos will not be accepted.</strong>
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default AssignmentInstructions;
