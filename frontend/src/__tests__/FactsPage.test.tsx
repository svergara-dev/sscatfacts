import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { FactsPage } from '@/pages/FactsPage';
import * as factsService from '@/services/factsService';

vi.mock('@/services/factsService');
vi.mock('@/services/authService', () => ({
  register: vi.fn(),
  login: vi.fn(),
  getMe: vi.fn().mockResolvedValue({ success: false }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
};

describe('FactsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    vi.mocked(factsService.getRandomFact).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<FactsPage />);

    expect(screen.getByText('Cargando fact...')).toBeInTheDocument();
  });

  it('renders fact after loading', async () => {
    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: true,
      data: { id: 1, fact: 'Cats purr', length: 10, liked: false, likesCount: 0 },
    });

    renderWithProviders(<FactsPage />);

    await waitFor(() => {
      expect(screen.getByText('Cats purr')).toBeInTheDocument();
    });
  });

  it('renders error message', async () => {
    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: false,
      error: { code: 'EXTERNAL_API_ERROR', message: 'API no disponible' },
    });

    renderWithProviders(<FactsPage />);

    await waitFor(() => {
      expect(screen.getByText('API no disponible')).toBeInTheDocument();
    });
  });

  it('fetches new fact on button click', async () => {
    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: true,
      data: { id: 1, fact: 'First fact', length: 10, liked: false, likesCount: 0 },
    });

    renderWithProviders(<FactsPage />);

    await waitFor(() => {
      expect(screen.getByText('First fact')).toBeInTheDocument();
    });

    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: true,
      data: { id: 2, fact: 'Second fact', length: 10, liked: false, likesCount: 0 },
    });

    fireEvent.click(screen.getByText('Nuevo Fact'));

    await waitFor(() => {
      expect(screen.getByText('Second fact')).toBeInTheDocument();
    });
  });
});
