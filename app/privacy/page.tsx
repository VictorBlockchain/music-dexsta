"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance tracking-tight font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Privacy Policy
            </span>
          </h1>
          <p className="text-lg md:text-xl text-purple-100/80 text-balance max-w-2xl mx-auto leading-relaxed">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>

        {/* Privacy Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">1. Information We Collect</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, submit music, or contact us for support.
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Email address, username, TikTok handle, artist name</li>
                  <li><strong>Profile Information:</strong> Profile image, bio, music platform links, payment preferences</li>
                  <li><strong>Content:</strong> Music submissions, artwork, audio files, reviews, and comments</li>
                  <li><strong>Payment Information:</strong> Billing details processed securely through third-party payment processors</li>
                  <li><strong>Usage Data:</strong> How you interact with our platform, features used, and performance metrics</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process music submissions and facilitate reviews</li>
                  <li>Enable communication between artists and reviewers</li>
                  <li>Process payments and manage billing</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns to improve user experience</li>
                  <li>Detect, prevent, and address technical issues and security concerns</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">3. Information Sharing</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li><strong>Public Content:</strong> Music submissions and reviews are visible to other users as part of the platform's functionality</li>
                  <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist us in operating our platform (e.g., payment processors, cloud storage)</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, user information may be transferred as part of the business assets</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">4. Data Security</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Secure payment processing through certified third-party providers</li>
                </ul>
                <p className="text-purple-800 leading-relaxed mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">5. Data Retention</h2>
                <p className="text-purple-800 leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide you with services. We may retain certain information for longer periods for legitimate business purposes, such as preventing fraud, resolving disputes, and enforcing our agreements.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">6. Your Rights and Choices</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to certain limitations)</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                </ul>
                <p className="text-purple-800 leading-relaxed mt-4">
                  To exercise these rights, please contact us at privacy@dexsta.fun
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">7. Cookies and Tracking</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on our platform:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-purple-800 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">8. Third-Party Services</h2>
                <p className="text-purple-800 leading-relaxed">
                  Our platform may integrate with third-party services (e.g., social media platforms, payment processors). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">9. Children's Privacy</h2>
                <p className="text-purple-800 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">10. Changes to This Policy</h2>
                <p className="text-purple-800 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the service after such changes constitutes acceptance of the updated policy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">11. Contact Us</h2>
                <p className="text-purple-800 leading-relaxed">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-purple-800 font-medium">Email:</p>
                  <p className="text-purple-700">privacy@dexsta.fun</p>
                  <p className="text-purple-800 font-medium mt-2">Support:</p>
                  <p className="text-purple-700">support@dexsta.fun</p>
                </div>
              </div>

              <div className="pt-8 border-t border-purple-200">
                <p className="text-sm text-purple-600 text-center">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
