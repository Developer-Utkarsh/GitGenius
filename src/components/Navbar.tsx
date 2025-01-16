import { useAuth } from "@/contexts/AuthContext";
import { GitBranch, Github, Star, Menu } from "lucide-react";
import { LoginButton } from "./LoginButton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { UserButton } from "./UserButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-border" />
      <div className="container relative">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-primary via-purple-500 to-primary/50 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            GitGenius
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6">
                  <a
                    href="https://github.com/yourusername/gitgenius"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    Star
                  </a>
                  <Button
                    variant="outline"
                    className="hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => navigate(`/${user.login}`)}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Your Stats
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/${user.login}`)}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Your Stats
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href="https://github.com/Developer-Utkarsh/GitGenius/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Star on GitHub
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <UserButton user={user} onLogout={logout} />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
