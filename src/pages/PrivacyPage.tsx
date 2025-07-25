import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const PrivacyPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">
          <strong>Last Updated: {currentDate}</strong>
        </p>
      </div>

      <Card className="shadow-soft border-0">
        <CardContent className="p-8 space-y-6">
          <p className="text-muted-foreground">
            Your privacy is important to us. This Privacy Policy explains how LearnFlow, powered by Alexzo, ("we," "us," or "our") collects, uses, and discloses information about you when you use our application (the "Service").
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information to provide and improve our Service. This includes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>User-Provided Information:</strong> Questions (text and images) you submit for AI responses; optional feedback.</li>
              <li><strong>Automatically Collected Information (via Google Gemini API):</strong> Your queries are processed by Google's Gemini API, subject to Google's Privacy Policy. This may include technical data for API function and improvement. LearnFlow itself does not directly log or store your IP address or detailed device identifiers for long-term tracking.</li>
              <li><strong>Usage Data (Aggregated & Anonymized):</strong> Anonymized data about Service usage (e.g., question counts by subject) for analytics to improve the Service, not personally identifiable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Provide, operate, and maintain our Service</li>
              <li>Process questions and generate AI responses via Google Gemini API</li>
              <li>Improve the Service using aggregated, anonymized usage patterns</li>
              <li>Monitor Service usage for security and stability</li>
              <li>Respond to inquiries or feedback if contact info is provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Sharing and Disclosure</h2>
            <p className="mb-3">
              LearnFlow does not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>AI Service Providers (Google Gemini API for query processing, subject to their policies)</li>
              <li>For Legal Reasons (if required by law or valid public authority requests)</li>
              <li>To Protect Rights (to investigate illegal activities, fraud, safety threats, or violations of our Terms)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Retention and Security</h2>
            <p>
              User-provided questions/images are processed by the AI API and not persistently stored by LearnFlow beyond the session required for a response. We rely on Google's security for data processed via their API. We take reasonable measures to protect your information, but no internet transmission is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Choices and Rights</h2>
            <p>
              You can choose not to provide certain information, which may limit Service features. Rights regarding data processed by Google are subject to Google's policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Children's Privacy</h2>
            <p>
              Our Service is not for children under 13 (or higher applicable age) without parental consent. We don't knowingly collect personal data from children under 13. If you're a parent/guardian and aware your child provided Personal Data, contact us. If we learn we collected Personal Data from children without verified parental consent, we'll remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy. We'll notify you by posting the new policy here and updating the "Last Updated" date. Review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, contact us at:{' '}
              <a href="mailto:alexzomail@proton.me" className="text-primary hover:underline">
                alexzomail@proton.me
              </a>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};