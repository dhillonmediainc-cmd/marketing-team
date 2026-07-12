import { Link } from "react-router-dom";
import { PageHead } from "../components/ui";
import { getQuotes, getCarriers } from "../lib/storage";
import { marginBreakdown } from "../lib/pricingEngine";
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
];

export default function Dashboard() {
  const quotes = getQuotes();
  const carriers = getCarriers();

  const avgMarginPct =
    quotes.length > 0
      ? quotes.reduce(
          (sum, q) =>
            sum + marginBreakdown({ shipperRate: q.shipperPrice, carrierPayout: q.carrierPayout }).grossMarginPct,
          0,
        ) / quotes.length
      : 0;

  const totalMargin = quotes.reduce(
    (sum, q) => sum + marginBreakdown({ shipperRate: q.shipperPrice, carrierPayout: q.carrierPayout }).grossMargin,
    0,
  );

  return (
    <>
      <PageHead title="FreightDirect">
        Shipper-to-carrier, direct. One markup instead of a broker spread stacked on a
        dispatcher fee — powered by your MC authority and Astify's carrier network.
      </PageHead>

      <div className="tiles">
        <div className="tile">
          <div className="label">Open loads</div>
          <div className="value">{quotes.length}</div>
        </div>
        <div className="tile">
          <div className="label">Carriers in network</div>
          <div className="value">{carriers.length}</div>
        </div>
        <div className="tile">
          <div className="label">Avg margin</div>
          <div className="value good">{pct(avgMarginPct)}</div>
        </div>
        <div className="tile">
          <div className="label">Booked margin (saved loads)</div>
          <div className="value">{usd(totalMargin)}</div>
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
