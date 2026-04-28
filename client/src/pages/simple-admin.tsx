import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function SimpleAdmin() {
  const [location, setLocation] = useLocation();
  const [authStatus, setAuthStatus] = useState("");

  useEffect(() => {
    const status = localStorage.getItem('isAdmin');
    setAuthStatus(status || 'null');
    console.log('SimpleAdmin loaded, auth status:', status);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Simple Admin Dashboard</h1>
        <div className="space-y-4">
          <p>Current location: {location}</p>
          <p>Auth status: {authStatus}</p>
          <Button onClick={() => {
            console.log('Logout clicked');
            localStorage.removeItem('isAdmin');
            setLocation('/');
          }}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}