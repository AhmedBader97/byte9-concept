import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';
import { TileField } from '@/components/visuals/TileField';
import { company } from '@/content/company';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to Byte9 about Blaze, digital publishing, headless ecommerce and public sector websites.',
};

export default function ContactPage() {
  return (
    <>
      <header className="page-intro">
        <TileField avoid=".container > *" />
        <div className="container">
          <p className="page-intro__eyebrow">Contact</p>
          <h1 className="t-h1 page-intro__title">Let’s talk about what you’re building</h1>
          <p className="t-lead page-intro__lead">
            Digital publishing, headless ecommerce or a public sector service: tell us where you are and we’ll show you how
            Blaze could help. Partnership ideas are welcome too.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-details">
            <div className="contact-details__item">
              <h2>Call</h2>
              <a href={company.phoneHref}>{company.phone}</a>
            </div>
            <div className="contact-details__item">
              <h2>Email</h2>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
            {company.offices.map((office) => (
              <div className="contact-details__item" key={office.name}>
                <h2>{office.name} office</h2>
                <address>
                  {office.lines.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                  {office.postcode}
                </address>
              </div>
            ))}
            <p className="concept-note">
              This form is part of a redesign concept. It validates like the real thing but doesn’t send anything.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
