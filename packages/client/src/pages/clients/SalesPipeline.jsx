import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STATUSES = [
  { key: 'draft', label: 'Brouillon' },
  { key: 'sent', label: 'Envoyé' },
  { key: 'accepted', label: 'Accepté' },
  { key: 'refused', label: 'Refusé' },
];

export default function SalesPipeline() {
  const [quotes, setQuotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data } = await api.get('/quotes');
        setQuotes(data.quotes || []);
      } catch (err) {
        toast.error('Erreur lors du chargement du pipeline.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const quoteId = active.id;
    const newStatus = over.id;

    // Mise à jour optimiste
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
    );

    try {
      await api.patch(`/quotes/${quoteId}/status`, { status: newStatus });
    } catch {
      // Recharger en cas d'erreur
      toast.error('Erreur lors du changement de statut.');
      const { data } = await api.get('/quotes');
      setQuotes(data.quotes);
    }
  };

  const getQuotesByStatus = (status) => quotes.filter((q) => q.status === status);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 text-gray-400">
        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-xs sm:text-sm">Aucun devis dans le pipeline</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pipeline commercial</h3>
        <span className="text-xs sm:text-sm text-gray-500">{quotes.length} devis</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id)}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 min-w-0">
            {STATUSES.map(({ key }) => {
              const items = getQuotesByStatus(key);
              return <DropZone key={key} id={key} quotes={items} />;
            })}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <QuoteCard quote={quotes.find((q) => q.id === activeId)} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DropZone({ id, quotes }) {
  return (
    <div className="bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 p-2 sm:p-3 flex flex-col max-h-[16rem]">
      <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
        <h4 className="font-semibold text-xs sm:text-sm">
          <StatusBadge status={id} size="sm" />
        </h4>
        <span className="text-[10px] sm:text-xs text-gray-400 bg-white rounded-full px-1.5 sm:px-2 py-0.5 border border-gray-200">
          {quotes.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-1.5 sm:space-y-2 pr-1">
        {quotes.map((quote) => (
          <SortableQuote key={quote.id} quote={quote} />
        ))}
        {quotes.length === 0 && (
          <p className="text-[10px] sm:text-xs text-gray-400 text-center py-4 sm:py-6">
            Aucun devis
          </p>
        )}
      </div>
    </div>
  );
}

function SortableQuote({ quote }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: quote.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-2 sm:p-3 rounded-md sm:rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-300 transition-all text-xs sm:text-sm group"
    >
      <div className="font-semibold text-gray-900 truncate">{quote.reference}</div>
      <div className="text-gray-600 text-[10px] sm:text-xs mt-0.5 truncate">{quote.client?.name || 'Sans client'}</div>
      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
        <span className="text-indigo-600 font-bold text-xs sm:text-sm">{quote.totalTTC} €</span>
        {quote.validUntil && (
          <span className="text-[10px] sm:text-xs text-gray-400">
            {new Date(quote.validUntil).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

function QuoteCard({ quote, isOverlay }) {
  if (!quote) return null;
  return (
    <div
      className={`bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-indigo-300 text-xs sm:text-sm w-44 sm:w-48 ${
        isOverlay ? 'rotate-3 shadow-xl' : ''
      }`}
    >
      <div className="font-semibold text-gray-900 truncate">{quote.reference}</div>
      <div className="text-gray-600 text-[10px] sm:text-xs mt-0.5 truncate">{quote.client?.name || 'Sans client'}</div>
      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
        <span className="text-indigo-600 font-bold">{quote.totalTTC} €</span>
      </div>
    </div>
  );
}