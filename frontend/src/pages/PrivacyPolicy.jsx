import React from "react";
import AppLayout from "../components/AppLayout";

export default function PrivacyPolicy() {
  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto text-gray-800 dark:text-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
        <p className="mb-4">
          We respect your privacy. This app only uses your Google profile
          information (name, email, and profile picture) to authenticate you. No
          extra personal data is stored or shared.
        </p>
        <p>
          For any concerns, contact us at{" "}
          <span className="font-semibold">sam9068khan@gmail.com</span>.
        </p>
      </div>
    </AppLayout>
  );
}
