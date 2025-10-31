import React from "react";
import AppLayout from "../components/AppLayout";

export default function TermsOfService() {
  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto text-gray-800 dark:text-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Terms of Service
        </h1>
        <p className="mb-4">
          By using this dashboard, you agree to use it responsibly and follow
          all applicable laws. Do not misuse the service or attempt unauthorized
          access.
        </p>
        <p>
          This service is provided “as is” without warranties. We are not
          responsible for any damages from use of this app.
        </p>
      </div>
    </AppLayout>
  );
}
