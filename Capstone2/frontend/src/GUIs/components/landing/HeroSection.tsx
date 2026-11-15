import { hero } from './landingStaticData';
import { useState } from 'react';
import { Icon } from './LandingUI';

export function HeroSection() {
  const [failed, setFailed] = useState(false);
  return (
    <section id="hero" className="et-hero">
      <div className="et-container et-hero-grid">
        <div className="et-hero-copy">
          <span className="et-pill">
            <Icon name="leaf" /> {hero.centerName}
          </span>
          <h1>
            {hero.heading[0]}
            <br className="et-desktop-break" />
            {hero.heading[1]}
            <br className="et-desktop-break" /> <span>{hero.heading[2]}</span>
          </h1>
          <p>{hero.description}</p>
          <div className="et-actions">
            <a className="et-button et-primary" href="#classes">
              <Icon name="book" />
              Explore Classes
              <Icon name="arrow" />
            </a>
            <a className="et-button et-outline" href="#contact">
              <Icon name="calendar" />
              Book a Consultation
            </a>
          </div>
        </div>
        <figure className="et-hero-visual">
          {!failed ? (
            <img
              src={hero.image}
              srcSet={`${hero.mobileImage} 700w, ${hero.image} 1200w`}
              sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1199px) 48vw, 620px"
              width="1200"
              height="800"
              fetchPriority="high"
              alt="Illustration of students learning together around a laptop"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="et-hero-placeholder">
              <Icon name="books" />Room to learn. Space to grow.
            </div>
          )}
        </figure>
      </div>
    </section>
  );
}

export default HeroSection;
