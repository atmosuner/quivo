const E164_PHONE = /^\+[1-9]\d{7,14}$/

/** Strip spaces/dashes and require international E.164 (+country code). */
export function normalizePhoneNumber(raw: string): string | null {
  const normalized = raw.trim().replace(/[\s()-]/g, '')
  if (!E164_PHONE.test(normalized)) return null
  return normalized
}

function billingNotEnabledMessage(projectId?: string): string {
  const projectHint = projectId ? ` Project: ${projectId}.` : ''
  return (
    `SMS billing is not active for this Firebase project yet.${projectHint} If you recently upgraded to Blaze, wait up to 24 hours for billing to propagate. In Google Cloud Console → Billing, confirm this project has a linked billing account with a valid payment method.`
  )
}

function invalidAppCredentialMessage(): string {
  return (
    'App verification failed. Check the "I\'m not a robot" box, then tap Send code. If it still fails, open Firebase → Authentication → Settings → Fraud prevention → reCAPTCHA and set phone enforcement to Audit (or Off) while testing.'
  )
}

function operationNotAllowedMessage(serverMessage: string): string {
  if (/region/i.test(serverMessage)) {
    return (
      'SMS is not allowed for this country yet. In Firebase Console open Authentication → Settings → SMS region policy, choose Allow, and add Turkey (TR) — or your target region — then try again.'
    )
  }

  return (
    'Phone SMS is blocked for this project. Check: (1) Phone provider enabled, (2) Authentication → Settings → SMS region policy allows your country, (3) Blaze billing is enabled for real phone numbers.'
  )
}

export function phoneAuthErrorMessage(error: unknown, projectId?: string): string {
  const { code, message: serverMessage = '' } = (error ?? {}) as {
    code?: string
    message?: string
  }

  if (/BILLING_NOT_ENABLED/i.test(serverMessage)) {
    return billingNotEnabledMessage(projectId)
  }

  if (
    code === 'auth/invalid-app-credential' ||
    /INVALID_APP_CREDENTIAL/i.test(serverMessage)
  ) {
    return invalidAppCredentialMessage()
  }

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Enter a valid phone number with country code (example: +1 555 000 0000).'
    case 'auth/missing-phone-number':
      return 'Enter your phone number with country code.'
    case 'auth/captcha-check-failed':
      return 'Verification check failed. Complete the checkbox and try again.'
    case 'auth/too-many-requests':
      return 'Too many SMS attempts from this device. Wait about 15 minutes before trying again.'
    case 'auth/operation-not-allowed':
      return operationNotAllowedMessage(serverMessage)
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Enable billing (Blaze plan) in Firebase to send real codes.'
    case 'auth/billing-not-enabled':
      return billingNotEnabledMessage(projectId)
    default:
      return serverMessage
        ? `Could not send code: ${serverMessage}`
        : 'Could not send code. Check the number, complete verification, and try again.'
  }
}
