import * as React from "react";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

interface EmailTemplateProps {
  username: string;
  password: string;
}

export const WelcomeEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  username,
  password,
}) => (
  <div>
    <h1>
      Hello, {username}. <br /> Welcome to CEAL Stats!
    </h1>
    <div>
      <p>
        Here is your temporary password:{" "}
        <span style={{ fontWeight: 600 }}>{password}</span>
      </p>
      Please sign in at:{" "}
      <a href={`${ROOT_URL}/signin`}>{`${ROOT_URL}/signin`}</a>
      {/* Use ---a href--- in server component. Don't use Link. */}
    </div>
    <div>
      If you have any question, please contact CEAL admin at{" "}
      <a href="https://ceal-db.vercel.app/help">
        https://ceal-db.vercel.app/help
      </a>
    </div>
  </div>
);
