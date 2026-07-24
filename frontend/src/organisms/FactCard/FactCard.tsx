import type { FactData } from '@/types/api';

interface FactCardProps {
  fact: FactData;
  onLike: (factId: number) => void;
  isLoading?: boolean;
}

export function FactCard({ fact, onLike, isLoading = false }: FactCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <p className="text-gray-800 text-lg leading-relaxed mb-4">{fact.fact}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onLike(fact.id)}
          disabled={isLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors disabled:opacity-50 ${
            fact.liked
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          data-testid="like-button"
        >
          <svg
            className={`w-5 h-5 ${fact.liked ? 'fill-current' : 'stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span data-testid="likes-count">{fact.likesCount}</span>
        </button>

        <span className="text-sm text-gray-500">{fact.liked ? 'Te gusta' : 'Marca tu like'}</span>
      </div>
    </div>
  );
}
