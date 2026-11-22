import React from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-pearl pt-48 pb-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <span className="prospera-pill border-slate-900 mb-8">Legal</span>
          <h1 className="text-7xl md:text-8xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
            Terms of <br /> <span className="italic text-slate-400">Service.</span>
          </h1>
          <p className="text-xl text-slate-500 font-display font-light leading-relaxed">
            Last updated: March 30, 2026. By using The Public Assembly, you agree to these terms of civic engagement.
          </p>
        </motion.div>

        <div className="space-y-16 prose prose-slate prose-xl max-w-none font-display font-light text-slate-600">
          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Shield size={20} />
              </div>
              Acceptance of Terms
            </h2>
            <p>
              The Public Assembly provides a platform for civic action and community organization. By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              User Responsibility
            </h2>
            <p>
              As a user, you are responsible for the content you post and the actions you lead or participate in. You agree to provide accurate information and to act in good faith towards the community and the public interest.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              Prohibited Conduct
            </h2>
            <p>
              You may not use the platform for any illegal purpose, to harass others, or to spread misinformation. We reserve the right to suspend or terminate accounts that violate our Code of Conduct or these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <FileText size={20} />
              </div>
              Intellectual Property
            </h2>
            <p>
              The Public Assembly platform, including its design, code, and content, is protected by intellectual property laws. You retain ownership of the content you post, but grant us a license to use it to operate and promote the platform's mission.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
