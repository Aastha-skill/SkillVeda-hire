import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Flag, GraduationCap, Briefcase, Users, Target, Heart, Lightbulb, Rocket, Star, Building, Award } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/footer";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce" />
        <div className="absolute bottom-32 left-48 w-20 h-20 bg-indigo-200 rounded-full opacity-25 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-700 text-sm font-medium">
              <Flag className="h-5 w-5 mr-3" />
              Our Story & Mission
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight font-heading">
              Transforming Education with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Purpose</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              SkillVeda is reimagining education for the modern Indian workforce. We believe in learning through doing, earning while studying, and building careers with dignity.
            </p>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Manifesto</span>
            </h2>
            <p className="text-xl text-gray-600 italic">
              "Degrees with Dignity. Skills with Substance. India with Purpose."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-2xl shadow-lg" data-testid="card-manifesto-1">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">We believe education should liberate, not burden.</h3>
                    <p className="text-gray-600">Accessible, affordable, and applied education that transforms potential into performance. No student should start their career in debt.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-2xl shadow-lg" data-testid="card-manifesto-2">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">We believe students deserve more than classrooms.</h3>
                    <p className="text-gray-600">Real growth happens on the field—inside companies, on the job, in moments of action. Theory without practice is incomplete education.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl shadow-lg" data-testid="card-manifesto-3">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">We believe skills are the new currency.</h3>
                    <p className="text-gray-600">It's not your degree title but your capability that counts in today's world. We focus on building real skills that employers value.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-2xl shadow-lg" data-testid="card-manifesto-4">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Flag className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">We believe in rebuilding the Indian dream.</h3>
                    <p className="text-gray-600">Creating patriotic professionals who contribute to the country's growth. Every student we empower is a step towards a stronger India.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl">
            <p className="text-lg text-gray-300 mb-2">We are not here to compete.</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              We are here to change the game.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-4">
                  <Target className="h-4 w-4 mr-2" />
                  Our Mission
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                  Democratizing Quality Education
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To provide accessible, affordable, and applied education that combines academic excellence with real-world industry experience, enabling every student to build a successful career without financial burden.
                </p>
              </div>
              
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
                  <Star className="h-4 w-4 mr-2" />
                  Our Vision
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                  Building India's Future Workforce
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become India's leading work-integrated learning platform, producing industry-ready professionals who contribute meaningfully to the nation's economic growth while achieving personal success.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Students Placed</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Partner Companies</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Placement Rate</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
                <div className="text-gray-600">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 font-heading">
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Values</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-purple-50 rounded-3xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student First</h3>
              <p className="text-gray-600">Every decision we make starts with the question: "How does this benefit our students?"</p>
            </div>
            
            <div className="text-center p-8 bg-blue-50 rounded-3xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">We strive for excellence in everything—from education quality to industry partnerships.</p>
            </div>
            
            <div className="text-center p-8 bg-green-50 rounded-3xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collaboration</h3>
              <p className="text-gray-600">We believe in the power of partnerships—with companies, universities, and communities.</p>
            </div>
            
            <div className="text-center p-8 bg-orange-50 rounded-3xl hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">We constantly reimagine how education and work can be better integrated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The SkillVeda Difference */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 font-heading">
              The SkillVeda <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Difference</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4 text-red-600 font-bold">✗</span>
                Traditional Education
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Heavy education loans and financial burden</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Theory-focused with limited practical exposure</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Graduate with zero work experience</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Uncertain job prospects after graduation</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-3xl shadow-lg border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 text-green-600 font-bold">✓</span>
                SkillVeda Education
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Earn your degree within your CTC—zero debt</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Learn on the job with real industry projects</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Graduate with 2-3 years of work experience</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>95% placement rate with career growth path</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 font-heading">
            Join Us In Transforming Education
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Be part of the movement to make quality education accessible to all
          </p>
          <Link href="/jobs" onClick={() => window.scrollTo(0, 0)}>
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full shadow-lg"
              data-testid="button-get-started"
            >
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
