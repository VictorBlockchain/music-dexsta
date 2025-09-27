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
              <div className="text-center mb-8">
                <p className="text-sm text-purple-600">
                  Last updated: 9/27/2025
                </p>
              </div>

              <div>
                <p className="text-purple-800 leading-relaxed mb-6">
                  Welcome to music.dexsta.fun ("Dexsta" or the "Service"). These Terms of Service ("Terms") govern your use of Dexsta. By using Dexsta, you agree to these Terms. If you do not agree, please do not use the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">1. Definitions</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  <strong>"Artist," "User," "You":</strong> any individual or entity who creates an account or uploads content to Dexsta.
                </p>
                <p className="text-purple-800 leading-relaxed mb-4">
                  <strong>"Content":</strong> any music, audio files, lyrics, images, videos, name, likeness, biography, artwork, or other material you submit to the Service.
                </p>
                <p className="text-purple-800 leading-relaxed">
                  <strong>"Streaming Use":</strong> hosting, caching, buffering, transmitting, and delivering your Content to listeners through Dexsta.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">2. Artist Ownership & Rights</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  <strong>You retain all rights.</strong> You own and keep all rights, title, and interest in and to your Content, including all copyrights, performance rights, image and likeness rights, and publicity rights.
                </p>
                <p className="text-purple-800 leading-relaxed mb-4">
                  <strong>No assignment.</strong> Dexsta does not claim ownership of your Content, your name, your image, or your likeness.
                </p>
                <p className="text-purple-800 leading-relaxed mb-4">
                  <strong>Limited license.</strong> By uploading Content, you grant Dexsta a non-exclusive, worldwide, royalty-free, revocable license solely to:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4 mb-4">
                  <li>Host, store, and stream your Content on Dexsta;</li>
                  <li>Perform necessary technical operations (transcoding, encryption, backups, indexing);</li>
                  <li>Display your name, profile image, or biography on Dexsta alongside your Content.</li>
                </ul>
                <p className="text-purple-800 leading-relaxed mb-4">
                  <strong>No sublicensing or off-platform use.</strong> Dexsta will not sublicense, sell, commercially exploit, or use your Content outside Dexsta without your express written permission.
                </p>
                <p className="text-purple-800 leading-relaxed">
                  <strong>Revocation.</strong> You may remove your Content or terminate your account at any time. Upon removal, Dexsta will stop streaming your Content, except for in-flight streams already in progress.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">3. User Access Rights</h2>
                <p className="text-purple-800 leading-relaxed">
                  Dexsta grants listeners the right to access, stream, and play Content through the Service. This license does not include any right to copy, download, redistribute, or reuse Content outside Dexsta unless the Artist expressly allows it.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">4. Artist Responsibilities</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  By uploading Content, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4 mb-4">
                  <li>You own or have obtained all necessary rights and permissions for the Content;</li>
                  <li>The Content does not infringe on any third-party rights;</li>
                  <li>You are responsible for any royalties, licenses, or payments owed to rights organizations or third parties;</li>
                  <li>The Content does not violate applicable laws.</li>
                </ul>
                <p className="text-purple-800 leading-relaxed">
                  You agree to indemnify and hold Dexsta harmless from any claims arising from your Content.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">5. Content Management & Termination</h2>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Dexsta may suspend, disable, or remove Content that violates these Terms or applicable laws.</li>
                  <li>Dexsta may suspend or terminate accounts in cases of violation.</li>
                  <li>You may terminate your account at any time and remove your Content.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">6. Service Availability</h2>
                <p className="text-purple-800 leading-relaxed">
                  Dexsta provides the Service "as is" and does not guarantee uninterrupted or error-free access. Features may change or be discontinued at any time.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">7. Limitation of Liability</h2>
                <p className="text-purple-800 leading-relaxed mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li>Dexsta is not liable for indirect, incidental, consequential, or punitive damages.</li>
                  <li>Dexsta's total liability for any claim will not exceed the greater of: (a) amounts you paid to Dexsta in the 12 months prior to the claim, or (b) $50.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">8. Changes to Terms</h2>
                <p className="text-purple-800 leading-relaxed">
                  Dexsta may update these Terms from time to time. Material changes will be notified via email or in-platform notice. Continued use after such changes constitutes acceptance. If you disagree, you may stop using the Service and remove your Content.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">9. Governing Law</h2>
                <p className="text-purple-800 leading-relaxed">
                  These Terms are governed by the laws of [Insert State/Country], without regard to conflict of law rules. Any disputes will be resolved in the courts of [Insert City/State].
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">10. General</h2>
                <ul className="list-disc list-inside text-purple-800 space-y-2 ml-4">
                  <li><strong>Severability:</strong> If any provision is held invalid, the rest remains in force.</li>
                  <li><strong>No waiver:</strong> Dexsta's failure to enforce a provision is not a waiver of that right.</li>
                  <li><strong>Entire agreement:</strong> These Terms constitute the full agreement between you and Dexsta regarding your Content and use of the Service.</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-purple-900 mb-4">Contact</h2>
                <p className="text-purple-800 leading-relaxed">
                  For questions about these Terms, please contact: support@dexsta.fun
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
