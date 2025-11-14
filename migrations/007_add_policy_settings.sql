-- Migration: Add Terms of Service and Privacy Policy settings
-- Description: Insert default Terms of Service and Privacy Policy content into settings table

-- Insert Terms of Service
INSERT INTO settings (key, value, description)
VALUES (
  'terms_of_service',
  '<h2>Terms of Service</h2>
<p>Last updated: 2025</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing and using 4C Management BZ Services, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h3>2. Use License</h3>
<p>Permission is granted to temporarily access the materials (information or software) on 4C Management BZ Services for personal, non-commercial transitory viewing only.</p>

<h3>3. Disclaimer</h3>
<p>The materials on 4C Management BZ Services are provided on an ''as is'' basis. 4C Management BZ Services makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h3>4. Limitations</h3>
<p>In no event shall 4C Management BZ Services or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on 4C Management BZ Services.</p>

<h3>5. Contact Information</h3>
<p>If you have any questions about these Terms, please contact us at support@4cmanagement.com</p>',
  'Terms of Service content displayed to users'
)
ON CONFLICT (key) DO NOTHING;

-- Insert Privacy Policy
INSERT INTO settings (key, value, description)
VALUES (
  'privacy_policy',
  '<h2>Privacy Policy</h2>
<p>Last updated: 2025</p>

<h3>1. Information We Collect</h3>
<p>We collect information that you provide directly to us, including when you create an account, make a purchase, or communicate with us. This may include your name, email address, phone number, and payment information.</p>

<h3>2. How We Use Your Information</h3>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide, maintain, and improve our services</li>
  <li>Process transactions and send related information</li>
  <li>Send you technical notices and support messages</li>
  <li>Respond to your comments and questions</li>
</ul>

<h3>3. Information Sharing</h3>
<p>We do not share your personal information with third parties except as described in this policy or with your consent. We may share information with:</p>
<ul>
  <li>Service providers who assist in our operations</li>
  <li>Professional advisers and auditors</li>
  <li>Law enforcement when required by law</li>
</ul>

<h3>4. Data Security</h3>
<p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>

<h3>5. Your Rights</h3>
<p>You have the right to access, update, or delete your personal information at any time. You can do this by logging into your account or contacting us directly.</p>

<h3>6. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at privacy@4cmanagement.com</p>',
  'Privacy Policy content displayed to users'
)
ON CONFLICT (key) DO NOTHING;
