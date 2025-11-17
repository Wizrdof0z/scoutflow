import React, { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { 
  PROFILES, 
  getProfilesForPosition, 
  calculateProfileRatings,
  PROFILE_KEY_TO_SUBPROFILE,
  type Metric
} from '../utils/metrics-config';

interface MetricsCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  playerPosition: string;
  onCalculate: (ratings: {
    overall: number;
    physical: number;
    movement: number;
    passing: number;
    pressure: number;
    defensive: number;
    subProfile: string;
  }) => void;
}

export const MetricsCalculator: React.FC<MetricsCalculatorProps> = ({
  isOpen,
  onClose,
  playerPosition,
  onCalculate
}) => {
  const [metricValues, setMetricValues] = useState<Record<string, number>>({});
  const [calculatedRatings, setCalculatedRatings] = useState<{
    [profileKey: string]: {
      overall: number;
      physical: number;
      movement: number;
      passing: number;
      pressure: number;
      defensive: number;
    }
  }>({});

  // Get available profiles for this position
  const profileKeys = getProfilesForPosition(playerPosition);

  // Group metrics by their first appearance section across all profiles
  const groupedMetrics = React.useMemo(() => {
    const groups: { [sectionName: string]: Metric[] } = {};
    
    profileKeys.forEach(profileKey => {
      const profile = PROFILES[profileKey];
      if (profile) {
        profile.sections.forEach(section => {
          section.metrics.forEach(metric => {
            // Find which group this metric belongs to
            const existingGroup = Object.keys(groups).find(groupName => 
              groups[groupName].some(m => m.id === metric.id)
            );
            
            if (!existingGroup) {
              if (!groups[section.name]) {
                groups[section.name] = [];
              }
              if (!groups[section.name].find(m => m.id === metric.id)) {
                groups[section.name].push(metric);
              }
            }
          });
        });
      }
    });
    
    return groups;
  }, [profileKeys]);

  // Calculate ratings whenever metric values change
  useEffect(() => {
    const ratings: typeof calculatedRatings = {};
    
    profileKeys.forEach(profileKey => {
      const profile = PROFILES[profileKey];
      if (profile) {
        ratings[profileKey] = calculateProfileRatings(profile, metricValues);
      }
    });
    
    setCalculatedRatings(ratings);
  }, [metricValues, profileKeys]);

  const handleMetricChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value);
    setMetricValues(prev => ({
      ...prev,
      [metricId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleCalculate = () => {
    // Find the profile with the highest overall rating
    let bestProfile = profileKeys[0];
    let highestRating = 0;

    Object.entries(calculatedRatings).forEach(([profileKey, ratings]) => {
      if (ratings.overall > highestRating) {
        highestRating = ratings.overall;
        bestProfile = profileKey;
      }
    });

    const bestRatings = calculatedRatings[bestProfile];
    const subProfileName = PROFILE_KEY_TO_SUBPROFILE[bestProfile];

    onCalculate({
      ...bestRatings,
      subProfile: subProfileName
    });

    onClose();
  };

  const handleClear = () => {
    setMetricValues({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Metrics Calculator
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Position: <span className="font-medium text-foreground">{playerPosition}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Metric Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedMetrics).map(([sectionName, sectionMetrics]) => (
                <div key={sectionName} className="border border-border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">{sectionName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionMetrics.map(metric => (
                      <div key={metric.id}>
                        <label className="block text-sm font-medium mb-1" htmlFor={metric.id}>
                          {metric.label}
                        </label>
                        <input
                          id={metric.id}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={metricValues[metric.id] || ''}
                          onChange={(e) => handleMetricChange(metric.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Live Ratings */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 space-y-4">
                <div className="border border-border rounded-lg p-4 bg-accent/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    Calculated Ratings
                  </h3>
                  
                  {profileKeys.map(profileKey => {
                    const profile = PROFILES[profileKey];
                    const ratings = calculatedRatings[profileKey];
                    const isHighest = profileKeys.length > 1 && 
                      Object.values(calculatedRatings).every(r => 
                        r.overall <= (ratings?.overall || 0)
                      );

                    if (!profile || !ratings) return null;

                    return (
                      <div 
                        key={profileKey} 
                        className={`mb-4 p-3 rounded-lg border-2 ${
                          isHighest 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-border bg-background'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">
                            {profile.emoji} {profile.name}
                          </h4>
                          {isHighest && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              Best Fit
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Overall:</span>
                            <span className="text-lg font-bold text-primary">
                              {ratings.overall.toFixed(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Physical:</span>
                              <span className="font-medium">{ratings.physical.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Movement:</span>
                              <span className="font-medium">{ratings.movement.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Passing:</span>
                              <span className="font-medium">{ratings.passing.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pressure:</span>
                              <span className="font-medium">{ratings.pressure.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between col-span-2">
                              <span className="text-muted-foreground">Defensive:</span>
                              <span className="font-medium">{ratings.defensive.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">💡 How it works:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Enter metric values (0-100)</li>
                    <li>Ratings update in real-time</li>
                    <li>Best fitting subprofile auto-selected</li>
                    <li>Click "Apply Ratings" when done</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <Button variant="ghost" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="followup" onClick={handleCalculate}>
              <Calculator className="h-4 w-4 mr-2" />
              Apply Ratings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
