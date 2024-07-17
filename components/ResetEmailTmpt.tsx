import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  resetLink: string;
}

export const ResetEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  resetLink,
}) => (
  <div>
    <h1>Hello, {firstName}.</h1>
    
    <div>
      Please click on this link to reset your password:{" "}
      <a href={resetLink}>{resetLink}</a>
    </div>
  </div>
);
