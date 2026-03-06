import { sendSms } from '../_lib/sms';
import type { Env } from '../_lib/db';

interface ContractSmsBody {
  to: string;
  customerName: string;
  vendorName: string;
  vendorCategory: string;
  eventTitle: string;
  unitNumber: string;
  totalAmount: number;
  depositAmount: number;
}

function buildContractMessage(data: ContractSmsBody): string {
  const lines: string[] = [
    `[${data.eventTitle}] 계약 안내`,
    ``,
    `${data.customerName}님, 안녕하세요.`,
    `계약이 완료되었습니다.`,
    ``,
    `▪ 업체: ${data.vendorName} (${data.vendorCategory})`,
    `▪ 동호수: ${data.unitNumber}`,
  ];
  if (data.totalAmount > 0) {
    lines.push(`▪ 계약금액: ${data.totalAmount.toLocaleString()}원`);
    if (data.depositAmount > 0) {
      lines.push(`▪ 계약금: ${data.depositAmount.toLocaleString()}원`);
      lines.push(`▪ 잔금: ${(data.totalAmount - data.depositAmount).toLocaleString()}원`);
    }
  }
  lines.push(``, `감사합니다.`);
  return lines.join('\n');
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const body = await ctx.request.json() as ContractSmsBody;
    if (!body.to) {
      return Response.json({ ok: false, error: '수신 번호가 없습니다.' }, { status: 400 });
    }
    const text = buildContractMessage(body);
    await sendSms(ctx.env, body.to, text);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
};
