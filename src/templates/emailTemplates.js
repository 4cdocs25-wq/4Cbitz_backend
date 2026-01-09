// Email template with responsive HTML and inline CSS

export const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to 4CBitz</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #292A77 0%, #1a1b4d 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                Welcome to <br> 4C BZ Management Services
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                                A vertical of 4C Integrated Communicators
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; margin: 0 0 10px 0; font-size: 16px;">
                                Dear ${userName},
                            </p>

                            <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px; font-weight: bold;">
                                Welcome aboard!
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                                We're delighted that you've chosen the <strong>Navigating business ventures in the UAE</strong> — your comprehensive resource for starting and growing a business in the United Arab Emirates.
                            </p>

                            <div style="background-color: #f8f9fa; border-left: 4px solid #292A77; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #292A77; margin: 0 0 15px 0; font-size: 18px;">
                                    Inside this guide, you'll find:
                                </h3>
                                <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px; list-style: none;">
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Step-by-step instructions on starting a company in the UAE
                                    </li>
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Key legal and compliance requirements every entrepreneur must know
                                    </li>
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Insights into banking, taxation, and licensing processes
                                    </li>
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Practical tips for navigating cultural and business etiquette
                                    </li>
                                    <li style="padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Resources to help you scale confidently in one of the world's fastest-growing markets
                                    </li>
                                </ul>
                            </div>

                            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                This guide is designed to save you time, reduce uncertainty, and empower you with the clarity needed to make informed decisions.
                            </p>

                            <div style="background-color: #eff6ff; border-left: 4px solid #292A77; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #292A77; margin: 0 0 15px 0; font-size: 18px;">
                                    Next Steps:
                                </h3>
                                <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                                    <li>Access and explore your guide right away.</li>
                                    <li>Refer for updated information and use as reference when communicating with consultants.</li>
                                    <li>Keep it handy as your go-to reference throughout your UAE business journey.</li>
                                </ul>
                            </div>

                            <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 16px;">
                                We're excited to be part of your entrepreneurial success story. If you have any questions or need further support, feel free to reach out to us at
                                <a href="mailto:4cdoc@4cbz.com" style="color: #292A77; text-decoration: none;">4cdoc@4cbz.com</a>.
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 15px 0 0 0; font-size: 16px; font-style: italic;">
                                Here's to building your future in the UAE!
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
                                Warm regards,<br>
                                <strong>4C BZ Management Services</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #999999; margin: 0 0 10px 0; font-size: 12px;">
                                © ${new Date().getFullYear()} 4C BZ Management Services. All rights reserved.
                            </p>
                            <p style="color: #999999; margin: 0; font-size: 12px;">
                                P O Box 48707, Level 14, Boulevard Plaza Tower 1, Downtown Dubai, Dubai, UAE
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const paymentSuccessEmailTemplate = (userName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - 4CBitz</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header with Success Icon -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <div style="background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                Payment Successful!
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Thank you for your purchase
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; margin: 0 0 10px 0; font-size: 16px;">
                                Dear ${userName},
                            </p>

                            <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px; font-weight: bold;">
                                Thank you for your purchase!
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                                We're excited to welcome you to the <strong>4C BZ</strong> community.
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                Your payment has been successfully received. Your access link to the guide is ready below:
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.FRONTEND_URL || 'http://4cbz.com'}"
                                           style="display: inline-block; background-color: #292A77; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                            Access Your Guide
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="background-color: #f8f9fa; border-left: 4px solid #292A77; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #292A77; margin: 0 0 15px 0; font-size: 18px;">
                                    Inside the guide, you'll discover:
                                </h3>
                                <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px; list-style: none;">
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Step-by-step instructions for launching your business in the UAE
                                    </li>
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Key legal, compliance, and licensing requirements
                                    </li>
                                    <li style="padding-left: 25px; position: relative; margin-bottom: 10px;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Insights into banking, taxation, and business culture
                                    </li>
                                    <li style="padding-left: 25px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Practical tips to help you launch and scale with confidence
                                    </li>
                                </ul>
                            </div>

                            <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 16px;">
                                We're confident this guide will serve as a valuable companion on your entrepreneurial journey.
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 15px 0 0 0; font-size: 16px;">
                                If you have any questions or need support, please reach out to us at
                                <a href="mailto:4CDoc@4CBZ.com" style="color: #292A77; text-decoration: none;">4CDoc@4CBZ.com</a>
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 15px 0 0 0; font-size: 16px; font-style: italic;">
                                Wishing you success and growth in your UAE venture! 🎊
                            </p>

                            <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
                                Warm regards,<br>
                                <strong>4C BZ Management Services</strong><br>
                                <span style="font-size: 14px; color: #999999;">
                                    P O Box 48707, Level 14, Boulevard Plaza Tower 1,<br>
                                    Downtown Dubai, Dubai, UAE<br>
                                    Tel: +971 4 2288006 | Email: 4CDoc@4CBZ.com
                                </span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #999999; margin: 0 0 10px 0; font-size: 12px;">
                                © ${new Date().getFullYear()} 4C BZ Management Services. All rights reserved.
                            </p>
                            <p style="color: #999999; margin: 0; font-size: 12px;">
                                P O Box 48707, Level 14, Boulevard Plaza Tower 1, Downtown Dubai, Dubai, UAE
                            </p>
                            <p style="color: #999999; margin: 10px 0 0 0; font-size: 12px;">
                                Tel: +971 4 2288006 | Email: 4cdoc@4cbz.com
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};
