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
              <div className="text-center mb-8">
                <p className="text-sm text-purple-600">
                  Last updated: 9/27/2025
                </p>
              </div>

              <div>
                <p className="text-purple-800 leading-relaxed mb-6">
                  Dexsta ("we," "our," "us") operates the website and service music.dexsta.fun (the "Service"). This Privacy Policy explains how we collect, use, and protect information from Artists and Users who access or use Dexsta.
                </p>
                <p className="text-purple-800 leading-relaxed mb-6">
                  By using Dexsta, you agree to this Privacy Policy.
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">1. Information We Collect</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We collect the following types of information:
                </p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">a. Information You Provide</h3>
                  <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                    <li>Account details (name, email address, username, password).</li>
                    <li>Profile details (artist name, biography, images).</li>
                    <li>Uploaded content (music, audio, artwork, videos, text).</li>
                    <li>Communications (messages, support requests).</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">b. Information Collected Automatically</h3>
                  <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                    <li>Usage data (log-in times, IP address, device/browser type).</li>
                    <li>Analytics data (interactions with features, streams played, referral sources).</li>
                    <li>Cookies and similar technologies (to improve experience, security, and analytics).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">c. Payment Information</h3>
                  <p className="text-purple-800 leading-relaxed">
                    If you purchase premium services or features, we may collect billing information through secure third-party providers (e.g., Stripe, PayPal). We do not store your full payment card details.
                  </p>
                </div>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">2. How We Use Information</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ol className="list-decimal list-inside text-purple-800 space-y-2 ml-4">
                  <li>Provide and operate Dexsta's services (streaming, hosting, reviews).</li>
                  <li>Authenticate accounts and maintain security.</li>
                  <li>Improve functionality and user experience.</li>
                  <li>Communicate with you about updates, features, or support.</li>
                  <li>Process payments for premium services.</li>
                  <li>Enforce our Terms of Service and comply with legal requirements.</li>
                </ol>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">3. Content Ownership & Rights</h2>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Artists retain full rights to their music, image, name, likeness, and uploaded content.</li>
                  <li>Dexsta only uses your content to provide streaming and display features within the Service.</li>
                  <li>Dexsta does not sell, sublicense, or exploit your content outside of Dexsta without your permission.</li>
                </ul>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">4. Sharing of Information</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We do not sell your personal information. We may share limited data:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>With service providers (e.g., hosting, analytics, payment processors) to operate Dexsta.</li>
                  <li>If required by law, regulation, legal process, or enforceable governmental request.</li>
                  <li>In connection with a merger, acquisition, or sale of Dexsta's assets (with notice provided to you).</li>
                </ul>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">5. Cookies & Tracking</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Keep you logged in.</li>
                  <li>Measure usage and performance.</li>
                  <li>Improve recommendations and features.</li>
                </ul>
                <p className="text-purple-800 leading-relaxed mt-4">
                  You can manage or disable cookies through your browser settings, though some features may stop working.
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">6. Data Security</h2>
                <p className="text-purple-800 leading-relaxed">
                  We use industry-standard security measures to protect your personal data. However, no system is 100% secure. You share and upload at your own risk.
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">7. Data Retention</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  We retain your personal data and uploaded content only as long as necessary to provide the Service.
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>If you delete your account, we will remove personal data and content within a reasonable period, except where retention is required by law.</li>
                </ul>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">8. Your Privacy Rights</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  Depending on your location, you may have rights to:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Access and receive a copy of your personal data.</li>
                  <li>Request correction or deletion of your personal data.</li>
                  <li>Restrict or object to certain data processing.</li>
                  <li>Withdraw consent (if processing was based on consent).</li>
                </ul>
                <p className="text-purple-800 leading-relaxed mt-4">
                  To exercise your rights, contact us at [Insert Contact Email].
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">9. Children's Privacy</h2>
                <p className="text-purple-800 leading-relaxed">
                  Dexsta is not directed to children under 13 (or under the minimum age required in your country). We do not knowingly collect personal data from children. If we learn we have done so, we will delete it.
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">10. International Use</h2>
                <p className="text-purple-800 leading-relaxed">
                  If you access Dexsta from outside [Insert Country], your data may be transferred and processed in [Insert Country] where Dexsta is hosted. By using the Service, you consent to this.
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-purple-800 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-platform notice. Continued use after changes constitutes acceptance.
                </p>
                <div className="border-t border-purple-200 my-6"></div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">12. Contact Us</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  If you have questions or requests about this Privacy Policy, please contact us:
                </p>
                <p className="text-purple-800 font-medium">
                  support@dexsta.fun
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
