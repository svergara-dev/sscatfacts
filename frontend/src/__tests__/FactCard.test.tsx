import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactCard } from '@/organisms/FactCard/FactCard';

const mockFact = {
  id: 1,
  fact: 'Cats have over 20 vocalizations',
  length: 38,
  liked: false,
  likesCount: 5,
};

describe('FactCard', () => {
  it('renders fact text', () => {
    render(<FactCard fact={mockFact} onLike={vi.fn()} />);

    expect(screen.getByText('Cats have over 20 vocalizations')).toBeInTheDocument();
  });

  it('shows likes count', () => {
    render(<FactCard fact={mockFact} onLike={vi.fn()} />);

    expect(screen.getByTestId('likes-count')).toHaveTextContent('5');
  });

  it('shows "Marca tu like" when not liked', () => {
    render(<FactCard fact={mockFact} onLike={vi.fn()} />);

    expect(screen.getByText('Marca tu like')).toBeInTheDocument();
  });

  it('shows "Te gusta" when liked', () => {
    render(<FactCard fact={{ ...mockFact, liked: true }} onLike={vi.fn()} />);

    expect(screen.getByText('Te gusta')).toBeInTheDocument();
  });

  it('calls onLike when button clicked', () => {
    const onLike = vi.fn();
    render(<FactCard fact={mockFact} onLike={onLike} />);

    fireEvent.click(screen.getByTestId('like-button'));

    expect(onLike).toHaveBeenCalledWith(1);
  });

  it('disables button when loading', () => {
    render(<FactCard fact={mockFact} onLike={vi.fn()} isLoading />);

    expect(screen.getByTestId('like-button')).toBeDisabled();
  });
});
