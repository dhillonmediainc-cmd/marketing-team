import { Link } from "react-router-dom";
import { PageHead } from "../components/ui";
import { getQuotes, getCarriers } from "../lib/storage";
import { coverageStats, portfolioSummary } from "../lib/analytics";
import { usd, pct } from "../lib/format";

const tools = [
  {
    to: "/calculator",
    icon: "📊",
    title: "Rate & Margin Calculator",
    desc: "Price a load and see how much more reaches the carrier when you cut the broker + dispatcher chain down to one direct markup.",
  },
  {
    to: "/quote",
    icon: "⚡",
    title: "Shipper Quoting Portal",
    desc: "Give shippers an instant direct rate. Save quotes as open loads for matching.",
  },
  {
    to: "/loads",
    icon: "🔗",
    title: "Load Matching",
    desc: "Match open loads to Astify's carrier network by lane and equipment, ranked by fit.",
  },
  {
    to: "/carrier",
    icon: "🚛",
    title: "Carrier Board",
    desc: "The carrier's view — see fitting open loads and book directly, no dispatcher fee.",
  },
  {
    to: "/insights",
    icon: "📈",
    title: "Insights",
    desc: "Portfolio analytics — margin by lane, coverage, and how your rates beat the market.",
  },
];

export default function Dashboard() {
  const carriers = getCarriers();
  const summary = portfolioSummary(getQuotes());
  const coverage = coverageStats(getQuotes());

  return (
    <>
      <PageHead title="FreightDirect">
        Shipper-to-carrier, direct. One markup instead of a broker spread stacked on a
        dispatcher fee — powered by your MC authority and Astify's carrier network.
      </PageHead>

      <div className="tiles">
        <div className="tile">
          <div className="label">Loads</div>
          <div className="value">{coverage.total}</div>
          <div className="hint">{coverage.covered} covered · {coverage.open} open</div>
        </div>
        <div className="tile">
          <div className="label">Carriers in network</div>
          <div className="value">{carriers.length}</div>
        </div>
        <div className="tile">
          <div className="label">Avg margin</div>
          <div className="value good">{pct(summary.avgMarginPct)}</div>
        </div>
        <div className="tile">
          <div className="label">Booked margin (saved loads)</div>
          <div className="value">{usd(summary.totalMargin)}</div>
        </div>
      </div>

      <div className="dash-cards">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="dash-card">
            <div className="icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
