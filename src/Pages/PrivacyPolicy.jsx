import { Link } from "react-router-dom";
import PolicyLayout from "../Layout/PolicyLayout";

export default function PrivacyPolicy() {
    return (
        <PolicyLayout title="Privacy Policy" lastUpdated="January 2026">

            <p>
                SwadBest values your privacy. This Privacy Policy explains how we
                collect, use, and protect your personal information when you use
                our website and services.
            </p>

            <h2 className="font-semibold">Information We Collect</h2>
            <ul className="list-disc pl-5">
                <li>Account details such as name, email, and phone number</li>
                <li>Order and payment-related information</li>
                <li>Messages submitted through our contact form</li>
                <li>Usage data collected via cookies and analytics tools</li>
            </ul>

            <h2 className="font-semibold">How We Use Your Information</h2>
            <ul className="list-disc pl-5">
                <li>To process orders and payments</li>
                <li>To manage user accounts and order history</li>
                <li>To improve website performance and user experience</li>
                <li>To respond to customer queries</li>
            </ul>

            <h2 className="font-semibold">Data Security</h2>
            <p>
                We implement reasonable security measures to protect your data.
                However, no online transmission is completely secure.
            </p>

            <h2 className="font-semibold">Third-Party Services</h2>
            <p>
                We may use trusted third-party services such as payment gateways
                and analytics providers. These services follow their own privacy policies.
            </p>

            <h2 className="font-semibold">Your Rights</h2>
            <p>
                You may request access, correction, or deletion of your personal data
                by contacting us.
            </p>

            <h2 className="font-semibold">Contact Us</h2>
            <p>
                If you have any questions regarding this Privacy Policy,
                please contact us through our website.
            </p>
            <Link
                to="/contact"
                className="
        inline-flex items-center gap-2
        rounded-xl bg-orange-600
        px-6 py-3
        text-sm font-semibold text-white
        shadow-md
        transition-all duration-300
        hover:bg-orange-700 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
      "
            >
                Contact Us
                <span className="text-lg">→</span>
            </Link>

        </PolicyLayout>
    );
}
