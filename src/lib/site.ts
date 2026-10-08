/** Public business details; no credentials belong in this module. */
export const site = {
  business: 'LibTech',
  operator: process.env.OPERATOR_NAME || 'Michael Khan',
  supportEmail: process.env.SUPPORT_EMAIL || 'libtech1393@gmail.com',
  refundPolicy:
    process.env.REFUND_POLICY ||
    'Course purchases are generally non-refundable once access has been granted. LibTech reviews refund requests case by case, including duplicate or unauthorized payments and course-access problems we cannot resolve. Partial use or non-use of a course does not automatically qualify for a refund. To request a review, email libtech1393@gmail.com with your account email, course name, payment reference, and reason. Do not send passwords or complete payment-card details. If a refund is approved and processed, access to the refunded course will be removed. Nothing in this policy limits refunds or other remedies required by applicable consumer law.',
  retentionPolicy:
    process.env.DATA_RETENTION_POLICY ||
    'We keep account and learning records to provide your account, course access, progress history, and certificate verification. To request access, correction, or deletion, contact libtech1393@gmail.com from your account email. Requests are reviewed by the operator after identity verification. We may retain records needed for payment disputes, security, or legal obligations; deletion of account or course records may affect access and certificate verification. No automatic deletion schedule is currently applied.',
};
