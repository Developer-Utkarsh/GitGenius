import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LanguageDistributionProps {
  languages: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const LanguageDistribution = ({ languages }: LanguageDistributionProps) => {
  const data = Object.entries(languages).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="glass-card p-6 rounded-lg animate-fade-up">
      <h3 className="text-xl font-semibold mb-4 animate-pulse">Language Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              className="animate-spin-slow"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};