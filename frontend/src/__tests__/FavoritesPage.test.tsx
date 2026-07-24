import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { AuthProvider } from '@/context/AuthContext';
import * as favoritesService from '@/services/favoritesService';

vi.mock('@/services/favoritesService');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
};

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    vi.mocked(favoritesService.getFavorites).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<FavoritesPage />);

    expect(screen.getByText('Cargando favoritos...')).toBeInTheDocument();
  });

  it('renders favorites after loading', async () => {
    vi.mocked(favoritesService.getFavorites).mockResolvedValue({
      success: true,
      data: {
        facts: [{ id: 1, fact: 'Cats purr', length: 10, likedAt: '2026-07-24T10:00:00Z' }],
      },
      meta: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
    });

    localStorage.setItem('token', 'mock-token');

    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Cats purr')).toBeInTheDocument();
    });
  });

  it('renders empty state when no favorites', async () => {
    vi.mocked(favoritesService.getFavorites).mockResolvedValue({
      success: true,
      data: { facts: [] },
      meta: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
    });

    localStorage.setItem('token', 'mock-token');

    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('No tienes facts favoritos aun.')).toBeInTheDocument();
    });
  });

  it('renders error message', async () => {
    vi.mocked(favoritesService.getFavorites).mockResolvedValue({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token invalido' },
    });

    localStorage.setItem('token', 'mock-token');

    renderWithProviders(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Token invalido')).toBeInTheDocument();
    });
  });
});
