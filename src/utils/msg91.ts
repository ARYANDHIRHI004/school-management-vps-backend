import { env } from "./env.js";

export type FeeAlertSmsType =
  | "due_reminder"
  | "overdue"
  | "payment_received"
  | "custom";

export type Msg91FlowSendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; skipped?: boolean };

const MSG91_FLOW_URL = "https://api.msg91.com/api/v5/flow/";

function flowIdForAlertType(alertType: FeeAlertSmsType): string | undefined {
  switch (alertType) {
    case "due_reminder":
      return env.MSG91_FLOW_ID_DUE_REMINDER;
    case "overdue":
      return env.MSG91_FLOW_ID_OVERDUE;
    case "payment_received":
      return env.MSG91_FLOW_ID_PAYMENT;
    case "custom":
      return env.MSG91_FLOW_ID_CUSTOM ?? env.MSG91_FLOW_ID_DUE_REMINDER;
    default:
      return undefined;
  }
}

export function formatMobileForMsg91(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    return `${env.MSG91_DEFAULT_COUNTRY_CODE}${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  if (digits.length > 10) {
    return digits;
  }
  return null;
}

export function isMsg91Enabled(): boolean {
  return env.MSG91_ENABLED && Boolean(env.MSG91_AUTH_KEY);
}

export function paiseToInrLabel(paise: number): string {
  const rupees = paise / 100;
  return `Rs ${rupees.toFixed(2)}`;
}

type SendFlowInput = {
  alertType: FeeAlertSmsType;
  mobile: string;
  variables: Record<string, string>;
};

export async function sendMsg91FlowSms(
  input: SendFlowInput,
): Promise<Msg91FlowSendResult> {
  if (!isMsg91Enabled()) {
    return { ok: false, error: "MSG91 is not enabled", skipped: true };
  }

  const flowId = flowIdForAlertType(input.alertType);
  if (!flowId) {
    return {
      ok: false,
      error: `No MSG91 flow configured for alert type: ${input.alertType}`,
    };
  }

  const recipients: Record<string, string> = {
    mobiles: input.mobile,
    ...input.variables,
  };

  const body: Record<string, unknown> = {
    flow_id: flowId,
    recipients: [recipients],
  };

  if (env.MSG91_SENDER_ID) {
    body.sender = env.MSG91_SENDER_ID;
  }

  try {
    const response = await fetch(MSG91_FLOW_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authkey: env.MSG91_AUTH_KEY!,
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      type?: string;
      message?: string;
    };

    if (!response.ok || payload.type === "error") {
      return {
        ok: false,
        error: payload.message ?? `MSG91 HTTP ${response.status}`,
      };
    }

    return {
      ok: true,
      messageId: payload.message ?? "unknown",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "MSG91 request failed",
    };
  }
}