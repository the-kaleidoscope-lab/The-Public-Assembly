import React from 'react';
import { motion } from 'motion/react';
import { Shield, Heart, Users, CheckCircle } from 'lucide-react';

const CodeOfConduct = () => {
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
            Code of <br /> <span className="italic text-slate-400">Conduct.</span>
          </h1>
          <p className="text-xl text-slate-500 font-display font-light leading-relaxed">
            Last updated: March 30, 2026. Our community is built on mutual respect, integrity, and a shared commitment to the public good.
          </p>
        </motion.div>

        <div className="space-y-16 prose prose-slate prose-xl max-w-none font-display font-light text-slate-600">
          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Shield size={20} />
              </div>
              Core Principles
            </h2>
            <p>
              The Public Assembly is a space for constructive civic action. We expect all members to act with integrity, transparency, and a focus on the common good.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Heart size={20} />
              </div>
              Respect & Inclusion
            </h2>
            <p>
              We value diversity and inclusion. We have zero tolerance for harassment, discrimination, or hate speech based on race, gender, religion, or any other characteristic.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Users size={20} />
              </div>
              Collaborative Spirit
            </h2>
            <p>
              Civic action is a team effort. We encourage open communication, constructive feedback, and a willingness to work together towards shared goals.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-medium text-slate-900 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              Accountability
            </h2>
            <p>
              Leaders and volunteers are accountable to the community. We expect honest reporting of progress, responsible use of resources, and a commitment to delivering on promises.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CodeOfConduct;
