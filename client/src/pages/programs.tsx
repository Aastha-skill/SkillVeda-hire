import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Clock, BookOpen, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/footer";

const programs = [
  {
    id: 1,
    title: "PGDM in Customer Success and Key Account Management",
    duration: "1 Year",
    skills: "Customer Relationship Management, Account Strategy, Client Retention, Business Communication",
    earnings: "₹4 - ₹8 LPA placement range",
    color: "purple",
    link: "/pgdm-customer-success",
  },
  {
    id: 2,
    title: "MBA in Logistics and Supply Chain Management",
    duration: "2 Years",
    skills: "Supply Chain Optimization, Inventory Management, Procurement, Operations Planning",
    earnings: "₹20,000 - ₹35,000/month",
    color: "green",
  },
  {
    id: 3,
    title: "Customer Success Career Accelerator Program",
    duration: "2 Months",
    skills: "Customer Onboarding, Retention Strategy, CRM Tools, Stakeholder Management",
    earnings: "₹4 - ₹20 LPA placement range",
    color: "orange",
    isAccelerator: true,
    link: "/customer-success-program",
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; icon: string; button: string }> = {
    purple: { bg: "bg-purple-100", icon: "text-purple-600", button: "border-purple-300 text-purple-600 hover:bg-purple-50" },
    green: { bg: "bg-green-100", icon: "text-green-600", button: "border-green-300 text-green-600 hover:bg-green-50" },
    pink: { bg: "bg-pink-100", icon: "text-pink-600", button: "border-pink-300 text-pink-600 hover:bg-pink-50" },
    orange: { bg: "bg-orange-100", icon: "text-orange-600", button: "border-orange-300 text-orange-600 hover:bg-orange-50" },
  };
  return colors[color] || colors.purple;
};

export default function Programs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight font-heading" data-testid="text-programs-title">
              Our Programs
            </h1>
            <p className="text-xl text-white/90 mt-4 max-w-3xl">
              Work-integrated learning programs that combine education with real industry experience
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-bold text-gray-900">Choose Program</h3>
                <p className="text-sm text-gray-600">Select a program aligned with your career goals</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-bold text-gray-900">Get Placed</h3>
                <p className="text-sm text-gray-600">Secure a job with our partner companies</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-orange-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-bold text-gray-900">Learn & Earn</h3>
                <p className="text-sm text-gray-600">Study while working and earning a salary</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-pink-600 font-bold text-lg">4</span>
                </div>
                <h3 className="font-bold text-gray-900">Graduate Ready</h3>
                <p className="text-sm text-gray-600">Complete with degree and work experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Programs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10" data-testid="text-available-programs">
            Available Programs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {programs.map((program) => {
              const colors = getColorClasses(program.color);
              const isAccelerator = (program as any).isAccelerator;
              const programLink = (program as any).link;
              
              return (
                <Card 
                  key={program.id} 
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border ${isAccelerator ? 'border-orange-200 ring-1 ring-orange-100' : program.id === 1 ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}
                  data-testid={`program-card-${program.id}`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                        {isAccelerator ? (
                          <Zap className={`h-6 w-6 ${colors.icon}`} />
                        ) : (
                          <GraduationCap className={`h-6 w-6 ${colors.icon}`} />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {program.duration}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900">{program.title}</h3>
                    
                    <div className="flex items-start">
                      <BookOpen className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">You'll Learn</span>
                        <p className="text-sm text-gray-600">{program.skills}</p>
                      </div>
                    </div>

                    {/* Show Explore button for program 1 (PGDM) and program 3 (Accelerator) */}
                    {programLink && (
                      <div className="pt-2">
                        <p className={`text-sm font-medium mb-3 ${isAccelerator ? 'text-orange-600' : 'text-purple-600'}`}>
                          {program.earnings}
                        </p>
                        <Link href={programLink} onClick={() => window.scrollTo(0, 0)}>
                          <Button className={`w-full text-white font-semibold rounded-full ${
                            isAccelerator 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                          }`}>
                            Explore Program
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 font-heading" data-testid="text-cta-title">
            Not Sure Which Program?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Talk to our counselors and find the perfect fit for your career goals
          </p>
          <Button 
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full shadow-lg"
            data-testid="button-schedule-call"
            onClick={() => {
              if ((window as any).Calendly) {
                (window as any).Calendly.initPopupWidget({ url: 'https://calendly.com/aastha-skillveda/30min' });
              }
            }}
          >
            Schedule a Call
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}