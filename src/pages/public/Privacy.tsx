import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
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
            Privacy <br /> <span className="italic text-slate-400">Policy.</span>
          </h1>
          <p className="text-xl text-slate-500 font-display font-light leading-relaxed">
            Last updated: March 30, 2026. Your privacy is fundamental to our mission of trust and transparency.
          </p>
        </motion.div>

        <div className="space-y-16 prose prose-slate prose-xl max-w-none font-display font-light text-slate-600">
          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Shield size={20} />
              </div>
              Data Sovereignty
            </h2>
            <p>
              At The Public Assembly, we believe you own your data. We collect only what is necessary to facilitate civic action and verify impact. We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Eye size={20} />
              </div>
              Information We Collect
            </h2>
            <p>
              We collect your name, email address, and profile information to create your identity within the assembly. For initiatives, we collect location data and documentation (photos, reports) to verify the progress and completion of civic actions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Lock size={20} />
              </div>
              Security Measures
            </h2>
            <p>
              We employ industry-standard encryption and security protocols to protect your data. All sensitive information is stored securely, and access is strictly controlled based on the necessity for platform operation.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <FileText size={20} />
              </div>
              Transparency & Disclosure
            </h2>
            <p>
              As a platform for public action, some information (like your participation in an initiative or your role as a leader) is public by design. This is essential for the accountability and trust required for collective civic work.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
