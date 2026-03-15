import { Link } from "react-router-dom";
import PolicyLayout from "../Layout/PolicyLayout";
import {
  ShieldCheck,
  Database,
  Settings,
  Lock,
  Users,
  UserCheck,
  Mail,
  ArrowRight,
  Icon,
} from "lucide-react";

/* ── section block ── */
function Section(item) {
    const Icon =item.icon;

  return (
    <div className="flex gap-4">
      <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-orange-600" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-black text-stone-900 mb-2">{item.title}</h2>
        {item.children}
      </div>
    </div>
  );
}

/* ── bullet list ── */
function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-stone-500 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="January 2026">

      {/* Intro */}
      <p className="text-sm text-stone-500 leading-relaxed border-l-2 border-orange-200 pl-4 bg-orange-50/50 py-2 rounded-r-lg">
        SwadBest values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
      </p>

      <div className="mt-8 space-y-8">

        {/* 1 */}
        <Section icon={Database} title="Information We Collect">
          <BulletList items={[
            "Account details such as name, email, and phone number",
            "Order and payment-related information",
            "Messages submitted through our contact form",
            "Usage data collected via cookies and analytics tools",
          ]} />
        </Section>

        <div className="border-t border-stone-100" />

        {/* 2 */}
        <Section icon={Settings} title="How We Use Your Information">
          <BulletList items={[
            "To process orders and payments",
            "To manage user accounts and order history",
            "To improve website performance and user experience",
            "To respond to customer queries",
          ]} />
        </Section>

        <div className="border-t border-stone-100" />

        {/* 3 */}
        <Section icon={Lock} title="Data Security">
          <p className="text-sm text-stone-500 leading-relaxed">
            We implement reasonable security measures to protect your data. However, no online transmission is completely secure.
          </p>
        </Section>

        <div className="border-t border-stone-100" />

        {/* 4 */}
        <Section icon={Users} title="Third-Party Services">
          <p className="text-sm text-stone-500 leading-relaxed">
            We may use trusted third-party services such as payment gateways and analytics providers. These services follow their own privacy policies.
          </p>
        </Section>

        <div className="border-t border-stone-100" />

        {/* 5 */}
        <Section icon={UserCheck} title="Your Rights">
          <p className="text-sm text-stone-500 leading-relaxed">
            You may request access, correction, or deletion of your personal data by contacting us at any time.
          </p>
        </Section>

        <div className="border-t border-stone-100" />

        {/* 6 */}
        <Section icon={Mail} title="Contact Us">
          <p className="text-sm text-stone-500 leading-relaxed mb-4">
            If you have any questions regarding this Privacy Policy, our team is happy to help.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Section>

      </div>

      {/* Footer note */}
      <div className="mt-10 pt-6 border-t border-stone-100 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-stone-400 leading-relaxed">
          This policy was last updated in January 2026. We may update it periodically — continued use of our services constitutes acceptance of any changes.
        </p>
      </div>

    </PolicyLayout>
  );
}