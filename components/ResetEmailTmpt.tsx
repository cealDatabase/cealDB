import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  expireTime: number;
  resetLink: string;
}

export const ResetEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  expireTime,
  resetLink,
}) => (
  <div>
    <h1>Hello, {firstName}.</h1>
    
    <div>
      Please click on this link to reset your password:{" "}
      <a href={resetLink}>{resetLink}</a>
      <p>It will be expired after 15 minutes. By {expireTime.toString()}.</p>
    </div>
    <div>If you have any question, please contact CEAL admin at <a href="https://ceal-db.vercel.app/help">https://ceal-db.vercel.app/help</a></div>
  </div>
);
