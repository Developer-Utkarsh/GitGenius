import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOctokit } from "@/utils/github";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface GitHubSearchProps {
  onSearch: (username: string) => void;
  isDisabled: boolean;
  minLength: number;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
}

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const GitHubSearch = ({
  onSearch,
  isDisabled,
  minLength,
}: GitHubSearchProps) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      setUsers([]);
      return;
    }

    // Only show validation error if the username is complete (contains no partial input)
    if (
      searchQuery.length > 0 &&
      !searchQuery.includes("-") &&
      !USERNAME_REGEX.test(searchQuery)
    ) {
      toast({
        title: "Invalid username",
        description:
          "GitHub usernames can only contain alphanumeric characters, hyphens, or underscores.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const github = getOctokit();
      if (!github) {
        // Fall back to unauthenticated request
        const response = await fetch(
          `https://api.github.com/search/users?q=${searchQuery}&per_page=5`
        );
        const data = await response.json();
        setUsers(data.items || []);
        return;
      }

      const response = await github.request("GET /search/users", {
        q: searchQuery,
        per_page: 5,
      });
      setUsers(response.data.items || []);
    } catch (error) {
      console.error("Error searching users:", error);
      // Fallback to unauthenticated request
      try {
        const response = await fetch(
          `https://api.github.com/search/users?q=${searchQuery}&per_page=5`
        );
        const data = await response.json();
        setUsers(data.items || []);
      } catch (fallbackError) {
        toast({
          title: "Error",
          description: "Failed to fetch user suggestions",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (username: string) => {
    setQuery(username);
    setShowSuggestions(false);

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error("User not found");

      onSearch(username);
      navigate(`/${username}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    searchUsers(value);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto animate-fade-in">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search GitHub users..."
          className="pl-10 pr-4 py-2 w-full bg-white/5 border-gray-700/50 focus:border-primary/50 transition-all duration-200"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          disabled={isDisabled}
        />
      </div>

      {showSuggestions && query.length >= minLength && (
        <div className="absolute w-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <Command>
            <CommandList>
              <CommandGroup heading="Suggestions">
                {loading ? (
                  <CommandItem disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </CommandItem>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <CommandItem
                      key={user.login}
                      value={user.login}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.avatar_url} alt={user.login} />
                        <AvatarFallback>
                          {user.login[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.login}</span>
                    </CommandItem>
                  ))
                ) : (
                  <CommandEmpty>No users found.</CommandEmpty>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
