import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function TestAdmin() {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Test Admin Page</h1>
        <p className="mb-4">Current location: {location}</p>
        <p className="mb-4">Admin status: {localStorage.getItem('isAdmin')}</p>
        <div className="space-x-4">
          <Button onClick={() => setLocation("/admin-dashboard")}>
            Go to Admin Dashboard
          </Button>
          <Button onClick={() => setLocation("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}