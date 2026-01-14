import { Link } from "react-router-dom";
import PolicyLayout from "../Layout/PolicyLayout";

export default function RefundPolicy() {
    return (
        <PolicyLayout title="Refund & Return Policy" lastUpdated="January 2026">

            <p>
                Due to the nature of food products, returns are accepted only
                under specific conditions.
            </p>

            <h2 className="font-semibold">Eligible Cases</h2>
            <ul className="list-disc pl-5">
                <li>Damaged product received</li>
                <li>Incorrect item delivered</li>
            </ul>

            <h2 className="font-semibold">Refund Process</h2>
            <p>
                Approved refunds will be processed to the original payment
                method within a reasonable timeframe.
            </p>

            <h2 className="font-semibold">Contact Support</h2>
            <p>
                To request a refund, please contact us within 48 hours of delivery
                with order details and supporting images.
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
