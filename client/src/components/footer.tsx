import { Link } from "wouter";
import { useState } from "react";
import { SiLinkedin } from "react-icons/si";
import JobAlertsModal from "@/components/job-alerts-modal";

export default function Footer() {
  const [jobAlertsModalOpen, setJobAlertsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">About</h4>
              <ul className="space-y-2">
                <li><Link href="/about" onClick={() => window.scrollTo(0, 0)} className="text-gray-400 hover:text-white transition-colors">Our Story</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Mission</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Team</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Programs</h4>
              <ul className="space-y-2">
                <li><Link href="/programs" className="text-gray-400 hover:text-white transition-colors">All Programs</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Jobs</h4>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><button onClick={() => setJobAlertsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors text-left">Job Alerts</button></li>
                <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Apply Now</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">For Companies</h4>
              <ul className="space-y-2">
                <li><Link href="/company-partnership" className="text-gray-400 hover:text-white transition-colors">Partner With Us</Link></li>
                <li><Link href="/company-partnership" className="text-gray-400 hover:text-white transition-colors">Hire Talent</Link></li>
                <li><Link href="/company-partnership" className="text-gray-400 hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:hello@skillveda.ai" className="text-gray-400 hover:text-white transition-colors">
                    hello@skillveda.ai
                  </a>
                </li>
                <li>
                  <a 
                    href="https://in.linkedin.com/company/skill-veda" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    data-testid="link-linkedin"
                  >
                    <SiLinkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 SkillVeda. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <JobAlertsModal 
        isOpen={jobAlertsModalOpen} 
        onClose={() => setJobAlertsModalOpen(false)} 
      />
    </>
  );
}
