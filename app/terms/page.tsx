"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
              Terms of Service
            </span>
          </h1>
          <p className="text-lg md:text-xl text-purple-100/80 text-balance max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using our platform
          </p>
        </div>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-purple-800 leading-relaxed">
                  By accessing and using dexsta, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">2. Use License</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  Permission is granted to temporarily use dexsta for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the platform</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">3. User Responsibilities</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  As a user of dexsta, you agree to:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Only submit music that you own or have the right to submit</li>
                  <li>Respect other users and maintain a positive community environment</li>
                  <li>Not submit content that is illegal, harmful, or violates others' rights</li>
                  <li>Not attempt to circumvent any security measures or payment systems</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">4. Content and Intellectual Property</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  You retain ownership of any content you submit to dexsta.
                </p>
                <p className="text-purple-800 leading-relaxed">
                  You are responsible for ensuring that your content does not infringe on the intellectual property rights of others.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">5. Payment Terms</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  Some features of dexsta may require payment. By making a payment, you agree to:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Pay all fees and charges associated with your use of paid features</li>
                  <li>Provide accurate billing information</li>
                  <li>Authorize us to charge your payment method for applicable fees</li>
                  <li>Understand that all sales are final unless otherwise specified</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">6. Privacy Policy</h2>
                <p className="text-purple-800 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                  to understand our practices.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">7. Termination</h2>
                <p className="text-purple-800 leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, without prior notice or liability, 
                  for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">8. Disclaimer</h2>
                <p className="text-purple-800 leading-relaxed">
                  The information on this platform is provided on an "as is" basis. To the fullest extent permitted by law, 
                  this Company excludes all representations, warranties, conditions and terms relating to our platform and the use of this platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">9. Changes to Terms</h2>
                <p className="text-purple-800 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or 
                  through the platform. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">10. Contact Information</h2>
                <p className="text-purple-800 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at support@dexsta.fun
                </p>
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
