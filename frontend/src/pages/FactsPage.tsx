import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useFacts } from '@/hooks/useFacts';
import { useLike } from '@/hooks/useLike';
import { FactCard } from '@/organisms/FactCard/FactCard';
import { Button } from '@/atoms/Button/Button';

export function FactsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { fact, isLoading, error, fetchRandom, updateFactLike } = useFacts();
  const { isLoading: isLikeLoading, toggleLike } = useLike();

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  const handleLike = useCallback(
    async (factId: number) => {
      if (!fact) return;
      await toggleLike(factId, fact.liked, updateFactLike, fact.likesCount);
    },
    [fact, toggleLike, updateFactLike],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">SSCatFacts</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={() => navigate('/favorites')}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Favoritos
            </button>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading && !fact && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando fact...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {fact && <FactCard fact={fact} onLike={handleLike} isLoading={isLikeLoading} />}

        <div className="mt-6 text-center">
          <Button onClick={fetchRandom} isLoading={isLoading} loadingText="Cargando...">
            Nuevo Fact
          </Button>
        </div>
      </main>
    </div>
  );
}
