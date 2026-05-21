import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav>
      <ol className="flex items-center space-x-2 text-sm uppercase">
        <li>
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Inici
          </Link>
        </li>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className={index === items.length - 1 ? "text-foreground font-medium truncate" : ""}>
              {item.onClick ? (
                // Usem un <span role="button"> en comptes de <button>
                // perquè cada navegador (Firefox/Chrome/Safari) aplica
                // estils UA diferents (line-height, padding, font) als
                // botons que desalineen el breadcrumb respecte als
                // altres elements (Link i span). Un span hereta
                // exactament els matesixos estils que els germans.
                <span
                  role="button"
                  tabIndex={0}
                  onClick={item.onClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      item.onClick(e);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors uppercase cursor-pointer"
                >
                  {item.label}
                </span>
              ) : item.link ? (
                <Link to={item.link} className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
