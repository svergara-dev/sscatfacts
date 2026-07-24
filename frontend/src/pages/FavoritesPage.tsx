import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

export function FavoritesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { favorites, meta, isLoading, error, fetchFavorites, remove } = useFavorites();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFavorites(currentPage);
  }, [fetchFavorites, currentPage]);

  const handleRemove = useCallback(
    async (factId: number) => {
      if (!window.confirm('Eliminar este fact de favoritos?')) return;
      await remove(factId);
    },
    [remove],
  );

  const handlePrevPage = useCallback(() => {
    if (meta && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [meta, currentPage]);

  const handleNextPage = useCallback(() => {
    if (meta && currentPage < meta.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [meta, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Mis Facts Favoritos</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Facts
            </button>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {meta && <p className="text-sm text-gray-500 mb-4">Total: {meta.totalItems} facts</p>}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando favoritos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!isLoading && favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tienes facts favoritos aun.</p>
          </div>
        )}

        {favorites.map((fact) => (
          <div key={fact.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <p className="text-gray-800 text-lg leading-relaxed mb-4">{fact.fact}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Liked: {new Date(fact.likedAt).toLocaleDateString('es-CL')}
              </span>
              <button
                onClick={() => handleRemove(fact.id)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Pagina {currentPage} de {meta.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === meta.totalPages}
              className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
