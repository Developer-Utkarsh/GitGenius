import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface GitHubSearchProps {
  onSearch: (username: string) => void;
  isDisabled: boolean;
  minLength: number;
}

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const DEBOUNCE_DELAY = 1000; // 1 second delay

export const GitHubSearch = ({ onSearch, isDisabled, minLength }: GitHubSearchProps) => {
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.length >= minLength && USERNAME_REGEX.test(username)) {
        setDebouncedUsername(username);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [username, minLength]);

  useEffect(() => {
    if (debouncedUsername) {
      // Check if username exists before triggering search
      fetch(`https://api.github.com/users/${debouncedUsername}`)
        .then(response => {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          if (!response.ok) {
            throw new Error("Error checking username");
          }
          onSearch(debouncedUsername);
        })
        .catch(error => {
          if (error.message === "User not found") {
            toast({
              title: "User not found",
              description: "The GitHub username you entered does not exist. Please try another username.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "There was an error checking the username. Please try again.",
              variant: "destructive",
            });
          }
          setUsername("");
        });
    }
  }, [debouncedUsername, onSearch, toast]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setUsername(value);
    
    if (value && !USERNAME_REGEX.test(value)) {
      toast({
        title: "Invalid username",
        description: "GitHub usernames can only contain alphanumeric characters or hyphens, and cannot begin with a hyphen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto animate-fade-in">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder="Enter GitHub username..."
        className="pl-10 pr-4 py-2 w-full bg-white/5 border-gray-700/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200"
        value={username}
        onChange={handleUsernameChange}
        minLength={minLength}
        pattern={USERNAME_REGEX.source}
        disabled={isDisabled}
      />
    </div>
  );
};