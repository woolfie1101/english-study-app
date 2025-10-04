import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, CheckCircle, Play } from "lucide-react";

interface Session {
  id: number;
  number: number;
  status: 'completed' | 'in-progress' | 'locked';
}

interface CategoryScreenProps {
  category: {
    id: string;
    name: string;
    completed: number;
    total: number;
  };
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export function CategoryScreen({ category, onNavigate, onBack }: CategoryScreenProps) {
  // Mock sessions data - in a real app this would come from props or API
  const sessions: Session[] = Array.from({ length: category.total }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    status: i < category.completed ? 'completed' : i === category.completed ? 'in-progress' : 'locked'
  }));

  const handleSessionClick = (session: Session) => {
    if (session.status !== 'locked') {
      onNavigate('session-detail', { category, session });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-gray-900">{category.name}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card 
              key={session.id}
              className={`p-4 cursor-pointer transition-colors ${
                session.status === 'locked' 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSessionClick(session)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                    <span className="text-gray-900">{session.number}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-900">Session {session.number}</h3>
                    <p className="text-sm text-gray-600">
                      {session.status === 'completed' && 'Completed'}
                      {session.status === 'in-progress' && 'In Progress'}
                      {session.status === 'locked' && 'Locked'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {session.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {session.status === 'in-progress' && (
                    <Play className="w-6 h-6 text-blue-500" />
                  )}
                  {session.status === 'locked' && (
                    <div className="w-6 h-6 rounded-full bg-gray-300" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}