import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { articles } from '@/content/articles';
import { caseStudies } from '@/content/case-studies';
import { jobs } from '@/content/jobs';
import { WorkIndex } from '../WorkIndex';

const strip = <T extends { legacyPaths: string[] }>({ legacyPaths: _legacy, ...rest }: T) => rest;

function setup() {
  const user = userEvent.setup();
  render(<WorkIndex studies={caseStudies.map(strip)} articles={articles.map(strip)} jobs={jobs.map(strip)} />);
  return user;
}

describe('<WorkIndex />', () => {
  it('shows everything by default with counts on each filter', () => {
    setup();
    const total = caseStudies.length + articles.length + jobs.length;
    expect(screen.getByRole('button', { name: `All ${total}` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Case studies' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jobs' })).toBeInTheDocument();
  });

  it('narrows to a single kind', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /^Jobs/ }));
    expect(screen.queryByRole('heading', { name: 'Case studies' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Junior Front End Developer' })).toBeInTheDocument();
  });

  it('filters by keyword and updates the counts', async () => {
    const user = setup();
    await user.type(screen.getByLabelText('Filter by keyword'), 'netsuite');
    expect(screen.getByRole('link', { name: /Oracle NetSuite Commerce/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Case studies 1' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 result');
  });

  it('offers a way out when nothing matches', async () => {
    const user = setup();
    await user.type(screen.getByLabelText('Filter by keyword'), 'zebra');
    expect(screen.getByText(/Nothing matches “zebra”/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filter' }));
    expect(screen.getByLabelText('Filter by keyword')).toHaveValue('');
  });
});
