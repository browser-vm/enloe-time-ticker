
import { useState, useEffect } from "react";
import { 
  getCurrentTimeInfo, 
  formatTimeMS, 
  formatTimeLong, 
  schedules, 
  isSchoolOver,
  getTimeUntilSchool
} from "@/utils/timeUtils";
import TimeCard from "@/components/TimeCard";
import ScheduleToggle from "@/components/ScheduleToggle";
import { Clock, Calendar } from "lucide-react";

const Index = () => {
  const [scheduleType, setScheduleType] = useState<"aLunch" | "bLunch">("aLunch");
  const [timeInfo, setTimeInfo] = useState(() => getCurrentTimeInfo(schedules[scheduleType]));
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Load saved schedule preference
  useEffect(() => {
    const savedSchedule = localStorage.getItem("enloeScheduleType");
    if (savedSchedule === "aLunch" || savedSchedule === "bLunch") {
      setScheduleType(savedSchedule);
    }
  }, []);
  
  // Save schedule preference
  useEffect(() => {
    localStorage.setItem("enloeScheduleType", scheduleType);
  }, [scheduleType]);
  
  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setTimeInfo(getCurrentTimeInfo(schedules[scheduleType]));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [scheduleType]);
  
  const timeUntilSchool = getTimeUntilSchool();
  const schoolOver = isSchoolOver(schedules[scheduleType]);
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-enloe-light to-gray-100">
      <header className="w-full py-6 px-4 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-full max-w-md flex items-center justify-center mb-2">
          <img 
            src="/lovable-uploads/6974e9ed-1c55-4c89-b264-f6e36225f32c.png" 
            alt="Enloe Time Logo" 
            className="h-20 md:h-24 object-contain"
          />
        </div>
        
        <div className="flex items-center space-x-2 text-enloe-green mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <ScheduleToggle 
          scheduleType={scheduleType} 
          onChange={setScheduleType} 
          className="mt-4 animate-slide-up" 
          style={{ animationDelay: '0.3s' }}
        />
      </header>
      
      <main className="flex-1 w-full max-w-4xl px-4 py-6 grid gap-6">
        {!timeInfo.isSchoolDay ? (
          <div className="col-span-full glass-card p-10 text-center animate-scale-in">
            <h2 className="text-2xl font-bold timer-text enloe-gradient-text mb-2">Weekend</h2>
            <p className="text-gray-600">No school today. Enjoy your day!</p>
          </div>
        ) : schoolOver ? (
          <div className="col-span-full glass-card p-10 text-center animate-scale-in">
            <h2 className="text-2xl font-bold timer-text enloe-gradient-text mb-2">School Day Complete</h2>
            <p className="text-gray-600">Classes are over for today. See you tomorrow!</p>
          </div>
        ) : timeUntilSchool ? (
          <div className="col-span-full glass-card p-10 text-center animate-scale-in">
            <h2 className="text-2xl font-bold timer-text enloe-gradient-text mb-2">School Starts Soon</h2>
            <div className="text-4xl font-bold mt-4 timer-text enloe-yellow-gradient-text">
              {formatTimeLong(timeUntilSchool)}
            </div>
            <p className="text-gray-600 mt-2">Until school starts</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Period Card */}
              <TimeCard
                title="Current Period"
                time={timeInfo.timeRemainingInPeriod ? formatTimeMS(timeInfo.timeRemainingInPeriod) : "Break"}
                subtitle="Remaining"
                period={timeInfo.currentPeriod}
                progress={timeInfo.progress}
                isActive={true}
                className="animate-scale-in"
                style={{ animationDelay: '0.1s' }}
              />
              
              {/* Next Period Card */}
              <TimeCard
                title="Next Period"
                time={timeInfo.timeUntilNextPeriod ? formatTimeMS(timeInfo.timeUntilNextPeriod) : "N/A"}
                subtitle="Until Start"
                period={timeInfo.nextPeriod}
                className="animate-scale-in"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            
            {/* Schedule Overview */}
            <div className="glass-card p-6 mt-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-sm font-medium uppercase tracking-wider text-enloe-green/80 mb-4">
                {scheduleType === "aLunch" ? "A-Lunch Schedule" : "B-Lunch Schedule"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules[scheduleType].periods.map((period, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300",
                      timeInfo.currentPeriod?.name === period.name 
                        ? "bg-enloe-green/10 border border-enloe-yellow/30" 
                        : "bg-white/50"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{period.name}</span>
                      <span className="text-gray-500 text-sm">
                        {period.startTime} - {period.endTime}
                      </span>
                    </div>
                    
                    {timeInfo.currentPeriod?.name === period.name && (
                      <div className="mt-2">
                        <div className="progress-bar-container h-1">
                          <div 
                            className="progress-bar"
                            style={{ width: `${timeInfo.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="w-full py-4 text-center text-sm text-gray-500">
        <p>Enloe Time Ticker © 2024</p>
      </footer>
    </div>
  );
};

export default Index;
