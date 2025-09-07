import { Link } from "react-router"
import { usePuterStore } from "~/lib/puter";



const Navbar = () => {
    const { auth } = usePuterStore();
    return (
      <nav className="navbar">
        <Link to="/">
          <p className="text-2xl font-bold text-gradient">San's Resume</p>
        </Link>
        {auth.isAuthenticated && (
          <Link to="/auth" className="primary-button w-fit">
            Sign Out
          </Link>
        )}

        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
      </nav>
    );
}

export default Navbar