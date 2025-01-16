interface Repository {
  name: string;
  commits: Array<{
    date: string;
    count: number;
  }>;
  // ... other properties
}
