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
              {item.link ? (
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
