'use client';

import { useRef, useState } from 'react';
import { company } from '@/content/company';

export interface ContactValues {
  name: string;
  email: string;
  organisation: string;
  topic: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validation rules, kept pure so they can be unit tested. */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = 'Enter your name';
  if (!values.email.trim()) errors.email = 'Enter your email address';
  else if (!EMAIL.test(values.email.trim())) errors.email = 'Enter an email address like name@company.com';
  if (!values.topic) errors.topic = 'Choose what you’d like to talk about';
  if (values.message.trim().length < 20) errors.message = 'Tell us a little more: at least 20 characters';
  return errors;
}

const FIELD_ORDER: (keyof ContactValues)[] = ['name', 'email', 'topic', 'message'];

const TOPICS = ['A Blaze demo', 'A new website or app', 'Moving an existing site to Blaze', 'Partnership', 'Something else'];

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', organisation: '', topic: '', message: '' });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const update = (field: keyof ContactValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    // Clear a field's error as soon as it's fixed.
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitted(true);
    requestAnimationFrame(() => successRef.current?.focus());
  };

  if (submitted) {
    const subject = encodeURIComponent(`${values.topic} enquiry from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\n${values.name}${values.organisation ? `, ${values.organisation}` : ''}`);
    return (
      <div className="form-success">
        <h2 ref={successRef} tabIndex={-1}>
          Thanks, {values.name.split(' ')[0]}.
        </h2>
        <p>
          This is a redesign concept, so nothing has been sent. To reach Byte9, email{' '}
          <a href={`mailto:${company.email}`}>{company.email}</a> or call <a href={company.phoneHref}>{company.phone}</a>.
        </p>
        <a className="button button--primary" href={`mailto:${company.email}?subject=${subject}&body=${body}`}>
          Open this message in your email
        </a>
      </div>
    );
  }

  const errorKeys = FIELD_ORDER.filter((key) => errors[key]);
  const describedBy = (field: keyof ContactValues, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <form className="form" noValidate onSubmit={onSubmit} aria-label="Contact Byte9">
      {errorKeys.length > 0 && (
        <div className="form__summary" ref={summaryRef} tabIndex={-1} role="alert">
          <h2>Check {errorKeys.length === 1 ? 'this field' : `these ${errorKeys.length} fields`}</h2>
          <ul>
            {errorKeys.map((key) => (
              <li key={key}>
                <a href={`#${key}`}>{errors[key]}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form__row">
        <div className="form__field">
          <label className="form__label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
          />
          {errors.name && (
            <p className="form__error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
          />
          {errors.email && (
            <p className="form__error" id="email-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="form__row">
        <div className="form__field">
          <label className="form__label" htmlFor="organisation">
            Organisation <span className="form__optional">(optional)</span>
          </label>
          <input
            id="organisation"
            className="input"
            autoComplete="organization"
            value={values.organisation}
            onChange={update('organisation')}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="topic">
            What would you like to talk about?
          </label>
          <select
            id="topic"
            className="input"
            value={values.topic}
            onChange={update('topic')}
            aria-invalid={Boolean(errors.topic)}
            aria-describedby={describedBy('topic')}
          >
            <option value="">Choose one</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic && (
            <p className="form__error" id="topic-error">
              {errors.topic}
            </p>
          )}
        </div>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="message">
          Message
        </label>
        <p className="form__hint" id="message-hint">
          What do you run today, and what would you like to change?
        </p>
        <textarea
          id="message"
          className="input"
          value={values.message}
          onChange={update('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message', 'message-hint')}
        />
        {errors.message && (
          <p className="form__error" id="message-error">
            {errors.message}
          </p>
        )}
      </div>

      <div className="button-row">
        <button type="submit" className="button button--primary">
          Send message
        </button>
        <p className="form__note">Concept site: messages aren’t sent anywhere.</p>
      </div>
    </form>
  );
}
