import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useCallback } from "react";
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
import debounce from "lodash/debounce";

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

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      searchUsers(searchQuery);
    }, 300),
    []
  );

  useCallback(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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

    if (value.length >= minLength) {
      setLoading(true);
      debouncedSearch(value);
    } else {
      setUsers([]);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900/80 via-blue-950/50 to-slate-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-1.5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary/70" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search GitHub users..."
            className="pl-10 pr-4 py-6 w-full bg-black/40 border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-lg placeholder:text-gray-400"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            disabled={isDisabled}
          />
        </div>

        {showSuggestions && query.length >= minLength && (
          <div className="mt-2 rounded-lg border bg-black/60 backdrop-blur-xl text-popover-foreground shadow-xl outline-none border-white/10">
            <Command className="bg-transparent">
              <CommandList>
                <CommandGroup heading="Suggestions" className="px-2">
                  {loading ? (
                    <CommandItem disabled className="rounded-lg">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      <span className="text-gray-400">Searching...</span>
                    </CommandItem>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <CommandItem
                        key={user.login}
                        value={user.login}
                        onSelect={handleSelect}
                        className="cursor-pointer hover:bg-white/5 transition-colors rounded-lg"
                      >
                        <Avatar className="h-8 w-8 mr-2 ring-2 ring-primary/20">
                          <AvatarImage src={user.avatar_url} alt={user.login} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.login[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-200">{user.login}</span>
                      </CommandItem>
                    ))
                  ) : (
                    <CommandEmpty className="text-gray-400 py-4">
                      No users found.
                    </CommandEmpty>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
};
