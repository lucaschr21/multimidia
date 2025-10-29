import './Header.css';

interface HeaderProps {
  currentTheme: 'light' | 'dark'; 
  onToggleTheme: () => void;      
}

function Header({ currentTheme, onToggleTheme }: HeaderProps) {
  
  const buttonIcon = currentTheme === 'light' ? '🌙' : '☀️';

  return (
    <header className="site-header">
      <div className="logo">
        SubLegend
      </div>
      <button className="theme-toggle-button" onClick={onToggleTheme}>
        {buttonIcon}  
      </button>
    </header>
  );
}

export default Header;