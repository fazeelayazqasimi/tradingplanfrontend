import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiBriefcase,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import studentService from "../../services/studentService";
import { formatCurrency, formatPercent, formatDate } from "../../utils/helpers";
import usePagination from "../../hooks/usePagination";

function SummaryCard({ icon: Icon, label, value, subValue, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="p-[22px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-dark-500">
              {label}
            </p>
            <p className="text-2xl font-bold text-ink">
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-dark-400">
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

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-[22px]">
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="mb-1 h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card className="p-[22px]">
      <Skeleton className="mb-4 h-5 w-36" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-[11px] border border-dark-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-dark-500">{label}</p>
      <p className="text-sm font-semibold text-ink">
        {payload[0].value?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </p>
    </div>
  );
}

function TradeTableSkeleton() {
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

export default function Portfolio() {
  const [summary, setSummary] = useState(null);
  const [trades, setTrades] = useState([]);
  const [equityData, setEquityData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [hasAccount, setHasAccount] = useState(true);

  const {
    page,
    perPage,
    setPage,
  } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const [tradesTotalPages, setTradesTotalPages] = useState(1);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const response = await studentService.getPortfolioSummary();
      const data = response?.data || response || null;
      if (!data || (data.error && data.error.includes("not connected"))) {
        setHasAccount(false);
      } else {
        setSummary(data);
      }
    } catch (err) {
      if (
        err?.response?.status === 404 ||
        err?.message?.toLowerCase().includes("not connected") ||
        err?.message?.toLowerCase().includes("no account")
      ) {
        setHasAccount(false);
      } else {
        console.error("Failed to fetch portfolio summary:", err);
        toast.error("Failed to load portfolio data");
      }
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchEquity = useCallback(async () => {
    setLoadingChart(true);
    try {
      const response = await studentService.getEquityCurve?.();
      const data = response?.data || response || [];
      setEquityData(Array.isArray(data) ? data : []);
    } catch {
      setEquityData([]);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    setLoadingTrades(true);
    try {
      const response = await studentService.getRecentTrades?.({
        page,
        perPage,
      });
      const data =
        response?.data || response?.trades || response || [];
      const total = response?.totalPages || response?.meta?.totalPages || 1;

      setTrades(Array.isArray(data) ? data : []);
      setTradesTotalPages(total);
    } catch (err) {
      console.error("Failed to fetch recent trades:", err);
      setTrades([]);
    } finally {
      setLoadingTrades(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchSummary();
    fetchEquity();
    fetchTrades();
  }, [fetchSummary, fetchEquity, fetchTrades]);

  const handleRefresh = () => {
    fetchSummary();
    fetchEquity();
    fetchTrades();
    toast.success("Portfolio refreshed");
  };

  const totalBalance = summary?.totalBalance ?? summary?.total_balance ?? 0;
  const totalProfitLoss = summary?.totalProfitLoss ?? summary?.total_pnl ?? 0;
  const winRate = summary?.winRate ?? summary?.win_rate ?? 0;
  const totalTradesCount = summary?.totalTrades ?? summary?.total_trades ?? 0;
  const isProfit = totalProfitLoss >= 0;

  const chartMin = useMemo(() => {
    if (equityData.length === 0) return 0;
    const vals = equityData.map((d) => d.equity);
    return Math.min(...vals) * 0.98;
  }, [equityData]);

  const chartMax = useMemo(() => {
    if (equityData.length === 0) return 10000;
    const vals = equityData.map((d) => d.equity);
    return Math.max(...vals) * 1.02;
  }, [equityData]);

  if (!loadingSummary && !hasAccount) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Portfolio
          </h1>
          <p className="mt-1 text-sm text-dark-500">
            Track your trading performance and equity curve
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center py-20">
          <EmptyState
            icon={FiBriefcase}
            title="Connect your MT account to see portfolio data"
            description="Link your MetaTrader account to view your portfolio summary, equity curve, and trade history."
            action={
              <Button size="sm" className="mt-4">
                Connect Account
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Portfolio
          </h1>
          <p className="mt-1 text-sm text-dark-500">
            Track your trading performance and equity curve
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingSummary || loadingTrades || loadingChart}
          className="inline-flex items-center gap-2"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${
              loadingSummary || loadingTrades || loadingChart
                ? "animate-spin"
                : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {loadingSummary ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            icon={FiDollarSign}
            label="Total Balance"
            value={
              formatCurrency
                ? formatCurrency(totalBalance)
                : totalBalance.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
            }
            color="bg-blue-50 text-blue-600"
            delay={0}
          />
          <SummaryCard
            icon={isProfit ? FiTrendingUp : FiTrendingDown}
            label="Total P/L"
            value={
              formatCurrency
                ? `${isProfit ? "+" : ""}${formatCurrency(totalProfitLoss)}`
                : `${isProfit ? "+" : ""}$${Math.abs(totalProfitLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            }
            subValue={isProfit ? "Net profit" : "Net loss"}
            color={
              isProfit
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }
            delay={0.05}
          />
          <SummaryCard
            icon={FiTarget}
            label="Win Rate"
            value={formatPercent ? formatPercent(winRate) : `${winRate}%`}
            color="bg-purple-50 text-purple-600"
            delay={0.1}
          />
          <SummaryCard
            icon={FiActivity}
            label="Total Trades"
            value={totalTradesCount}
            color="bg-amber-50 text-amber-600"
            delay={0.15}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {loadingChart ? (
          <ChartSkeleton />
        ) : (
          <Card className="p-[22px]">
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Equity Curve
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={equityData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="equityGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563EB"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2563EB"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[chartMin, chartMax]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(val) =>
                      `$${(val / 1000).toFixed(1)}k`
                    }
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#2563EB",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Recent Trades
        </h2>
        <Card className="overflow-hidden p-0">
          {loadingTrades ? (
            <TradeTableSkeleton />
          ) : trades.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={FiTrendingUp}
                title="No trades yet"
                description="Your recent trades will appear here once you start trading."
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
                        Entry
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Exit
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Profit
                      </th>
                      <th className="px-4 py-3 font-medium text-dark-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {trades.map((trade, index) => {
                      const profit = trade.profit ?? trade.pnl ?? 0;
                      const isTradeProfit = profit >= 0;
                      const isBuy =
                        trade.side === "BUY" || trade.side === "buy";
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
                                isBuy
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {isBuy ? (
                                <FiTrendingUp className="h-3 w-3" />
                              ) : (
                                <FiTrendingDown className="h-3 w-3" />
                              )}
                              {trade.side}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-dark-600">
                            {trade.entryPrice ?? trade.entry ?? "\u2014"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-dark-600">
                            {trade.exitPrice ?? trade.exit ?? "\u2014"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`font-semibold ${
                                isTradeProfit
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {isTradeProfit ? "+" : ""}
                              {formatCurrency
                                ? formatCurrency(profit)
                                : profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-dark-500">
                            {formatDate
                              ? formatDate(
                                  trade.closedAt ||
                                    trade.createdAt ||
                                    trade.date
                                )
                              : trade.date || "\u2014"}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {tradesTotalPages > 1 && (
                <div className="flex justify-center border-t border-dark-100 p-4">
                  <Pagination
                    page={page}
                    totalPages={tradesTotalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
