import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, BookOpen, MessageCircle, Gift } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import Footer from "@/components/footer";

export default function Community() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-heading" data-testid="text-community-title">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn, grow, and connect with ambitious students and professionals building real-world skills.
            </p>
          </div>
          
          <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden" data-testid="card-community">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Job & internship updates</h4>
                        <p className="text-sm text-gray-600">Get notified about the latest opportunities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Learning resources & guidance</h4>
                        <p className="text-sm text-gray-600">Access curated content for skill development</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-2xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Community discussions & mentorship</h4>
                        <p className="text-sm text-gray-600">Connect with peers and industry mentors</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-2xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Gift className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Exclusive opportunities from SkillVeda</h4>
                        <p className="text-sm text-gray-600">Be first to know about special programs</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 lg:p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <SiWhatsapp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                    Ready to Join?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm">
                    Be part of a growing community of learners and professionals
                  </p>
                  <a 
                    href="https://join.slack.com/t/skill-veda/shared_invite/zt-3rt48igzr-vuPTvIaX~rO9hzEerxAvuA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="button-join-whatsapp"
                  >
                    <Button 
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <SiWhatsapp className="mr-2 h-5 w-5" />
                      Join WhatsApp Community
                    </Button>
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    No spam. Only meaningful conversations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
