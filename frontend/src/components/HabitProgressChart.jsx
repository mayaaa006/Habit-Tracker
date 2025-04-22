import { useEffect, useState } from 'react';

const HabitProgressChart = ({ habit }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!habit || !habit.completed) return;
    
    // Process the data for display - get the last 7 days
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Find completion for this day
      const completion = habit.completed.find(item => {
        const itemDate = new Date(item.date);
        return itemDate.setHours(0, 0, 0, 0) === date.getTime();
      });
      
      const progress = completion ? 
        Math.min(Math.round((completion.count / habit.goal) * 100), 100) : 0;
      
      last7Days.push({
        date: date.toLocaleDateString(),
        progress
      });
    }
    
    setChartData(last7Days);
  }, [habit]);

  if (!chartData || chartData.length <= 1) {
    return (
      <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Not enough data to show progress chart yet.</p>
      </div>
    );
  }

  // Simple chart implementation
  const maxHeight = 140;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Progress History (Last 7 Days)</h3>
      <div className="relative h-40">
        <div className="flex items-end justify-between h-full">
          {chartData.map((entry, index) => (
            <div key={index} className="flex flex-col items-center mx-1 relative">
              <div 
                className="w-6 rounded-t bg-purple-500" 
                style={{ height: `${(entry.progress / 100) * maxHeight}px` }}
              ></div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 transform -rotate-45 absolute -bottom-6 origin-top-left">
                {entry.date}
              </span>
            </div>
          ))}
        </div>
        
        {/* Y axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
      </div>
    </div>
  );
};

export default HabitProgressChart;