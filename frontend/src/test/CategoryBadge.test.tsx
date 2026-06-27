import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { RecordCategory } from '../types';

describe('CategoryBadge', () => {
  it('renders with correct category text', () => {
    render(<CategoryBadge category="Prescription" />);
    expect(screen.getByText('Prescription')).toBeInTheDocument();
  });

  it('applies correct styling for Prescription category', () => {
    const { container } = render(<CategoryBadge category="Prescription" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-[#EFF6FF]');
    expect(badge).toHaveClass('text-[#1D4ED8]');
  });

  it('applies correct styling for Lab Report category', () => {
    const { container } = render(<CategoryBadge category="Lab Report" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-[#F5F3FF]');
    expect(badge).toHaveClass('text-[#6D28D9]');
  });

  it('applies correct styling for Vaccination category', () => {
    const { container } = render(<CategoryBadge category="Vaccination" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-[#ECFDF5]');
    expect(badge).toHaveClass('text-[#065F46]');
  });

  it('renders all category types correctly', () => {
    const categories: RecordCategory[] = [
      'Prescription',
      'Lab Report',
      'Scan',
      'Vaccination',
      'Discharge Summary',
      'Other',
    ];

    categories.forEach((category) => {
      const { unmount } = render(<CategoryBadge category={category} />);
      expect(screen.getByText(category)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with badge styling classes', () => {
    const { container } = render(<CategoryBadge category="Scan" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('rounded-badge');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });
});
