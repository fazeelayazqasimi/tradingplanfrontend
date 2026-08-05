import { useState } from 'react';
export default function Terms() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <section className="bg-gradient-to-br from-dark-900 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-dark-300 mt-2">Effective Date: ____</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-dark-100 rounded-2xl p-6 sm:p-10 shadow-card">
            <h2 className="text-xl font-bold text-ink mb-6">Welcome to The 4X Hub</h2>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-6">By creating an account, purchasing a membership, or using any of our services, you confirm that you have read, understood, and agreed to the following Terms & Conditions, Privacy Policy, and Risk Disclaimer.</p>

            <h3 className="text-lg font-bold text-ink mb-3">1. Our Services</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">The 4X Hub provides educational and business-related services, including Forex Education, Physical Classes (Karachi), Live Online Classes, Trading Signals, Copy Trading, Affiliate Program, and Profit Sharing (where applicable). All services are provided according to the company's policies and may be updated or modified at any time.</p>

            <h3 className="text-lg font-bold text-ink mb-3">2. Membership</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">Premium Membership is available for USD $120 per year. An active membership provides access to eligible educational resources, trading services, affiliate features, and other benefits offered by The 4X Hub. Membership fees are generally non-refundable once premium access has been activated, except where required by applicable law or approved by the company.</p>

            <h3 className="text-lg font-bold text-ink mb-3">3. Affiliate Program</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">Members may participate in the Affiliate Program according to the official Compensation Plan. Affiliate rewards depend on eligible referrals, business activity, and qualification requirements. The company does not guarantee any specific income or financial results. Fraud, fake registrations, multiple accounts, misleading promotions, or abuse of the compensation plan may result in account suspension or permanent termination.</p>

            <h3 className="text-lg font-bold text-ink mb-3">4. Wallet, Deposits &amp; Withdrawals</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">The platform may provide Funding Wallet, Affiliate Wallet, and Profit Share Wallet. Deposits and withdrawals are processed according to company policy. The company reserves the right to verify transactions, request identity verification (KYC), delay, reject, or suspend withdrawals where fraudulent or suspicious activity is detected. Funding Wallet balances may only be used for approved internal platform services unless otherwise permitted by company policy.</p>

            <h3 className="text-lg font-bold text-ink mb-3">5. Trading Signals &amp; Copy Trading</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">Trading Signals and Copy Trading are provided for educational and informational purposes only. Forex and financial markets involve substantial risk. The 4X Hub does not guarantee trading profits, winning trades, investment returns, profit sharing amounts, or affiliate income. Past performance should never be considered a guarantee of future results. Members are solely responsible for their own trading decisions.</p>

            <h3 className="text-lg font-bold text-ink mb-3">6. Risk Disclaimer</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">Trading Forex, cryptocurrencies, and other financial markets carries significant financial risk. Members should only trade funds they can afford to lose. The 4X Hub, its management, educational partners, trainers, and affiliates shall not be liable for any trading losses, investment decisions, or financial outcomes resulting from the use of the platform.</p>

            <h3 className="text-lg font-bold text-ink mb-3">7. Privacy Policy</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">The 4X Hub collects personal information required to operate and secure the platform, including account registration, memberships, transactions, and customer support. Your personal information is protected and will not be sold to third parties. Information may only be disclosed where required by law or to trusted service providers supporting the operation of the platform. The website may use cookies to improve user experience and website performance.</p>

            <h3 className="text-lg font-bold text-ink mb-3">8. AML &amp; KYC</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">To maintain a secure platform and comply with anti-fraud requirements, The 4X Hub may request identity verification before processing certain services or withdrawals. Accounts involved in fraudulent activities, fake registrations, payment abuse, money laundering, or policy violations may be suspended or permanently terminated.</p>

            <h3 className="text-lg font-bold text-ink mb-3">9. Intellectual Property</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">All website content, logos, educational materials, graphics, videos, branding, and digital resources are the intellectual property of The 4X Hub. No content may be copied, reproduced, or distributed without prior written permission.</p>

            <h3 className="text-lg font-bold text-ink mb-3">10. Policy Updates</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">The 4X Hub reserves the right to update or modify these policies at any time. Any changes become effective immediately upon publication on the official website. Continued use of the platform constitutes acceptance of the updated policies.</p>

            <h3 className="text-lg font-bold text-ink mb-3">User Agreement</h3>
            <p className="text-dark-500 text-[14px] leading-relaxed font-inter mb-4">By selecting "I Accept the Terms &amp; Conditions", registering an account, or using The 4X Hub platform, you confirm that: You have read and understood these Terms &amp; Conditions. You agree to the Privacy Policy and Risk Disclaimer. You understand that Forex trading and Copy Trading involve financial risk. You acknowledge that trading profits, affiliate income, and profit sharing are not guaranteed. You agree to comply with all current and future platform policies.</p>

            <div className="mt-8 pt-6 border-t border-dark-100 text-center">
              <p className="text-ink font-bold text-lg">The 4X Hub</p>
              <p className="text-dark-400 text-sm mt-1">Learn • Trade • Earn • Grow</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}