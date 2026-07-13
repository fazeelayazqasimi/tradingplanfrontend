import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiTarget,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import signalService from "../../services/signalService";
import { formatDate, formatDateTime } from "../../utils/helpers";
import usePagination from "../../hooks/usePagination";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const SYMBOL_OPTIONS = [
  { value: "all", label: "All Symbols" },
  { value: "EURUSD", label: "EUR/USD" },
  { value: "GBPUSD", label: "GBP/USD" },
  { value: "USDJPY", label: "USD/JPY" },
  { value: "XAUUSD", label: "XAU/USD" },
  { value: "BTCUSD", label: "BTC/USD" },
  { value: "ETHUSD", label: "ETH/USD" },
];

function ActionBadge({ action }) {
  const isBuy = action === "BUY" || action === "buy";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        isBuy
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {isBuy ? (
        <FiTrendingUp className="h-3 w-3" />
      ) : (
        <FiTrendingDown className="h-3 w-3" />
      )}
      {action}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-blue-50 text-blue-700",
    closed: "bg-dark-100 text-dark-600",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}

function SignalCard({ signal, isExpanded, onToggle }) {
  const profit = signal.profit ?? signal.currentProfit ?? 0;
  const isProfit = profit >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden p-0">
        <button
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-dark-50 transition-colors"
        >
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">
                {signal.symbol}
              </span>
              <ActionBadge action={signal.action} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-500">
              <span className="flex items-center gap-1">
                <FiTarget className="h-3 w-3" />
                {signal.side || signal.type || "Market"}
              </span>
              <span>
                Open: <span className="font-medium text-dark-700">{signal.openPrice}</span>
              </span>
              {signal.currentPrice && (
                <span>
                  Current: <span className="font-medium text-dark-700">{signal.currentPrice}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiClock className="h-3 w-3" />
                {formatDateTime(signal.createdAt || signal.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {profit !== 0 && (
              <span
                className={`text-sm font-semibold ${
                  isProfit ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isProfit ? "+" : ""}
                {profit.toFixed(2)}
              </span>
            )}
            <StatusBadge status={signal.status || "pending"} />
            {isExpanded ? (
              <FiChevronUp className="h-4 w-4 text-dark-400" />
            ) : (
              <FiChevronDown className="h-4 w-4 text-dark-400" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-dark-100 bg-dark-50/50 px-4 py-3">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {signal.stopLoss !== undefined && (
                    <div>
                      <span className="text-dark-500">Stop Loss</span>
                      <p className="font-medium text-ink">{signal.stopLoss}</p>
                    </div>
                  )}
                  {signal.takeProfit !== undefined && (
                    <div>
                      <span className="text-dark-500">Take Profit</span>
                      <p className="font-medium text-ink">{signal.takeProfit}</p>
                    </div>
                  )}
                  {signal.lotSize !== undefined && (
                    <div>
                      <span className="text-dark-500">Lot Size</span>
                      <p className="font-medium text-ink">{signal.lotSize}</p>
                    </div>
                  )}
                  {signal.riskPercent !== undefined && (
                    <div>
                      <span className="text-dark-500">Risk</span>
                      <p className="font-medium text-ink">{signal.riskPercent}%</p>
                    </div>
                  )}
                </div>
                {signal.description && (
                  <p className="mt-3 text-sm text-dark-600">
                    {signal.description}
                  </p>
                )}
                {signal.analysis && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-dark-500">Analysis</span>
                    <p className="mt-1 text-sm text-dark-600">{signal.analysis}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function SignalSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const { page, perPage, setPage, setPerPage } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        perPage,
        sort: "newest",
      };
      if (symbolFilter !== "all") params.symbol = symbolFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await signalService.getSignals(params);
      const data = response?.data || response?.signals || response || [];
      const total = response?.totalPages || response?.meta?.totalPages || 1;

      setSignals(Array.isArray(data) ? data : []);
      setTotalPages(total);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
      setError(err.message || "Failed to load signals");
      toast.error("Failed to load trade signals");
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, symbolFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const handleRefresh = () => {
    fetchSignals();
    toast.success("Signals refreshed");
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredCount = signals.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">
            Trade Signals
          </h1>
          <p className="mt-0.5 text-sm text-dark-500">
            Live trading signals from your mentors
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search signals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 py-2.5 pl-10 pr-4 text-[14.5px] text-ink placeholder-dark-400 focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2"
          >
            <FiFilter className="h-4 w-4" />
            Filters
            {(symbolFilter !== "all" || statusFilter !== "all") && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white">
                !
              </span>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-dark-100 pt-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-500">
                    Symbol
                  </label>
                  <select
                    value={symbolFilter}
                    onChange={(e) => {
                      setSymbolFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-3 py-2.5 text-[14.5px] text-ink focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
                  >
                    {SYMBOL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-500">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-3 py-2.5 text-[14.5px] text-ink focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SignalSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={FiAlertCircle}
          title="Error loading signals"
          description={error}
          action={
            <Button onClick={handleRefresh} size="sm">
              Try Again
            </Button>
          }
        />
      ) : signals.length === 0 ? (
        <EmptyState
          icon={FiTrendingUp}
          title="No signals found"
          description="No trade signals match your current filters. Try adjusting your search criteria."
        />
      ) : (
        <>
          <p className="text-xs text-dark-500">
            Showing {filteredCount} signal{filteredCount !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {signals.map((signal) => (
                <SignalCard
                  key={signal.id || signal._id}
                  signal={signal}
                  isExpanded={expandedId === (signal.id || signal._id)}
                  onToggle={() => toggleExpand(signal.id || signal._id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-3">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
