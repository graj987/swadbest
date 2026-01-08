import PolicyLayout from "../Layout/PolicyLayout";

export default function Terms() {
  return (
    <PolicyLayout title="Terms & Conditions" lastUpdated="January 2026">

      <p>
        By accessing and using SwadBest, you agree to comply with these
        Terms & Conditions.
      </p>

      <h2 className="font-semibold">User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your
        account credentials.
      </p>

      <h2 className="font-semibold">Orders & Payments</h2>
      <p>
        All orders are subject to availability and confirmation.
        Payments must be completed before order processing.
      </p>

      <h2 className="font-semibold">Product Information</h2>
      <p>
        We strive to provide accurate product details, but minor variations
        may occur.
      </p>

      <h2 className="font-semibold">Limitation of Liability</h2>
      <p>
        SwadBest shall not be liable for indirect or consequential damages
        arising from use of the website.
      </p>

      <h2 className="font-semibold">Governing Law</h2>
      <p>
        These terms are governed by the laws of India.
      </p>

    </PolicyLayout>
  );
}
