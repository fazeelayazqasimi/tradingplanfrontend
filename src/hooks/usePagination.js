import { useState, useCallback } from 'react';

export default function usePagination(optsOrPage = 1, maybeLimit = 10) {
  const opts = typeof optsOrPage === 'object' ? optsOrPage : {};
  const initialPage = typeof optsOrPage === 'number' ? optsOrPage : (opts.initialPage || 1);
  const initialLimit = typeof optsOrPage === 'number' ? maybeLimit : (opts.initialLimit || opts.initialPerPage || opts.perPage || 10);
  const initialTotal = opts.totalItems || opts.total || 0;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(initialTotal);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goToPage = useCallback((p) => setPage(p), []);
  const reset = useCallback(() => { setPage(1); setTotalItems(0); }, []);
  const setPerPage = useCallback((n) => { setLimit(n); setPage(1); }, []);

  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 1;

  const pagination = {
    currentPage: page,
    perPage: limit,
    totalItems,
    totalPages,
    setTotalItems,
    setPage,
    setPerPage,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };

  return {
    page, limit, totalItems, totalPages, setPage, setLimit, setTotalItems,
    perPage: limit, setPerPage,
    currentPage: page,
    nextPage, prevPage, goToPage, reset,
    total: totalItems,
    pagination,
  };
}
