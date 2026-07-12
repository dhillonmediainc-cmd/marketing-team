import { NavLink, Link, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/calculator", label: "Margin Calculator", end: false },
  { to: "/quote", label: "Quoting Portal", end: false },
  { to: "/loads", label: "Load Matching", end: false },
  { to: "/carrier", label: "Carrier Board", end: false },
  { to: "/shipments", label: "Shipments", end: false },
  { to: "/insights", label: "Insights", end: false },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand-mark">
          <span className="brand-logo">FD</span>
          <span>FreightDirect</span>
        </Link>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
