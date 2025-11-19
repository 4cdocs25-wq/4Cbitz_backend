-- Migration: Add Refund Policy setting
-- Created: 2025-11-18
-- Description: Adds refund_policy setting to the settings table

-- Insert Refund Policy
INSERT INTO settings (key, value, description)
VALUES (
  'refund_policy',
  '<h2>Refund Policy</h2>
<p>Last updated: November 18, 2025</p>

<h3>1. Overview</h3>
<p>At 4Cbitz BZ Management Services, we strive to provide high-quality business setup documentation and guides. This Refund Policy outlines the terms and conditions for refunds on our lifetime subscription service.</p>

<h3>2. Lifetime Subscription</h3>
<p>Our service offers a one-time payment for lifetime access to all premium business setup documents. Once payment is processed and access is granted, the following refund terms apply:</p>

<h3>3. Refund Eligibility</h3>
<ul>
  <li><strong>7-Day Money-Back Guarantee:</strong> You may request a full refund within 7 days of purchase if you are not satisfied with the service.</li>
  <li><strong>Technical Issues:</strong> If you experience persistent technical issues that prevent access to the documents and we cannot resolve them within a reasonable timeframe.</li>
  <li><strong>Duplicate Purchase:</strong> If you accidentally made duplicate purchases for the same service.</li>
</ul>

<h3>4. Non-Refundable Situations</h3>
<p>Refunds will not be issued in the following cases:</p>
<ul>
  <li>After the 7-day refund period has elapsed</li>
  <li>If you have downloaded or extensively accessed the documents</li>
  <li>Change of mind after the refund period</li>
  <li>Violation of our Terms of Service</li>
</ul>

<h3>5. Refund Process</h3>
<p>To request a refund:</p>
<ol>
  <li>Contact our support team at support@4cbitz.com</li>
  <li>Provide your order details and reason for refund</li>
  <li>Our team will review your request within 2-3 business days</li>
  <li>If approved, refunds will be processed to the original payment method within 5-10 business days</li>
</ol>

<h3>6. Partial Refunds</h3>
<p>Partial refunds are not applicable as we offer a complete lifetime subscription package.</p>

<h3>7. Contact Information</h3>
<p>For refund requests or questions about this policy, please contact us at:</p>
<ul>
  <li>Email: support@4cbitz.com</li>
  <li>Phone: +971 (Your Contact Number)</li>
</ul>

<h3>8. Policy Changes</h3>
<p>We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on our website.</p>',
  'Refund Policy content displayed to users'
)
ON CONFLICT (key) DO NOTHING;
