import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiDollarSign,
  FiActivity,
  FiAlertCircle,
  FiRefreshCw,
  FiCopy,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import studentService from "../../services/studentService";
import { formatCurrency, formatPercent, formatDate, formatDateTime } from "../../utils/helpers";
import usePagination from "../../hooks/usePagination";

function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-dark-500">
              {label}
            </p>
            <p className="mt-1 text-xl font-bold text-ink">
              {value}
            </p>
            {subValue && (
              <p className="mt-0.5 text-xs text-dark-400">
                {subValue}
              </p>
            )}
          </div>
          <div
            className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center ${color}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="mb-1 h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </Card>
      ))}
    </div>
  );
}

function SubscriptionCard({ sub }) {
  const profit = sub.profit ?? sub.totalProfit ?? 0;
  const isProfit = profit >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-[22px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold text-white">
              {(sub.guruName || sub.name || "G").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {sub.guruName || sub.name || "Unknown Guru"}
              </p>
              <p className="text-xs text-dark-500">
                {sub.symbol} &middot; {sub.copies || 0} cop{sub.copies === 1 ? "y" : "ies"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-dark-500">Profit</p>
              <p
                className={`text-sm font-semibold ${
                  isProfit ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isProfit ? "+" : ""}
                {formatCurrency ? formatCurrency(profit) : profit.toFixed(2)}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                sub.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-dark-100 text-dark-600"
              }`}
            >
              {sub.status || "active"}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function HistoryTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function CopyTrading() {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  const {
    page,
    perPage,
    setPage,
  } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await studentService.getCopyStats();
      setStats(response?.data || response || null);
    } catch (err) {
      console.error("Failed to fetch copy stats:", err);
      toast.error("Failed to load copy trading stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const response = await studentService.getCopyHistory({
        type: "subscriptions",
      });
      const data = response?.data || response?.subscriptions || response || [];
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await studentService.getCopyHistory({
        page,
        perPage,
        type: "history",
      });
      const data = response?.data || response?.history || response || [];
      const total = response?.totalPages || response?.meta?.totalPages || 1;

      setHistory(Array.isArray(data) ? data : []);
      setHistoryTotalPages(total);
    } catch (err) {
      console.error("Failed to fetch copy history:", err);
      toast.error("Failed to load copy history");
    } finally {
      setLoadingHistory(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchStats();
    fetchSubscriptions();
    fetchHistory();
  }, [fetchStats, fetchSubscriptions, fetchHistory]);

  const handleRefresh = () => {
    fetchStats();
    fetchSubscriptions();
    fetchHistory();
    toast.success("Copy trading data refreshed");
  };

  const totalTrades = stats?.totalTrades ?? stats?.total_trades ?? 0;
  const totalProfit = stats?.totalProfit ?? stats?.total_profit ?? 0;
  const winRate = stats?.winRate ?? stats?.win_rate ?? 0;
  const openTrades = stats?.openTrades ?? stats?.open_trades ?? 0;
  const isTotalProfit = totalProfit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Copy Trading
          </h1>
          <p className="mt-1 text-sm text-dark-500">
            Manage your copy trading subscriptions and track performance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingStats || loadingSubs || loadingHistory}
          className="inline-flex items-center gap-2"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${
              loadingStats || loadingSubs || loadingHistory ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {loadingStats ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={FiTarget}
            label="Total Trades"
            value={totalTrades}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={FiDollarSign}
            label="Total Profit"
            value={formatCurrency ? formatCurrency(totalProfit) : totalProfit.toFixed(2)}
            subValue={isTotalProfit ? "Overall gain" : "Overall loss"}
            color={
              isTotalProfit
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }
          />
          <StatCard
            icon={FiTrendingUp}
            label="Win Rate"
            value={formatPercent ? formatPercent(winRate) : `${winRate}%`}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={FiActivity}
            label="Open Trades"
            value={openTrades}
            color="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Active Subscriptions
        </h2>
        {loadingSubs ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={FiCopy}
              title="No active subscriptions"
              description="Subscribe to a guru to start copy trading."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub, index) => (
              <SubscriptionCard
                key={sub.id || sub._id || index}
                sub={sub}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Copy Trading History
        </h2>
        <Card className="overflow-hidden p-0">
          {loadingHistory ? (
            <HistoryTableSkeleton />
          ) : history.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FiTrendingUp}
                title="No copy trading history"
                description="Your completed copy trades will appear here."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-dark-100 bg-dark-50/50">
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Symbol
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Side
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Entry Price
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Exit Price
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Profit
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {history.map((trade, index) => {
                      const profit = trade.profit ?? trade.pnl ?? 0;
                      const isProfit = profit >= 0;
                      return (
                        <motion.tr
                          key={trade.id || trade._id || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-dark-50/50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                            {trade.symbol}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                (trade.side === "BUY" || trade.side === "buy")
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(trade.side === "BUY" || trade.side === "buy") ? (
                                <FiTrendingUp className="h-3 w-3" />
                              ) : (
                                <FiTrendingDown className="h-3 w-3" />
                              )}
                              {trade.side}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-dark-600">
                            {trade.entryPrice}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-dark-600">
                            {trade.exitPrice || "\u2014"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`font-semibold ${
                                isProfit ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {isProfit ? "+" : ""}
                              {formatCurrency ? formatCurrency(profit) : profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                                trade.status === "closed" || trade.status === "completed"
                                  ? "bg-dark-100 text-dark-600"
                                  : trade.status === "open"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {trade.status || "open"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-dark-500">
                            {formatDate
                              ? formatDate(trade.closedAt || trade.createdAt || trade.date)
                              : trade.date || "\u2014"}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {historyTotalPages > 1 && (
                <div className="flex justify-center border-t border-dark-100 p-4">
                  <Pagination
                    page={page}
                    totalPages={historyTotalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
