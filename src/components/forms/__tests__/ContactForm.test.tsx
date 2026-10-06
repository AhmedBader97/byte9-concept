import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ContactForm, validateContact } from '../ContactForm';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  organisation: '',
  topic: 'A Blaze demo',
  message: 'We run a magazine on an old CMS and want to move.',
};

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('requires name, email, topic and a real message', () => {
    const errors = validateContact({ name: ' ', email: '', organisation: '', topic: '', message: 'Hi' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name', 'topic']);
  });

  it('rejects badly formed email addresses', () => {
    expect(validateContact({ ...valid, email: 'ada@example' }).email).toMatch(/name@company.com/);
  });
});

describe('<ContactForm />', () => {
  it('shows an error summary and marks invalid fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    const summary = screen.getByRole('alert');
    expect(summary).toHaveTextContent('Check these 4 fields');
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter your email address');
  });

  it('clears an error as soon as the field is fixed', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    // Focus moves to the error summary on the next frame; wait for it before typing.
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    await user.type(screen.getByLabelText('Name'), 'Ada');
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'false');
  });

  it('confirms without sending anything when the form is valid', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Name'), valid.name);
    await user.type(screen.getByLabelText('Email'), valid.email);
    await user.selectOptions(screen.getByLabelText('What would you like to talk about?'), valid.topic);
    await user.type(screen.getByLabelText('Message'), valid.message);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByRole('heading', { name: 'Thanks, Ada.' })).toBeInTheDocument();
    expect(screen.getByText(/nothing has been sent/)).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ContactForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
