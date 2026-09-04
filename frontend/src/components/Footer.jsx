import "./Footer.css";

const linkColumns = [
  {
    title: "Support",
    links: ["Help Centre", "AirCover", "Safety information", "Cancellation options"],
  },
  {
    title: "Hosting",
    links: ["Try hosting", "AirCover for Hosts", "Explore hosting resources", "Community forum"],
  },
  {
    title: "Airbnb",
    links: ["Newsroom", "New features", "Careers", "Investors"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Sitemap", "Company details"],
  },
];

// Home Page: Footer (4 columns of links) + Copyright Footer (per rubric)
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-columns">
        {linkColumns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#!">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Airbnb Clone, Inc.</span>
        <div className="footer-bottom-right">
          <span>🌐 English (US)</span>
          <span>$ USD</span>
          <span>Facebook · Twitter · Instagram</span>
        </div>
      </div>
    </footer>
  );
}
